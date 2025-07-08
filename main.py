from fastapi import FastAPI, Depends, HTTPException, status, Query
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
import os
from dotenv import load_dotenv
from typing import Optional, List
import uuid

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
app = FastAPI()

# OAuth2 scheme
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
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
            "email": admin["email"],
            "name": admin["nombre"],
            "role": admin["rol"]
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
    email: str
    password: str

class UserCreate(BaseModel):
    name: str
    email: str
    phone: str
    active: bool = True

class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    active: Optional[bool] = None

class AccessRecord(BaseModel):
    timestamp: str
    type: str

class UserMetrics(BaseModel):
    card_id: str
    entry_history: List[AccessRecord]
    expiration_date: Optional[str]
    total_entries: int
    active: bool

class GymConfig(BaseModel):
    logo_url: str

# Public endpoints
@app.post("/register_user")
def register_user(user: UserCreate):
    try:
        card_id = str(uuid.uuid4())[:8]
        user_data = user.dict()
        user_data["card_id"] = card_id
        user_data["expiration_date"] = (datetime.now() + timedelta(days=30)).isoformat()
        user_data["entry_history"] = []
        
        result = supabase.table("memberships").insert(user_data).execute()
        if result.data:
            return {
                "message": "User registered successfully",
                "card_id": card_id,
                "user": result.data[0]
            }
        raise HTTPException(status_code=400, detail="Failed to register user")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/login")
def login(request: LoginRequest):
    user = authenticate_user(request.email, request.password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["email"], "role": user["role"], "name": user["name"]})
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user["role"],
        "name": user["name"]
    }

# Protected endpoints
@app.get("/users")
def get_users(current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("memberships").select("*").execute()
        return response.data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users")
def create_user(user: UserCreate, current_user: dict = Depends(get_current_user)):
    try:
        card_id = str(uuid.uuid4())[:8]
        user_data = user.dict()
        user_data["card_id"] = card_id
        user_data["expiration_date"] = (datetime.now() + timedelta(days=30)).isoformat()
        user_data["entry_history"] = []
        
        result = supabase.table("memberships").insert(user_data).execute()
        if result.data:
            return {
                "message": "User created successfully",
                "user": result.data[0]
            }
        raise HTTPException(status_code=400, detail="Failed to create user")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/users/{card_id}")
def update_user(card_id: str, user: UserUpdate, current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.table("memberships").select("*").eq("card_id", card_id.strip()).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        updates = {k: v for k, v in user.dict().items() if v is not None}
        result = supabase.table("memberships").update(updates).eq("card_id", card_id.strip()).execute()
        
        if result.data:
            return {"message": "User updated successfully", "user": result.data[0]}
        raise HTTPException(status_code=400, detail="Failed to update user")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/users/{card_id}")
def delete_user(card_id: str, current_user: dict = Depends(get_current_user)):
    try:
        result = supabase.table("memberships").delete().eq("card_id", card_id.strip()).execute()
        if result.data:
            return {"message": "User deleted successfully"}
        raise HTTPException(status_code=404, detail="User not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Access control endpoints
@app.get("/users/{card_id}/access")
def check_access(card_id: str):
    try:
        response = supabase.table("memberships").select("*").eq("card_id", card_id.strip()).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = response.data[0]
        is_active = user.get("active", False)
        expiration_date = user.get("expiration_date")
        
        access_granted = is_active and (not expiration_date or datetime.now() < datetime.fromisoformat(expiration_date))
        
        return {
            "card_id": card_id,
            "access": access_granted,
            "user_name": user.get("name"),
            "active": is_active,
            "expiration": expiration_date
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/{card_id}/metrics")
def get_user_metrics(card_id: str):
    try:
        response = supabase.table("memberships").select("*").eq("card_id", card_id.strip()).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        user = response.data[0]
        entry_history = user.get("entry_history", [])
        
        return {
            "card_id": card_id,
            "entry_history": entry_history,
            "expiration_date": user.get("expiration_date"),
            "total_entries": len(entry_history),
            "active": user.get("active", False)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/users/{card_id}/access")
def register_access(card_id: str, access_type: str = Query(..., regex="^(entry|exit)$")):
    try:
        response = supabase.table("memberships").select("*").eq("card_id", card_id.strip()).execute()
        if not response.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        new_entry = {
            "timestamp": datetime.now().isoformat(),
            "type": access_type
        }
        
        updated_history = supabase.rpc('append_to_array', {
            'table_name': 'memberships',
            'column_name': 'entry_history',
            'id_value': response.data[0]["id"],
            'new_element': new_entry
        }).execute()
        
        return {"message": "Access recorded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Configuration endpoints
@app.get("/config/logo")
def get_gym_logo():
    try:
        response = supabase.from_("config").select("*").eq("key", "gym_logo").execute()
        if response.data:
            return {"logo_url": response.data[0]["value"]}
        return {"logo_url": ""}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/config/logo")
def update_gym_logo(config: GymConfig, current_user: dict = Depends(get_current_user)):
    try:
        response = supabase.from_("config").upsert({
            "key": "gym_logo",
            "value": config.logo_url
        }).execute()
        
        return {"message": "Logo updated successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))