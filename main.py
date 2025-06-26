from fastapi import FastAPI
from pydantic import BaseModel
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv

# Cargar variables de entorno desde .env
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

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
# ENDPOINT: BORRAR USUARIO
# -------------------------------

@app.delete("/delete_user")
def delete_user(payload: DeleteUser):
    try:
        result = supabase.table("memberships").delete().eq("card_id", payload.rfid_id).execute()

        if result.data:
            return {"message": f"Usuario con RFID {payload.rfid_id} eliminado correctamente."}
        else:
            return {"detail": "Usuario no encontrado"}, 404

    except Exception as e:
        return {"detail": f"Error al eliminar: {str(e)}"}, 500
