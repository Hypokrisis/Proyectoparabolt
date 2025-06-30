from fastapi import FastAPI, Depends, HTTPException, status
from pydantic import BaseModel
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from auth import create_access_token


# Cargar variables de entorno desde .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SECRET_KEY = "clave-secreta-super-segura"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Crear cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Inicializar FastAPI
app = FastAPI()

# Configurar CORS para permitir conexión desde Vite
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# AUTH SETUP
# -------------------------------
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)


def authenticate_user(email: str, password: str):
    try:
        response = supabase.table("administradores").select("*").eq("email", email).execute()
        if not response.data:
            return False

        admin = response.data[0]
        
        print("Email recibido:", email)
        print("Contraseña recibida:", password)
        print("Hash en la base de datos:", admin["password_hash"])

        if not verify_password(password, admin["password_hash"]):
            return False

        return {
            "username": admin["email"],
            "full_name": admin["nombre"],
            "rol": admin["rol"]
        }

    except Exception as e:
        print(f"Error autenticando usuario: {e}")
        return False
        
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Token inválido")

        response = supabase.table("administradores").select("*").eq("email", email).execute()
        if not response.data:
            raise HTTPException(status_code=401, detail="Usuario no encontrado")

        return response.data[0]

    except JWTError:
        raise HTTPException(status_code=401, detail="Token inválido")


@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=401, detail="Credenciales inválidas")

    access_token = create_access_token(data={"sub": user["username"]})
    return {"access_token": access_token, "token_type": "bearer"}

# -------------------------------
# MODELOS DE DATOS
# -------------------------------

class Card(BaseModel):
    card_id: str

class NewUser(BaseModel):
    full_name: str
    email: str
    phone: str
    rfid_id: str
    is_active: bool = True

class DeleteUser(BaseModel):
    rfid_id: str

# -------------------------------
# ENDPOINT: VERIFICAR ACCESO
# -------------------------------

@app.post("/check_access")
def check_access(card: Card):
    response = supabase.table("memberships").select("*").eq("card_id", card.card_id).execute()

    if response.data:
        user = response.data[0]
        if user["active"]:
            return {"access": True, "message": f"Bienvenido, {user['name']}!"}
        else:
            return {"access": False, "message": "Suscripción inactiva."}

    return {"access": False, "message": "Tarjeta no registrada"}

# -------------------------------
# ENDPOINT: REGISTRAR USUARIO
# -------------------------------

@app.post("/register_user")
def register_user(user: NewUser):
    try:
        result = supabase.table("memberships").insert({
            "name": user.full_name,
            "email": user.email,
            "phone": user.phone,
            "card_id": user.rfid_id,
            "active": user.is_active
        }).execute()

        if result.data:
            return {"message": "Usuario registrado", "member_id": result.data[0]["id"]}
        else:
            return {"detail": "No se pudo registrar el usuario"}, 400

    except Exception as e:
        return {"detail": f"Error en el servidor: {str(e)}"}, 500

# -------------------------------
# ENDPOINT: BORRAR USUARIO (solo admins)
# -------------------------------

@app.delete("/delete_user")
def delete_user(payload: DeleteUser, current_user: dict = Depends(get_current_user)):
    try:
        result = supabase.table("memberships").delete().eq("card_id", payload.rfid_id).execute()

        if result.data:
            return {"message": f"Usuario con RFID {payload.rfid_id} eliminado correctamente."}
        else:
            return {"detail": "Usuario no encontrado"}, 404

    except Exception as e:
        return {"detail": f"Error al eliminar: {str(e)}"}, 500
