package otp

import (
	"crypto/rand"
	"crypto/subtle"
	"fmt"
	"math/big"
)

func Generate() (string, error) {
	max := big.NewInt(1000000)
	n, err := rand.Int(rand.Reader, max)
	if err != nil {
		return "", err
	}
	return fmt.Sprintf("%06d", n.Int64()), nil
}

func CompareOTP(provided, stored string) bool {
	if len(provided) == 0 || len(stored) == 0 {
		return false
	}
	return subtle.ConstantTimeCompare([]byte(provided), []byte(stored)) == 1
}