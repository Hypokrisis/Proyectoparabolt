"""
Script para configurar la base de datos de Supabase con las tablas necesarias
"""
from supabase import create_client, Client
from passlib.context import CryptContext
import os
from dotenv import load_dotenv
import json
from datetime import datetime, timedelta

# Cargar variables de entorno
load_dotenv()

# Configuración de Supabase
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# Inicializar cliente de Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Configuración de hash de contraseñas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin_user():
    """Crear usuario administrador por defecto"""
    try:
        # Verificar si ya existe un admin
        response = supabase.table("administradores").select("*").eq("email", "admin@gym.com").execute()
        
        if not response.data:
            # Crear hash de la contraseña
            hashed_password = pwd_context.hash("admin123")
            
            # Insertar administrador
            admin_data = {
                "email": "admin@gym.com",
                "password_hash": hashed_password,
                "nombre": "Administrador Principal",
                "rol": "admin",
                "created_at": datetime.now().isoformat()
            }
            
            result = supabase.table("administradores").insert(admin_data).execute()
            if result.data:
                print("✅ Usuario administrador creado exitosamente")
                print("📧 Email: admin@gym.com")
                print("🔑 Contraseña: admin123")
            else:
                print("❌ Error al crear usuario administrador")
        else:
            print("ℹ️ Usuario administrador ya existe")
            
    except Exception as e:
        print(f"❌ Error al crear administrador: {e}")

def create_sample_data():
    """Crear datos de ejemplo para el sistema"""
    try:
        # Verificar si ya existen usuarios
        response = supabase.table("memberships").select("*").execute()
        
        if not response.data or len(response.data) < 3:
            # Crear usuarios de ejemplo
            sample_users = [
                {
                    "card_id": "USR001",
                    "name": "Juan Pérez",
                    "email": "juan.perez@email.com",
                    "phone": "+1234567890",
                    "membership": "premium",
                    "active": True,
                    "expiration_date": (datetime.now() + timedelta(days=30)).isoformat(),
                    "entry_history": [],
                    "created_at": datetime.now().isoformat()
                },
                {
                    "card_id": "USR002",
                    "name": "María García",
                    "email": "maria.garcia@email.com",
                    "phone": "+1234567891",
                    "membership": "basic",
                    "active": True,
                    "expiration_date": (datetime.now() + timedelta(days=15)).isoformat(),
                    "entry_history": [],
                    "created_at": datetime.now().isoformat()
                },
                {
                    "card_id": "USR003",
                    "name": "Carlos López",
                    "email": "carlos.lopez@email.com",
                    "phone": "+1234567892",
                    "membership": "vip",
                    "active": False,
                    "expiration_date": (datetime.now() - timedelta(days=5)).isoformat(),
                    "entry_history": [],
                    "created_at": (datetime.now() - timedelta(days=60)).isoformat()
                }
            ]
            
            for user in sample_users:
                result = supabase.table("memberships").insert(user).execute()
                if result.data:
                    print(f"✅ Usuario {user['name']} creado")
                    
        # Crear clases de ejemplo
        classes_response = supabase.table("classes").select("*").execute()
        if not classes_response.data or len(classes_response.data) < 3:
            sample_classes = [
                {
                    "id": "CLS001",
                    "name": "Yoga Matutino",
                    "instructor": "Ana Martínez",
                    "schedule": "Lunes a Viernes 7:00 AM",
                    "capacity": 20,
                    "description": "Clase de yoga para comenzar el día con energía",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "CLS002",
                    "name": "CrossFit Intensivo",
                    "instructor": "Roberto Silva",
                    "schedule": "Martes y Jueves 6:00 PM",
                    "capacity": 15,
                    "description": "Entrenamiento funcional de alta intensidad",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "CLS003",
                    "name": "Spinning",
                    "instructor": "Laura Rodríguez",
                    "schedule": "Miércoles y Viernes 7:00 PM",
                    "capacity": 25,
                    "description": "Clase de ciclismo indoor con música motivadora",
                    "created_at": datetime.now().isoformat()
                }
            ]
            
            for class_data in sample_classes:
                result = supabase.table("classes").insert(class_data).execute()
                if result.data:
                    print(f"✅ Clase {class_data['name']} creada")
        
        # Crear pagos de ejemplo
        payments_response = supabase.table("payments").select("*").execute()
        if not payments_response.data or len(payments_response.data) < 3:
            sample_payments = [
                {
                    "id": "PAY001",
                    "user_id": "USR001",
                    "amount": 50.00,
                    "payment_method": "card",
                    "status": "completed",
                    "description": "Membresía Premium - Enero 2024",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "PAY002",
                    "user_id": "USR002",
                    "amount": 30.00,
                    "payment_method": "cash",
                    "status": "completed",
                    "description": "Membresía Básica - Enero 2024",
                    "created_at": datetime.now().isoformat()
                },
                {
                    "id": "PAY003",
                    "user_id": "USR003",
                    "amount": 80.00,
                    "payment_method": "transfer",
                    "status": "pending",
                    "description": "Membresía VIP - Enero 2024",
                    "created_at": datetime.now().isoformat()
                }
            ]
            
            for payment in sample_payments:
                result = supabase.table("payments").insert(payment).execute()
                if result.data:
                    print(f"✅ Pago {payment['id']} creado")
        
        # Crear configuración por defecto
        config_response = supabase.table("config").select("*").execute()
        if not config_response.data:
            default_config = [
                {"key": "gym_name", "value": "GymFit Pro", "updated_at": datetime.now().isoformat()},
                {"key": "gym_address", "value": "Calle Principal 123, Ciudad", "updated_at": datetime.now().isoformat()},
                {"key": "gym_phone", "value": "+1 (555) 123-4567", "updated_at": datetime.now().isoformat()},
                {"key": "gym_email", "value": "contacto@gymfit.com", "updated_at": datetime.now().isoformat()},
                {"key": "primary_color", "value": "#3b82f6", "updated_at": datetime.now().isoformat()}
            ]
            
            for config in default_config:
                result = supabase.table("config").insert(config).execute()
                if result.data:
                    print(f"✅ Configuración {config['key']} creada")
                    
        print("\n🎉 Datos de ejemplo creados exitosamente!")
        
    except Exception as e:
        print(f"❌ Error al crear datos de ejemplo: {e}")

