import { useTheme } from './ThemeContext';

const SectionCard = ({ title, children, className = '' }) => {
  const { theme } = useTheme();

  return (
    <div
      className={`rounded-lg shadow-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} ${
        theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
      } border ${className}`}
    >
      <div
        className={`px-6 py-4 border-b ${
          theme === 'dark' ? 'border-gray-700' : 'border-gray-200'
        }`}
      >
        <h3 className={`text-lg font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
          {title}
        </h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
};

export default SectionCard;