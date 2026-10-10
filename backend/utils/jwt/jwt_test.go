package jwt

import (
	"testing"
	"time"

	"github.com/golang-jwt/jwt/v5"
)

func TestParseTokenValidAndInvalid(t *testing.T) {
	secret := "unit-test-secret-that-is-long-enough"
	token, err := GenerateAccessToken(9, secret, time.Minute)
	if err != nil {
		t.Fatal(err)
	}
	claims, err := ParseToken(token, secret)
	if err != nil || claims.UserID != 9 {
		t.Fatalf("valid token rejected: claims=%v err=%v", claims, err)
	}
	if _, err := ParseToken(token, "different-secret-that-is-long-enough"); err == nil {
		t.Fatal("expected wrong signature to be rejected")
	}
	if _, err := ParseToken("not-a-token", secret); err == nil {
		t.Fatal("expected malformed token to be rejected")
	}
}

func TestParseTokenRejectsExpiredAndWrongAlgorithm(t *testing.T) {
	secret := "unit-test-secret-that-is-long-enough"
	expired := jwt.NewWithClaims(jwt.SigningMethodHS256, Claims{
		UserID: 1, TokenType: "access", RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt:  jwt.NewNumericDate(time.Now().Add(-2 * time.Hour)),
			ExpiresAt: jwt.NewNumericDate(time.Now().Add(-time.Hour)),
		},
	})
	expiredToken, _ := expired.SignedString([]byte(secret))
	if _, err := ParseToken(expiredToken, secret); err != ErrExpiredToken {
		t.Fatalf("expected ErrExpiredToken, got %v", err)
	}
	wrongAlgorithm := jwt.NewWithClaims(jwt.SigningMethodHS512, Claims{
		UserID: 1, TokenType: "access", RegisteredClaims: jwt.RegisteredClaims{
			IssuedAt: jwt.NewNumericDate(time.Now()), ExpiresAt: jwt.NewNumericDate(time.Now().Add(time.Hour)),
		},
	})
	wrongToken, _ := wrongAlgorithm.SignedString([]byte(secret))
	if _, err := ParseToken(wrongToken, secret); err == nil {
		t.Fatal("expected non-HS256 token to be rejected")
	}
}
