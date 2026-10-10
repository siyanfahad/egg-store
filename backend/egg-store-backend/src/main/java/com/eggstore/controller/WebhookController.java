package com.eggstore.controller;

import com.eggstore.service.RazorpayWebhookService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/webhooks")
@RequiredArgsConstructor
public class WebhookController {

    private final RazorpayWebhookService webhookService;

    /**
     * Raw body must be read as-is (not parsed/re-serialized) before signature verification —
     * re-serializing JSON can change byte-for-byte content and break the signature check.
     * Configure this endpoint's URL in the Razorpay dashboard webhook settings.
     */
    @PostMapping("/razorpay")
    public ResponseEntity<Void> razorpayWebhook(
            @RequestBody String rawPayload,
            @RequestHeader("X-Razorpay-Signature") String signature) {
        webhookService.handle(rawPayload, signature);
        return ResponseEntity.ok().build();
    }
}
