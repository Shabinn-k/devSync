package bcrypt

import "golang.org/x/crypto/bcrypt"

func Hash(password string) (string, error) {
	return HashBytes([]byte(password))
}

func HashBytes(password []byte) (string, error) {
	hash, err := bcrypt.GenerateFromPassword(password, bcrypt.DefaultCost)
	if err != nil {
		return "", err
	}
	return string(hash), nil
}

func Compare(hash, password string) error {
	return bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
}
