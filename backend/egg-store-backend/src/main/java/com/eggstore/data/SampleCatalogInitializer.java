package com.eggstore.data;

import com.eggstore.entity.Category;
import com.eggstore.entity.Product;
import com.eggstore.entity.ProductVariant;
import com.eggstore.repository.CategoryRepository;
import com.eggstore.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class SampleCatalogInitializer implements CommandLineRunner {

    private static final int SAMPLE_STOCK_PER_PACK = 50;

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;

    @Override
    @Transactional
    public void run(String... args) {
        Category regular = category("Regular Eggs", "Everyday eggs in convenient pack sizes.");
        Category farm = category("Farm Eggs", "Chicken eggs with distinct shell colours and farming styles.");
        Category specialty = category("Specialty Eggs", "Specialty and alternative poultry eggs.");

        int updated = 0;
        updated += upsertProduct(regular, product(
                "Regular White Eggs",
                "Regular white chicken eggs, packed in protective cartons.",
                "/images/products/white-eggs.jpg",
                variant(6, "36", "/images/products/white-6.jpg"),
                variant(12, "72", "/images/products/white-12.jpg"),
                variant(30, "180", "/images/products/white-30.webp"),
                variant(100, "600", null)),
                "Classic White Eggs");
        updated += upsertProduct(farm, product(
                "Brown Chicken Eggs",
                "Fresh brown chicken eggs for breakfast, baking and everyday cooking.",
                "/images/products/assorted-eggs.jpg",
                variant(6, "60", null),
                variant(12, "120", null),
                variant(30, "300", null),
                variant(100, "1000", null)),
                "Brown Shell Eggs");
        updated += upsertProduct(farm, product(
                "Country / Desi Eggs",
                "Country-style desi eggs in convenient packs for your everyday meals.",
                "/images/products/fresh-eggs.jpg",
                variant(6, "90", null),
                variant(12, "180", null),
                variant(30, "450", null),
                variant(100, "1500", null)),
                "Country-Style Desi Eggs");
        updated += upsertProduct(farm, product(
                "Organic / Free-range Eggs",
                "Free-range eggs packed with care. Check supplier details for specific certifications.",
                "/images/products/assorted-eggs.jpg",
                variant(6, "108", null),
                variant(12, "216", null),
                variant(30, "540", null),
                variant(100, "1800", null)),
                "Free-Range Brown Eggs");
        updated += upsertProduct(specialty, product(
                "Kadaknath Eggs",
                "Kadaknath eggs in protective cartons for a distinctive specialty option.",
                "/images/products/fresh-eggs.jpg",
                variant(6, "150", null),
                variant(12, "300", null),
                variant(30, "750", null),
                variant(100, "2500", null)));
        updated += upsertProduct(specialty, product(
                "Duck Eggs",
                "Duck eggs in small and bulk packs for breakfast and home cooking.",
                "/images/products/assorted-eggs.jpg",
                variant(6, "108", null),
                variant(12, "216", null),
                variant(30, "540", null),
                variant(100, "1800", null)));
        updated += upsertProduct(specialty, product(
                "Quail Eggs",
                "Small quail eggs in convenient packs for salads, snacks and appetizers.",
                "/images/products/assorted-eggs.jpg",
                variant(6, "30", null),
                variant(12, "60", null),
                variant(30, "150", null),
                variant(100, "500", null)));

        deactivatePreviousSample();

        if (updated > 0) {
            log.info("Added or updated {} sample egg products.", updated);
        }
    }

    private Category category(String name, String description) {
        Category category = categoryRepository.findByName(name)
                .orElseGet(() -> Category.builder().name(name).build());
        category.setDescription(description);
        category.setActive(true);
        return categoryRepository.save(category);
    }

    private int upsertProduct(Category category, ProductSeed seed, String... previousNames) {
        Product product = productRepository.findFirstByName(seed.name()).orElse(null);
        if (product == null) {
            for (String previousName : previousNames) {
                product = productRepository.findFirstByName(previousName).orElse(null);
                if (product != null) {
                    break;
                }
            }
        }

        boolean isNew = product == null;
        if (isNew) {
            product = Product.builder().name(seed.name()).build();
        }
        product.setName(seed.name());
        product.setCategory(category);
        product.setDescription(seed.description());
        product.setImageUrl(seed.imageUrl());
        product.setActive(true);

        Set<Integer> currentPackSizes = new HashSet<>();
        for (ProductVariant existing : product.getVariants()) {
            VariantSeed desired = seed.variants().stream()
                    .filter(variant -> variant.packSize() == existing.getPackSize())
                    .findFirst()
                    .orElse(null);
            if (desired == null || !currentPackSizes.add(existing.getPackSize())) {
                existing.setActive(false);
                continue;
            }

            updateVariant(existing, desired);
        }

        for (VariantSeed desired : seed.variants()) {
            if (currentPackSizes.contains(desired.packSize())) {
                continue;
            }

            ProductVariant added = ProductVariant.builder()
                    .product(product)
                    .packSize(desired.packSize())
                    .stockQuantity(SAMPLE_STOCK_PER_PACK)
                    .build();
            updateVariant(added, desired);
            product.getVariants().add(added);
        }

        productRepository.save(product);
        return isNew ? 1 : 0;
    }

    private void updateVariant(ProductVariant variant, VariantSeed seed) {
        variant.setPrice(new BigDecimal(seed.price()));
        variant.setImageUrl(seed.imageUrl());
        variant.setActive(true);
        if (variant.getStockQuantity() == null) {
            variant.setStockQuantity(SAMPLE_STOCK_PER_PACK);
        }
    }

    private void deactivatePreviousSample() {
        productRepository.findFirstByName("Omega-3 Enriched Eggs").ifPresent(product -> {
            product.setActive(false);
            product.getVariants().forEach(variant -> variant.setActive(false));
            productRepository.save(product);
        });
    }

    private ProductSeed product(String name, String description, String imageUrl, VariantSeed... variants) {
        return new ProductSeed(name, description, imageUrl, List.of(variants));
    }

    private VariantSeed variant(int packSize, String price, String imageUrl) {
        return new VariantSeed(packSize, price, imageUrl);
    }

    private record ProductSeed(String name, String description, String imageUrl, List<VariantSeed> variants) {}

    private record VariantSeed(int packSize, String price, String imageUrl) {}
}