def verify_tables():
    """Verificar que todas las tablas necesarias existen"""
    tables_to_check = ["administradores", "memberships", "classes", "payments", "config"]
    
    print("🔍 Verificando tablas en Supabase...")
    
    for table in tables_to_check:
        try:
            response = supabase.table(table).select("*").limit(1).execute()
            print(f"✅ Tabla '{table}' existe y es accesible")
        except Exception as e:
            print(f"❌ Error con tabla '{table}': {e}")
            print(f"   Asegúrate de crear la tabla '{table}' en Supabase")

def main():
    """Función principal de configuración"""
    print("🚀 Configurando Sistema de Gestión de Gimnasio")
    print("=" * 50)
    
    # Verificar conexión a Supabase
    try:
        response = supabase.table("administradores").select("*").limit(1).execute()
        print("✅ Conexión a Supabase exitosa")
    except Exception as e:
        print(f"❌ Error de conexión a Supabase: {e}")
        return
    
    # Verificar tablas
    verify_tables()
    
    # Crear administrador
    print("\n👤 Configurando usuario administrador...")
    create_admin_user()
    
    # Crear datos de ejemplo
    print("\n📊 Creando datos de ejemplo...")
    create_sample_data()
    
    print("\n" + "=" * 50)
    print("🎉 ¡Configuración completada!")
    print("\n📋 Información de acceso:")
    print("   🌐 Frontend: http://localhost:5173")
    print("   🔧 Backend: http://localhost:8000")
    print("   📧 Admin Email: admin@gym.com")
    print("   🔑 Admin Password: admin123")
    print("\n🚀 Para iniciar el sistema:")
    print("   1. Backend: python main.py")
    print("   2. Frontend: cd frontend && npm run dev")

if __name__ == "__main__":
    main()