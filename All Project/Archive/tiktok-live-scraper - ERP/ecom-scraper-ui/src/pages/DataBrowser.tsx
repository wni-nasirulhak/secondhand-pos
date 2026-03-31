import { useState } from 'react';
import { FilterBar } from '../components/data/FilterBar';
import { ProductTable } from '../components/data/ProductTable';
import { ProductDetailModal } from '../components/data/ProductDetailModal';
import { Database, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dataService } from '../services/dataService';
import { toast } from 'react-hot-toast';

export const DataBrowser = () => {
  const queryClient = useQueryClient();
  const [selectedProduct, setSelectedProduct] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filters, setFilters] = useState({
    query: '',
    platform: 'all',
    type: 'all',
    dateRange: 'all',
  });

  // Data fetching
  const { data, isLoading, refetch, isError } = useQuery({
    queryKey: ['scrapedData', filters],
    queryFn: () => dataService.getResults(filters),
    placeholderData: (previousData) => previousData,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => dataService.deleteResult(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scrapedData'] });
      toast.success('Data entry deleted successfully');
    },
    onError: () => {
      toast.error('Failed to delete data entry');
    }
  });

  const handleViewDetails = (id: string) => {
    const product = data?.find((p: any) => p.id === id);
    if (product) {
      setSelectedProduct(product);
      setIsModalOpen(true);
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleExport = (format: 'csv' | 'json') => {
    toast.promise(
      dataService.exportResults(format, filters),
      {
        loading: `Exporting ${format.toUpperCase()}...`,
        success: 'Export started!',
        error: 'Failed to export results',
      }
    );
  };

  const results = data || [];

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Database className="w-8 h-8 text-blue-600" />
            Data Browser
          </h1>
          <p className="text-gray-600">
            Browse, filter, and export all collected scraping results
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            onClick={() => refetch()}
            loading={isLoading}
            icon={<RefreshCw className="w-4 h-4" />}
          >
            Refresh Data
          </Button>
        </div>
      </div>

      <FilterBar
        filters={filters}
        onFilterChange={setFilters}
        onExport={handleExport}
        loading={isLoading}
      />

      {isError ? (
        <div className="p-12 bg-red-50 rounded-2xl border border-red-100 flex flex-col items-center text-center">
          <div className="p-4 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-red-900 mb-2">Error Loading Data</h3>
          <p className="text-red-700 mb-6">Something went wrong while fetching the scraping results.</p>
          <Button variant="danger" onClick={() => refetch()}>
            Try Again
          </Button>
        </div>
      ) : (
        <ProductTable
          data={results}
          onView={handleViewDetails}
          onDelete={handleDelete}
          loading={isLoading}
        />
      )}

      <ProductDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        product={selectedProduct}
      />
    </div>
  );
};
