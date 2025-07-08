"""
Script para iniciar todo el sistema de gestión de gimnasio
"""
import subprocess
import sys
import os
import time
import threading
from pathlib import Path

def run_backend():
    """Ejecutar el servidor FastAPI"""
    print("🔧 Iniciando servidor backend (FastAPI)...")
    try:
        subprocess.run([sys.executable, "main.py"], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al iniciar backend: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Backend detenido por el usuario")

def run_frontend():
    """Ejecutar el servidor de desarrollo de React"""
    print("🎨 Iniciando servidor frontend (React)...")
    frontend_path = Path("frontend")
    
    if not frontend_path.exists():
        print("❌ Directorio 'frontend' no encontrado")
        return
    
    try:
        # Cambiar al directorio frontend
        os.chdir(frontend_path)
        
        # Verificar si node_modules existe
        if not Path("node_modules").exists():
            print("📦 Instalando dependencias de Node.js...")
            subprocess.run(["npm", "install"], check=True)
        
        # Iniciar servidor de desarrollo
        subprocess.run(["npm", "run", "dev"], check=True)
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Error al iniciar frontend: {e}")
    except KeyboardInterrupt:
        print("\n🛑 Frontend detenido por el usuario")
    finally:
        # Volver al directorio raíz
        os.chdir("..")

def check_dependencies():
    """Verificar que todas las dependencias estén instaladas"""
    print("🔍 Verificando dependencias...")
    
    # Verificar Python dependencies
    try:
        import fastapi
        import supabase
        import uvicorn
        print("✅ Dependencias de Python instaladas")
    except ImportError as e:
        print(f"❌ Falta dependencia de Python: {e}")
        print("💡 Ejecuta: pip install -r requirements.txt")
        return False
    
    # Verificar Node.js
    try:
        result = subprocess.run(["node", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Node.js instalado: {result.stdout.strip()}")
        else:
            print("❌ Node.js no encontrado")
            return False
    except FileNotFoundError:
        print("❌ Node.js no está instalado")
        return False
    
    # Verificar npm
    try:
        result = subprocess.run(["npm", "--version"], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ npm instalado: {result.stdout.strip()}")
        else:
            print("❌ npm no encontrado")
            return False
    except FileNotFoundError:
        print("❌ npm no está instalado")
        return False
    
    return True

def main():
    """Función principal para iniciar el sistema completo"""
    print("🚀 Sistema de Gestión de Gimnasio")
    print("=" * 40)
    
    # Verificar dependencias
    if not check_dependencies():
        print("\n❌ Dependencias faltantes. Por favor instálalas antes de continuar.")
        return
    
    print("\n🎯 Iniciando sistema completo...")
    print("   - Backend en puerto 8000")
    print("   - Frontend en puerto 5173")
    print("\n⚠️  Presiona Ctrl+C para detener ambos servidores")
    
    # Crear threads para ejecutar backend y frontend simultáneamente
    backend_thread = threading.Thread(target=run_backend, daemon=True)
    frontend_thread = threading.Thread(target=run_frontend, daemon=True)
    
    try:
        # Iniciar backend
        backend_thread.start()
        time.sleep(3)  # Esperar a que el backend se inicie
        
        # Iniciar frontend
        frontend_thread.start()
        
        # Mantener el script corriendo
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n\n🛑 Deteniendo sistema...")
        print("✅ Sistema detenido correctamente")

if __name__ == "__main__":
    main()