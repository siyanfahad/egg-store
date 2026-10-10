package com.eggstore.service;

import com.razorpay.RazorpayClient;
import com.razorpay.RazorpayException;
import com.razorpay.Utils;
import org.json.JSONObject;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

/**
 * Thin wrapper around the Razorpay Java SDK.
 * key-secret and webhook-secret are read from environment variables (see application.yml)
 * and never sent to the frontend — only key-id (public) is exposed to the client.
 */
@Service
public class RazorpayService {

    private final String keyId;
    private final String keySecret;
    private final String webhookSecret;

    public RazorpayService(
            @Value("${app.razorpay.key-id}") String keyId,
            @Value("${app.razorpay.key-secret}") String keySecret,
            @Value("${app.razorpay.webhook-secret}") String webhookSecret
    ) {
        this.keyId = keyId;
        this.keySecret = keySecret;
        this.webhookSecret = webhookSecret;
    }

    public String getPublicKeyId() {
        return keyId;
    }

    /** Creates a Razorpay Order and returns its id, to be handed to the frontend Checkout widget. */
    public String createOrder(BigDecimal amountInRupees, String receiptId) {
        try {
            RazorpayClient client = new RazorpayClient(keyId, keySecret);
            JSONObject options = new JSONObject();
            options.put("amount", amountInRupees.multiply(BigDecimal.valueOf(100)).intValue()); // paise
            options.put("currency", "INR");
            options.put("receipt", receiptId);
            com.razorpay.Order order = client.orders.create(options);
            return order.get("id");
        } catch (RazorpayException e) {
            throw new RuntimeException("Failed to create Razorpay order", e);
        }
    }

    /** Verifies the signature returned by the Checkout widget after payment completion. */
    public boolean verifyPaymentSignature(String razorpayOrderId, String razorpayPaymentId, String razorpaySignature) {
        try {
            JSONObject options = new JSONObject();
            options.put("razorpay_order_id", razorpayOrderId);
            options.put("razorpay_payment_id", razorpayPaymentId);
            options.put("razorpay_signature", razorpaySignature);
            return Utils.verifyPaymentSignature(options, keySecret);
        } catch (RazorpayException e) {
            return false;
        }
    }

    /** Verifies an incoming webhook's signature before trusting its payload. */
    public boolean verifyWebhookSignature(String payload, String signatureHeader) {
        try {
            return Utils.verifyWebhookSignature(payload, signatureHeader, webhookSecret);
        } catch (RazorpayException e) {
            return false;
        }
    }
}
