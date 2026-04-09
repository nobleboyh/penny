package com.piggymetrics.auth.controller;

import com.piggymetrics.auth.domain.User;
import com.piggymetrics.auth.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.oauth2.common.OAuth2AccessToken;
import org.springframework.security.oauth2.provider.OAuth2Authentication;
import org.springframework.security.oauth2.provider.OAuth2Request;
import org.springframework.security.oauth2.provider.token.AuthorizationServerTokenServices;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.math.BigInteger;
import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.KeyFactory;
import java.security.PublicKey;
import java.security.Signature;
import java.security.spec.RSAPublicKeySpec;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/social")
public class SocialLoginController {

    private static final String GOOGLE_TOKENINFO_URL = "https://www.googleapis.com/oauth2/v3/tokeninfo";
    private static final String APPLE_KEYS_URL = "https://appleid.apple.com/auth/keys";

    @Autowired
    private UserService userService;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    @Qualifier("defaultAuthorizationServerTokenServices")
    private AuthorizationServerTokenServices socialTokenServices;

    private final RestTemplate restTemplate = new RestTemplate();

    @RequestMapping(value = "/google", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> googleLogin(@RequestBody Map<String, String> body) {
        String idToken = body.get("idToken");
        if (idToken == null || idToken.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String email = validateGoogleToken(idToken);
        return ResponseEntity.ok(issueTokenForSocialUser(email));
    }

    @RequestMapping(value = "/apple", method = RequestMethod.POST)
    public ResponseEntity<Map<String, Object>> appleLogin(@RequestBody Map<String, String> body) {
        String identityToken = body.get("identityToken");
        if (identityToken == null || identityToken.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }
        String email = validateAppleToken(identityToken);
        return ResponseEntity.ok(issueTokenForSocialUser(email));
    }

    private String validateGoogleToken(String accessToken) {
        try {
            // URL-encode the token to prevent query string injection
            URI uri = UriComponentsBuilder.fromHttpUrl(GOOGLE_TOKENINFO_URL)
                    .queryParam("access_token", accessToken)
                    .build().toUri();
            @SuppressWarnings("unchecked")
            Map<String, Object> info = restTemplate.getForObject(uri, Map.class);
            if (info == null || info.get("email") == null) {
                throw new IllegalArgumentException("Invalid Google token");
            }
            return (String) info.get("email");
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Google token validation failed: " + e.getMessage());
        }
    }

    private String validateAppleToken(String idToken) {
        try {
            String[] parts = idToken.split("\\.");
            if (parts.length != 3) {
                throw new IllegalArgumentException("Invalid Apple identity token format");
            }

            // Verify signature against Apple's public keys
            byte[] headerAndPayload = (parts[0] + "." + parts[1]).getBytes(StandardCharsets.UTF_8);
            byte[] signatureBytes = Base64.getUrlDecoder().decode(padBase64(parts[2]));

            // Fetch Apple's public keys
            @SuppressWarnings("unchecked")
            Map<String, Object> keysResponse = restTemplate.getForObject(APPLE_KEYS_URL, Map.class);
            if (keysResponse == null) {
                throw new IllegalArgumentException("Could not fetch Apple public keys");
            }

            // Decode header to get kid
            String headerJson = new String(Base64.getUrlDecoder().decode(padBase64(parts[0])), StandardCharsets.UTF_8);
            String kid = extractJsonField(headerJson, "kid");

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> keys = (List<Map<String, Object>>) keysResponse.get("keys");
            PublicKey publicKey = findApplePublicKey(keys, kid);

            Signature sig = Signature.getInstance("SHA256withRSA");
            sig.initVerify(publicKey);
            sig.update(headerAndPayload);
            if (!sig.verify(Base64.getUrlDecoder().decode(padBase64(parts[2])))) {
                throw new IllegalArgumentException("Apple token signature verification failed");
            }

            // Parse payload JSON properly
            String payloadJson = new String(Base64.getUrlDecoder().decode(padBase64(parts[1])), StandardCharsets.UTF_8);
            String email = extractJsonField(payloadJson, "email");
            if (email == null || email.isEmpty()) {
                // Fall back to sub (Apple private relay hides email)
                email = extractJsonField(payloadJson, "sub");
            }
            if (email == null || email.isEmpty()) {
                throw new IllegalArgumentException("Could not extract identity from Apple token");
            }
            return email;
        } catch (IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("Apple token validation failed: " + e.getMessage());
        }
    }

    private PublicKey findApplePublicKey(List<Map<String, Object>> keys, String kid) throws Exception {
        for (Map<String, Object> key : keys) {
            if (kid.equals(key.get("kid"))) {
                byte[] nBytes = Base64.getUrlDecoder().decode(padBase64((String) key.get("n")));
                byte[] eBytes = Base64.getUrlDecoder().decode(padBase64((String) key.get("e")));
                BigInteger n = new BigInteger(1, nBytes);
                BigInteger e = new BigInteger(1, eBytes);
                return KeyFactory.getInstance("RSA").generatePublic(new RSAPublicKeySpec(n, e));
            }
        }
        throw new IllegalArgumentException("No matching Apple public key found for kid: " + kid);
    }

    /** Extract a string field value from a simple JSON object (handles quoted strings only). */
    private String extractJsonField(String json, String field) {
        // Use a simple but correct approach: find "field":"value" pattern
        String searchKey = "\"" + field + "\"";
        int keyIdx = json.indexOf(searchKey);
        if (keyIdx < 0) return null;
        int colonIdx = json.indexOf(':', keyIdx + searchKey.length());
        if (colonIdx < 0) return null;
        // Skip whitespace after colon
        int valueStart = colonIdx + 1;
        while (valueStart < json.length() && Character.isWhitespace(json.charAt(valueStart))) valueStart++;
        if (valueStart >= json.length() || json.charAt(valueStart) != '"') return null;
        // Find closing quote, handling escaped quotes
        int start = valueStart + 1;
        StringBuilder sb = new StringBuilder();
        for (int i = start; i < json.length(); i++) {
            char c = json.charAt(i);
            if (c == '\\' && i + 1 < json.length()) {
                sb.append(json.charAt(++i));
            } else if (c == '"') {
                return sb.toString();
            } else {
                sb.append(c);
            }
        }
        return null;
    }

    private String padBase64(String s) {
        int pad = s.length() % 4;
        if (pad == 0) return s;
        StringBuilder sb = new StringBuilder(s);
        for (int i = 0; i < 4 - pad; i++) sb.append('=');
        return sb.toString();
    }

    private Map<String, Object> issueTokenForSocialUser(String username) {
        // Auto-create user on first social login
        try {
            userDetailsService.loadUserByUsername(username);
        } catch (Exception e) {
            User newUser = new User();
            newUser.setUsername(username);
            newUser.setPassword(UUID.randomUUID().toString());
            newUser.setAgeConfirmed(true);
            userService.create(newUser);
        }

        UserDetails userDetails = userDetailsService.loadUserByUsername(username);

        OAuth2Request oAuth2Request = new OAuth2Request(
                Collections.emptyMap(),
                "browser",
                userDetails.getAuthorities(),
                true,
                Collections.singleton("ui"),
                null, null, null, null
        );

        UsernamePasswordAuthenticationToken userAuth =
                new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        OAuth2Authentication authentication = new OAuth2Authentication(oAuth2Request, userAuth);
        OAuth2AccessToken accessToken = socialTokenServices.createAccessToken(authentication);

        Map<String, Object> response = new HashMap<>();
        response.put("access_token", accessToken.getValue());
        response.put("token_type", accessToken.getTokenType());
        response.put("expires_in", accessToken.getExpiresIn());
        response.put("email", username);  // Return email so frontend can use it as account username
        return response;
    }
}
