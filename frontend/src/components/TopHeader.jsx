// src/components/TopHeader.jsx
const TopHeader = ({ darkMode, toggleDarkMode, toggleSidebar, sidebarCollapsed, user }) => {
  return (
    <header className={`flex items-center justify-between p-4 border-b ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className={`p-2 rounded-md ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
        >
          {sidebarCollapsed ? '➡️' : '⬅️'}
        </button>
        
        <div className="flex items-center">
          <img 
            src="/logo-gym.png" 
            alt="Gym Logo" 
            className="h-8 mr-2"
          />
          <h1 className="text-xl font-bold hidden md:block">
            <span className={darkMode ? 'text-white' : 'text-gray-800'}>GYM</span>
            <span className="text-blue-600">FIT</span>
          </h1>
        </div>
      </div>
      
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleDarkMode}
          className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
          title={darkMode ? 'Modo claro' : 'Modo oscuro'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
        
        <div className={`flex items-center space-x-2 p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
          <img 
            src={user.avatar} 
            alt="User" 
            className="h-8 w-8 rounded-full"
          />
          <span className={`hidden md:block ${darkMode ? 'text-white' : 'text-gray-800'}`}>
            {user.name}
          </span>
        </div>
        
        <button 
          onClick={() => console.log('Logout')}
          className={`px-3 py-2 rounded-md text-sm font-medium ${darkMode ? 'bg-red-600 hover:bg-red-700' : 'bg-red-500 hover:bg-red-600'} text-white`}
        >
          Salir
        </button>
      </div>
    </header>
  );
};

export default TopHeader;