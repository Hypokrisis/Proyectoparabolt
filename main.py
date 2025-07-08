from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel, EmailStr
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from typing import Optional, List, Dict, Any
import uuid
import json

# Load environment variables
load_dotenv()

# Configuration
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "default-secret-key")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 60))

# Initialize Supabase client
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# FastAPI app
app = FastAPI(title="Gym Management System", version="1.0.0")

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def authenticate_user(email: str, password: str):
    try:
        response = supabase.table("administradores").select("*").eq("email", email).execute()
        if not response.data:
            return False
        admin = response.data[0]
        if not verify_password(password, admin["password_hash"]):
            return False
        return {
            "id": admin["id"],
            "email": admin["email"],
            "name": admin.get("nombre", admin["email"]),
            "role": admin.get("rol", "admin")
        }
    except Exception as e:
        print(f"Authentication error: {e}")
        return False

async def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        return payload
    except JWTError:
        raise credentials_exception

# Pydantic models
class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    phone: str
    membership: str = "basic"
    active: bool = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    membership: Optional[str] = None
    active: Optional[bool] = None

class ClassCreate(BaseModel):
    name: str
    instructor: str
    schedule: str
    capacity: int
    description: Optional[str] = None

class PaymentCreate(BaseModel):
    user_id: str
    amount: float
    payment_method: str
    description: Optional[str] = None

class ConfigUpdate(BaseModel):
    key: str
    value: str

# Authentication endpoints
@app.post("/login")
def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Credenciales incorrectas"
        )
    access_token = create_access_token(
        data={
            "sub": user["email"], 
            "role": user["role"], 
            "name": user["name"],
            "user_id": user["id"]
        }
    )
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"]
    }

@app.get("/verify-token")
def verify_token(current_user: dict = Depends(get_current_user)):
    return {
        "valid": True,
        "user": {
            "email": current_user.get("sub"),
            "name": current_user.get("name"),
            "role": current_user.get("role")
        }
    }

# User management endpoints
@app.get("/users")
def get_users(
    page: int = Query(1, ge=1),
    limit: int = Query(10, ge=1, le=100),
    search: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(get_current_user)
):
    try:
        query = supabase.table("memberships").select("*")
        
        if search:
            query = query.or_(f"name.ilike.%{search}%,email.ilike.%{search}%")
        
        if status and status != "all":
            if status == "active":
                query = query.eq("active", True)
            elif status == "inactive":
                query = query.eq("active", False)
        
        # Get total count
        count_response = query.execute()
        total = len(count_response.data) if count_response.data else 0
        
        # Apply pagination
        offset = (page - 1) * limit
        response = query.range(offset, offset + limit - 1).execute()
        
        # Format users data
        users = []
        for user in response.data:
            users.append({
                "id": user.get("id"),
                "card_id": user.get("card_id"),
                "name": user.get("name"),
                "email": user.get("email"),
                "phone": user.get("phone"),
                "membership": user.get("membership", "basic").title(),
                "status": "active" if user.get("active") else "inactive",
                "active": user.get("active", False),
                "lastAccess": user.get("last_access", "Nunca"),
                "created_at": user.get("created_at"),
                "expiration_date": user.get("expiration_date")
            })
        
        return {
            "users": users,
            "total": total,
            "page": page,
            "limit": limit,
            "pages": (total + limit - 1) // limit
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener usuarios: {str(e)}")

@app.post("/users")
def create_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    try:
        card_id = str(uuid.uuid4())[:8].upper()
        user_data = {
            "card_id": card_id,
            "name": user.name,
            "email": user.email,
            "phone": user.phone,
            "membership": user.membership,
            "active": user.active,
            "expiration_date": (datetime.now() + timedelta(days=30)).isoformat(),
            "entry_history": [],
            "created_at": datetime.now().isoformat()
        }
        
        result = supabase.table("memberships").insert(user_data).execute()
        if result.data:
            return {
                "message": "Usuario creado exitosamente",
                "user": result.data[0]
            }
        raise HTTPException(status_code=400, detail="Error al crear usuario")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear usuario: {str(e)}")

@app.put("/users/{card_id}")
def update_user(card_id: str, user: UserUpdate, current_user: dict = Depends(get_current_user)):
    try:
        # Check if user exists
        response = supabase.table("memberships").select("*").eq("card_id", card_id.strip()).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="Usuario no encontrado")
        
        # Prepare updates
        updates = {k: v for k, v in user.dict().items() if v is not None}
        updates["updated_at"] = datetime.now().isoformat()
        
        result = supabase.table("memberships").update(updates).eq("card_id", card_id.strip()).execute()
        
        if result.data:
            return {
                "message": "Usuario actualizado exitosamente", 
                "user": result.data[0]
            }
        raise HTTPException(status_code=400, detail="Error al actualizar usuario")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar usuario: {str(e)}")

