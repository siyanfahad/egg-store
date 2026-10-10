package com.eggstore.service;

import com.eggstore.entity.Order;
import com.eggstore.entity.Payment;
import com.eggstore.entity.enums.OrderStatus;
import com.eggstore.entity.enums.PaymentStatus;
import com.eggstore.exception.BadRequestException;
import com.eggstore.repository.OrderRepository;
import com.eggstore.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class RazorpayWebhookService {

    private final RazorpayService razorpayService;
    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    /**
     * Entry point for POST /webhooks/razorpay.
     * The signature MUST be verified before this method trusts anything in the payload.
     */
    @Transactional
    public void handle(String rawPayload, String signatureHeader) {
        if (!razorpayService.verifyWebhookSignature(rawPayload, signatureHeader)) {
            throw new BadRequestException("Invalid webhook signature");
        }

        JSONObject json = new JSONObject(rawPayload);
        String event = json.optString("event");

        switch (event) {
            case "payment.captured" -> handlePaymentCaptured(json);
            case "payment.failed" -> handlePaymentFailed(json);
            case "refund.processed" -> handleRefundProcessed(json);
            default -> { /* ignore events we don't act on */ }
        }
    }

    private void handlePaymentCaptured(JSONObject json) {
        JSONObject paymentEntity = json.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
        String razorpayOrderId = paymentEntity.optString("order_id");
        String razorpayPaymentId = paymentEntity.optString("id");

        paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(payment -> {
            if (payment.getStatus() == PaymentStatus.CAPTURED) return; // idempotent — already handled

            payment.setRazorpayPaymentId(razorpayPaymentId);
            payment.setStatus(PaymentStatus.CAPTURED);
            payment.setVerifiedAt(Instant.now());
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            if (order.getStatus() == OrderStatus.PENDING) {
                order.setStatus(OrderStatus.CONFIRMED);
                orderRepository.save(order);
            }
        });
    }

    private void handlePaymentFailed(JSONObject json) {
        JSONObject paymentEntity = json.getJSONObject("payload").getJSONObject("payment").getJSONObject("entity");
        String razorpayOrderId = paymentEntity.optString("order_id");

        paymentRepository.findByRazorpayOrderId(razorpayOrderId).ifPresent(payment -> {
            if (payment.getStatus() == PaymentStatus.CAPTURED) return; // don't downgrade a captured payment

            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            order.setStatus(OrderStatus.PAYMENT_FAILED);
            orderRepository.save(order);
        });
    }

    private void handleRefundProcessed(JSONObject json) {
        JSONObject refundEntity = json.getJSONObject("payload").getJSONObject("refund").getJSONObject("entity");
        String razorpayPaymentId = refundEntity.optString("payment_id");

        paymentRepository.findByRazorpayPaymentId(razorpayPaymentId).ifPresent(payment -> {
            payment.setStatus(PaymentStatus.REFUNDED);
            paymentRepository.save(payment);
        });
    }
}
