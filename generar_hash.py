from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Cambia aquí la contraseña que tú quieras
password_plana = "admin123"

# Esto genera el hash
hashed_password = pwd_context.hash(password_plana)

print("Tu contraseña encriptada es:")
print(hashed_password)
