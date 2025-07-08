from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Aquí pon la contraseña que tú vas a usar para entrar
plain_password = "admin123"

hashed = pwd_context.hash(plain_password)
print("Hash generado:", hashed)
