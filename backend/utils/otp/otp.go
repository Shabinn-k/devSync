package security

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"time"
)

// GenerateOTP returns a cryptographically random 6-digit numeric code.
func GenerateOTP() (string, error) {
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

// IsOTPExpired checks if OTP has expired
func IsOTPExpired(expiresAt *time.Time) bool {
	if expiresAt == nil {
		return true
	}
	return time.Now().After(*expiresAt)
}