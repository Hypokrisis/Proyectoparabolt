from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from passlib.context import CryptContext
from jose import jwt
from datetime import datetime, timedelta
from dotenv import load_dotenv
import os
from supabase_client import get_supabase

# Cargar variables del .env
load_dotenv()
SECRET_KEY = os.getenv("JWT_SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Configuración de seguridad
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Inicializar router
router = APIRouter()
supabase = get_supabase()

# Clase para capturar la petición
class LoginRequest(BaseModel):
    email: str
    password: str

# Función para crear el token JWT
def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

# Endpoint de login
@router.post("/login")
async def login(request: LoginRequest):
    email = request.email
    password = request.password

    # Buscar el usuario en Supabase
    result = supabase.table("administradores").select("*").eq("email", email).execute()

    if not result.data or len(result.data) == 0:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    user = result.data[0]
    hashed_password = user["password_hash"]

    if not pwd_context.verify(password, hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Credenciales inválidas")

    token_data = {
        "sub": user["id"],
        "email": user["email"],
        "rol": user["rol"]
    }

    token = create_access_token(token_data)

    return {
        "access_token": token,
        "token_type": "bearer"
    }
