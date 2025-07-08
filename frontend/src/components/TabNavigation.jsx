const TabNavigation = ({ tabs, activeTab, setActiveTab, theme }) => {
  return (
    <div className={`mb-6 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <nav className="flex -mb-px space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`py-4 px-1 font-medium text-sm border-b-2 transition-colors duration-200 ${
              activeTab === tab.id
                ? theme === 'dark'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-blue-600 text-blue-600'
                : theme === 'dark'
                ? 'border-transparent text-gray-400 hover:text-gray-300'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};

export default TabNavigation;