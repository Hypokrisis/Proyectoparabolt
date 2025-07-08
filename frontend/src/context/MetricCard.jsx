import { useTheme } from './ThemeContext';

const MetricCard = ({ title, value, change, icon, theme }) => {
  return (
    <div className={`p-6 rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}>
      <div className="flex items-center justify-between">
        <h3 className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-300' : 'text-gray-500'}`}>
          {title}
        </h3>
        <div className={`p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className={`text-2xl font-semibold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {value}
        </p>
        {change && (
          <p className={`mt-1 flex items-center text-sm ${change.startsWith('+') ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {change}
            <span className="ml-1">vs último mes</span>
          </p>
        )}
      </div>
    </div>
  );
};

export default MetricCard;