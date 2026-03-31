import type { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (value: any, item: T) => ReactNode;
  sortable?: boolean;
  width?: string;
}

export interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  onSort?: (key: string) => void;
  sortKey?: string;
  sortOrder?: 'asc' | 'desc';
  onRowClick?: (item: T) => void;
  striped?: boolean;
  hoverable?: boolean;
  className?: string;
  isLoading?: boolean;
  emptyMessage?: string;
}

export function Table<T extends Record<string, any>>({
  data,
  columns,
  onSort,
  sortKey,
  sortOrder,
  onRowClick,
  striped = false,
  hoverable = true,
  className = '',
  isLoading = false,
  emptyMessage = 'No data available',
}: TableProps<T>) {
  return (
    <div className={`overflow-x-auto ${className}`}>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                  column.sortable ? 'cursor-pointer select-none hover:bg-gray-100' : ''
                }`}
                style={{ width: column.width }}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-2">
                  {column.header}
                  {column.sortable && sortKey === column.key && (
                    <span className="text-blue-600">
                      {sortOrder === 'asc' ? '↑' : '↓'}
                    </span>
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`bg-white divide-y divide-gray-200`}>
          {isLoading ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                <div className="flex flex-col items-center gap-2">
                  <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>Loading data...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500 italic">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => (
              <tr
                key={index}
                className={`${striped && index % 2 === 1 ? 'bg-gray-50' : ''} ${
                  hoverable ? 'hover:bg-gray-100' : ''
                } ${onRowClick ? 'cursor-pointer' : ''} transition-colors`}
                onClick={() => onRowClick?.(item)}
              >
                {columns.map((column) => (
                  <td key={column.key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {column.render ? column.render(item[column.key], item) : item[column.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
