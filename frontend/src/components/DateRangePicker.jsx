import { useState } from 'react';
import { DateRange } from 'react-date-range';
import { format } from 'date-fns';
import { FiCalendar } from 'react-icons/fi';
import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';

const DateRangePicker = ({ dateRange, setDateRange, theme }) => {
  const [showPicker, setShowPicker] = useState(false);

  const handleSelect = (ranges) => {
    setDateRange({
      start: ranges.selection.startDate,
      end: ranges.selection.endDate
    });
  };

  const selectionRange = {
    startDate: dateRange.start,
    endDate: dateRange.end,
    key: 'selection'
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className={`flex items-center px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-300 text-gray-700'} shadow-sm text-sm font-medium`}
      >
        <FiCalendar className="mr-2" />
        {format(dateRange.start, 'MMM d, yyyy')} - {format(dateRange.end, 'MMM d, yyyy')}
      </button>
      
      {showPicker && (
        <div className={`absolute right-0 mt-2 z-10 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} border rounded-lg shadow-lg`}>
          <DateRange
            ranges={[selectionRange]}
            onChange={handleSelect}
            className={`${theme === 'dark' ? 'date-range-dark' : ''}`}
          />
          <style jsx global>{`
            .date-range-dark .rdrDateDisplayWrapper {
              background-color: #1f2937;
            }
            .date-range-dark .rdrCalendarWrapper {
              background-color: #1f2937;
              color: #f3f4f6;
            }
            .date-range-dark .rdrDayPassive .rdrDayNumber span {
              color: #6b7280;
            }
          `}</style>
        </div>
      )}
    </div>
  );
};

export default DateRangePicker;