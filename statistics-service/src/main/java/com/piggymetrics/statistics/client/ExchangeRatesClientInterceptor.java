package com.piggymetrics.statistics.client;

import feign.RequestInterceptor;
import feign.RequestTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class ExchangeRatesClientInterceptor implements RequestInterceptor {

    @Value("${rates.access_key}")
    private String accessKey;

    @Override
    public void apply(RequestTemplate template) {
        template.query("access_key", accessKey);
    }
}
