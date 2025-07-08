# 🏋️ Sistema de Gestión de Gimnasio

Un sistema completo de gestión para gimnasios desarrollado con **FastAPI** (backend) y **React** (frontend), utilizando **Supabase** como base de datos.

## 🚀 Características Principales

### 🔐 **Autenticación y Seguridad**
- Sistema de login con JWT
- Protección de rutas
- Roles de usuario (admin, superadmin)
- Sesiones persistentes

### 👥 **Gestión de Usuarios**
- CRUD completo de miembros
- Diferentes tipos de membresía (Básica, Premium, VIP)
- Sistema de paginación y filtros
- Exportación de datos a CSV
- Control de acceso con tarjetas RFID

### 📊 **Dashboard y Métricas**
- Panel de control con métricas en tiempo real
- Gráficos de asistencia
- Estadísticas de usuarios activos/inactivos
- Análisis de crecimiento

### 🏃 **Gestión de Clases**
- Programación de clases grupales
- Asignación de instructores
- Control de capacidad
- Horarios flexibles

### 💰 **Sistema de Pagos**
- Registro de pagos
- Múltiples métodos de pago
- Seguimiento de estados
- Reportes financieros

### 📈 **Reportes y Análisis**
- Generación de reportes en CSV
- Análisis de distribución de membresías
- Métricas de retención
- Estadísticas financieras

### 🎨 **Personalización**
- Modo oscuro/claro
- Colores personalizables
- Subida de logo personalizado
- Configuración del gimnasio

## 🛠️ **Tecnologías Utilizadas**

### **Backend**
- **FastAPI** - Framework web moderno y rápido
- **Supabase** - Base de datos PostgreSQL en la nube
- **JWT** - Autenticación segura
- **Bcrypt** - Hash de contraseñas
- **Pydantic** - Validación de datos

### **Frontend**
- **React 19** - Biblioteca de interfaz de usuario
- **Tailwind CSS** - Framework de CSS utilitario
- **React Router** - Navegación
- **React Toastify** - Notificaciones
- **React Icons** - Iconografía

## 📋 **Requisitos Previos**

- **Python 3.8+**
- **Node.js 16+**
- **npm** o **yarn**
- Cuenta en **Supabase**

## ⚡ **Instalación Rápida**

### 1. **Clonar el repositorio**
```bash
git clone <tu-repositorio>
cd gym-management-system
```

### 2. **Configurar variables de entorno**
Crea un archivo `.env` en la raíz del proyecto:
```env
# CREDENCIALES SUPABASE
SUPABASE_URL=tu_supabase_url
SUPABASE_KEY=tu_supabase_key

# CONFIG JWT
JWT_SECRET_KEY=tu_jwt_secret_super_seguro
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```

### 3. **Instalar dependencias de Python**
```bash
pip install -r requirements.txt
```

### 4. **Instalar dependencias de Node.js**
```bash
cd frontend
npm install
cd ..
```

### 5. **Configurar base de datos**
```bash
python setup_database.py
```

### 6. **Iniciar el sistema completo**
```bash
python start_system.py
```

## 🗄️ **Estructura de Base de Datos**

### **Tablas Requeridas en Supabase:**

#### **administradores**
```sql
CREATE TABLE administradores (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    nombre TEXT,
    rol TEXT DEFAULT 'admin',
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **memberships**
```sql
CREATE TABLE memberships (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    card_id TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone TEXT,
    membership TEXT DEFAULT 'basic',
    active BOOLEAN DEFAULT true,
    expiration_date TIMESTAMPTZ,
    entry_history JSONB DEFAULT '[]',
    last_access TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **classes**
```sql
CREATE TABLE classes (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    instructor TEXT NOT NULL,
    schedule TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **payments**
```sql
CREATE TABLE payments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT NOT NULL,
    status TEXT DEFAULT 'completed',
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **config**
```sql
CREATE TABLE config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## 🚀 **Uso del Sistema**

### **Acceso Inicial**
- **URL**: http://localhost:5173
- **Email**: admin@gym.com
- **Contraseña**: admin123

### **Funcionalidades Principales**

#### **👥 Gestión de Usuarios**
- Crear, editar y eliminar miembros
- Asignar tipos de membresía
- Controlar estados activo/inactivo
- Exportar listas de usuarios

#### **📊 Dashboard**
- Ver métricas en tiempo real
- Analizar tendencias de crecimiento
- Monitorear actividad reciente

#### **🏃 Clases**
- Programar clases grupales
- Asignar instructores
- Controlar capacidad máxima

#### **💰 Pagos**
- Registrar pagos de membresías
- Seguimiento de estados
- Generar reportes financieros

#### **⚙️ Configuración**
- Personalizar apariencia
- Subir logo del gimnasio
- Configurar información de contacto

## 🔧 **Scripts Útiles**

### **Configuración inicial**
```bash
python setup_database.py
```

### **Iniciar sistema completo**
```bash
python start_system.py
```

### **Solo backend**
```bash
python main.py
```

### **Solo frontend**
```bash
cd frontend
npm run dev
```

## 📱 **API Endpoints**

### **Autenticación**
- `POST /login` - Iniciar sesión
- `GET /verify-token` - Verificar token

### **Usuarios**
- `GET /users` - Listar usuarios (con paginación)
- `POST /users` - Crear usuario
- `PUT /users/{card_id}` - Actualizar usuario
- `DELETE /users/{card_id}` - Eliminar usuario

### **Métricas**
- `GET /metrics` - Obtener métricas del dashboard

### **Clases**
- `GET /classes` - Listar clases
- `POST /classes` - Crear clase

### **Pagos**
- `GET /payments` - Listar pagos
- `POST /payments` - Registrar pago

### **Configuración**
- `GET /config` - Obtener configuración
- `POST /config` - Actualizar configuración

### **Reportes**
- `GET /reports/users` - Reporte de usuarios

### **Control de Acceso**
- `GET /check_access/{card_id}` - Verificar acceso por RFID

## 🎨 **Personalización**

### **Colores del Tema**
El sistema permite personalizar los colores principales desde la página de configuración.

### **Logo Personalizado**
Sube el logo de tu gimnasio desde la configuración (formatos: PNG, JPG, SVG).

### **Modo Oscuro/Claro**
Alterna entre temas claro y oscuro con persistencia automática.

## 🔒 **Seguridad**

- **JWT** para autenticación segura
- **Bcrypt** para hash de contraseñas
- **Validación** de datos con Pydantic
- **CORS** configurado correctamente
- **Protección** de rutas sensibles

## 📞 **Soporte**

Para soporte técnico o consultas:
- 📧 Email: soporte@gymfit.com
- 📱 Teléfono: +1 (555) 123-4567

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**¡Desarrollado con ❤️ para la gestión eficiente de gimnasios!**