package com.eggstore.data;

import com.eggstore.entity.Category;
import com.eggstore.entity.Product;
import com.eggstore.entity.ProductVariant;
import com.eggstore.repository.CategoryRepository;
import com.eggstore.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class SampleCatalogInitializerTest {

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private ProductRepository productRepository;

    @Test
    void seedsRealisticProductsOnceWithVariantsAndLocalImages() {
        Map<String, Category> categories = new HashMap<>();
        Map<String, Product> products = new HashMap<>();
        for (String legacyName : List.of(
                "Classic White Eggs",
                "Brown Shell Eggs",
                "Country-Style Desi Eggs",
                "Free-Range Brown Eggs",
                "Quail Eggs",
                "Omega-3 Enriched Eggs")) {
            products.put(legacyName, legacyProduct(legacyName));
        }
        when(categoryRepository.findByName(anyString()))
                .thenAnswer(invocation -> Optional.ofNullable(categories.get(invocation.getArgument(0))));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> {
            Category category = invocation.getArgument(0);
            categories.put(category.getName(), category);
            return category;
        });
        when(productRepository.findFirstByName(anyString()))
                .thenAnswer(invocation -> Optional.ofNullable(products.get(invocation.getArgument(0))));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> {
            Product product = invocation.getArgument(0);
            products.values().removeIf(existing -> existing == product);
            products.put(product.getName(), product);
            return product;
        });

        SampleCatalogInitializer initializer = new SampleCatalogInitializer(categoryRepository, productRepository);
        initializer.run();
        initializer.run();

        verify(productRepository, times(16)).save(any(Product.class));
        assertThat(products).hasSize(8);
        assertThat(products.values())
                .filteredOn(Product::isActive)
                .extracting(Product::getName)
                .containsExactlyInAnyOrder(
                        "Regular White Eggs",
                        "Brown Chicken Eggs",
                        "Country / Desi Eggs",
                        "Organic / Free-range Eggs",
                        "Kadaknath Eggs",
                        "Duck Eggs",
                        "Quail Eggs");
        assertThat(products.get("Omega-3 Enriched Eggs").isActive()).isFalse();
        assertThat(products.values()).filteredOn(Product::isActive).allSatisfy(product -> {
            assertThat(product.getCategory()).isNotNull();
            assertThat(product.getImageUrl()).startsWith("/images/products/");
            assertThat(product.getVariants()).filteredOn(ProductVariant::isActive).hasSize(4).allSatisfy(variant -> {
                assertThat(variant.getProduct()).isSameAs(product);
                assertThat(variant.getPrice()).isPositive();
                assertThat(variant.getStockQuantity()).isPositive();
            });
        assertThat(products.get("Regular White Eggs").getVariants())
            .filteredOn(variant -> variant.getPackSize() == 6)
            .singleElement()
            .extracting(ProductVariant::getStockQuantity)
            .isEqualTo(17);
        });
        assertThat(products.get("Regular White Eggs").getVariants())
                .filteredOn(ProductVariant::isActive)
                .extracting(ProductVariant::getPackSize)
                .containsExactlyInAnyOrder(6, 12, 30, 100);
        assertThat(products.get("Regular White Eggs").getVariants())
                .filteredOn(ProductVariant::isActive)
                .filteredOn(variant -> variant.getPackSize() == 6)
                .singleElement()
                .satisfies(variant -> {
                    assertThat(variant.getPrice()).isEqualByComparingTo("36");
                    assertThat(variant.getImageUrl()).isEqualTo("/images/products/white-6.jpg");
                });
        assertThat(products.get("Brown Chicken Eggs").getVariants())
                .filteredOn(ProductVariant::isActive)
                .filteredOn(variant -> variant.getPackSize() == 100)
                .singleElement()
                .satisfies(variant -> assertThat(variant.getPrice()).isEqualByComparingTo("1000"));
        assertPackPrices(products.get("Regular White Eggs"), "36", "72", "180", "600");
        assertPackPrices(products.get("Brown Chicken Eggs"), "60", "120", "300", "1000");
        assertPackPrices(products.get("Country / Desi Eggs"), "90", "180", "450", "1500");
        assertPackPrices(products.get("Organic / Free-range Eggs"), "108", "216", "540", "1800");
        assertPackPrices(products.get("Kadaknath Eggs"), "150", "300", "750", "2500");
        assertPackPrices(products.get("Duck Eggs"), "108", "216", "540", "1800");
        assertPackPrices(products.get("Quail Eggs"), "30", "60", "150", "500");
        verify(categoryRepository, times(6)).save(any(Category.class));
    }

    private Product legacyProduct(String name) {
        Product product = Product.builder()
                .name(name)
                .category(Category.builder().name("Legacy sample category").build())
                .variants(new ArrayList<>())
                .build();
        for (int packSize : List.of(6, 12, 30)) {
            product.getVariants().add(ProductVariant.builder()
                    .product(product)
                    .packSize(packSize)
                    .price(BigDecimal.ONE)
                    .stockQuantity(17)
                    .build());
        }
        return product;
    }

    private void assertPackPrices(Product product, String... expectedPrices) {
        List<ProductVariant> variants = product.getVariants().stream()
                .filter(ProductVariant::isActive)
                .sorted(Comparator.comparing(ProductVariant::getPackSize))
                .toList();
        assertThat(variants).extracting(ProductVariant::getPackSize).containsExactly(6, 12, 30, 100);
        assertThat(variants)
                .extracting(variant -> variant.getPrice().stripTrailingZeros().toPlainString())
                .containsExactly(expectedPrices);
    }
}