@app.delete("/users/{card_id}")
def delete_user(card_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = supabase.table("memberships").delete().eq("card_id", card_id.strip()).execute()
        if result.data:
            return {"message": "Usuario eliminado exitosamente"}
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al eliminar usuario: {str(e)}")

# Metrics endpoints
@app.get("/metrics")
def get_metrics(current_user: dict = Depends(get_current_user)):
    try:
        # Get users data
        users_response = supabase.table("memberships").select("*").execute()
        users = users_response.data or []
        
        # Get classes data
        classes_response = supabase.table("classes").select("*").execute()
        classes = classes_response.data or []
        
        # Get payments data
        payments_response = supabase.table("payments").select("*").execute()
        payments = payments_response.data or []
        
        # Calculate metrics
        total_users = len(users)
        active_users = len([u for u in users if u.get("active")])
        total_classes = len(classes)
        monthly_revenue = sum([p.get("amount", 0) for p in payments if p.get("created_at", "").startswith(datetime.now().strftime("%Y-%m"))])
        
        # Recent activity
        recent_users = sorted(users, key=lambda x: x.get("created_at", ""), reverse=True)[:5]
        
        return {
            "summary": {
                "total_users": total_users,
                "active_users": active_users,
                "inactive_users": total_users - active_users,
                "total_classes": total_classes,
                "monthly_revenue": monthly_revenue,
                "growth_rate": 12.5  # Mock data
            },
            "recent_activity": [
                {
                    "type": "user_registered",
                    "user_name": user.get("name"),
                    "timestamp": user.get("created_at")
                } for user in recent_users
            ],
            "attendance_data": {
                "labels": ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"],
                "data": [120, 190, 170, 210, 240, 180, 150]
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener métricas: {str(e)}")

# Classes endpoints
@app.get("/classes")
def get_classes(current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("classes").select("*").execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener clases: {str(e)}")

@app.post("/classes")
def create_class(class_data: ClassCreate, current_user: dict = Depends(get_current_user)):
    try:
        class_dict = class_data.dict()
        class_dict["created_at"] = datetime.now().isoformat()
        class_dict["id"] = str(uuid.uuid4())
        
        result = supabase.table("classes").insert(class_dict).execute()
        if result.data:
            return {
                "message": "Clase creada exitosamente",
                "class": result.data[0]
            }
        raise HTTPException(status_code=400, detail="Error al crear clase")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al crear clase: {str(e)}")

# Payments endpoints
@app.get("/payments")
def get_payments(current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("payments").select("*").execute()
        return response.data or []
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener pagos: {str(e)}")

@app.post("/payments")
def create_payment(payment: PaymentCreate, current_user: dict = Depends(get_current_user)):
    try:
        payment_dict = payment.dict()
        payment_dict["created_at"] = datetime.now().isoformat()
        payment_dict["id"] = str(uuid.uuid4())
        payment_dict["status"] = "completed"
        
        result = supabase.table("payments").insert(payment_dict).execute()
        if result.data:
            return {
                "message": "Pago registrado exitosamente",
                "payment": result.data[0]
            }
        raise HTTPException(status_code=400, detail="Error al registrar pago")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al registrar pago: {str(e)}")

# Configuration endpoints
@app.get("/config")
def get_config(current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("config").select("*").execute()
        config = {}
        for item in response.data or []:
            config[item["key"]] = item["value"]
        return config
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al obtener configuración: {str(e)}")

@app.post("/config")
def update_config(config: ConfigUpdate, current_user: dict = Depends(get_current_user)):
    try:
        result = supabase.table("config").upsert({
            "key": config.key,
            "value": config.value,
            "updated_at": datetime.now().isoformat()
        }).execute()
        
        return {"message": "Configuración actualizada exitosamente"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al actualizar configuración: {str(e)}")

# Access control endpoints
@app.get("/check_access/{card_id}")
def check_access(card_id: str):
    try:
        response = supabase.table("memberships").select("*").eq("card_id", card_id.strip()).execute()
        if not response.data:
            return {
                "card_id": card_id,
                "access": False,
                "message": "Usuario no encontrado"
            }
        
        user = response.data[0]
        is_active = user.get("active", False)
        expiration_date = user.get("expiration_date")
        
        access_granted = is_active
        if expiration_date:
            try:
                exp_date = datetime.fromisoformat(expiration_date.replace('Z', '+00:00'))
                access_granted = access_granted and datetime.now() < exp_date
            except:
                pass
        
        # Register access attempt
        if access_granted:
            entry_history = user.get("entry_history", [])
            entry_history.append({
                "timestamp": datetime.now().isoformat(),
                "type": "entry"
            })
            
            supabase.table("memberships").update({
                "entry_history": entry_history,
                "last_access": datetime.now().isoformat()
            }).eq("card_id", card_id.strip()).execute()
        
        return {
            "card_id": card_id,
            "access": access_granted,
            "user_name": user.get("name"),
            "active": is_active,
            "expiration": expiration_date,
            "message": "Acceso permitido" if access_granted else "Acceso denegado"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al verificar acceso: {str(e)}")

# Reports endpoints
@app.get("/reports/users")
def get_user_reports(current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("memberships").select("*").execute()
        users = response.data or []
        
        return {
            "total_users": len(users),
            "active_users": len([u for u in users if u.get("active")]),
            "membership_distribution": {
                "basic": len([u for u in users if u.get("membership") == "basic"]),
                "premium": len([u for u in users if u.get("membership") == "premium"]),
                "vip": len([u for u in users if u.get("membership") == "vip"])
            },
            "users": users
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al generar reporte: {str(e)}")

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)