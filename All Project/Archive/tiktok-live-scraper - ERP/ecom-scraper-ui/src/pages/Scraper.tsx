import { ScraperWizard } from '../components/scraper/ScraperWizard';

export const Scraper = () => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-gray-900">Scraper</h1>
        <p className="text-gray-600">
          Create and manage e-commerce scraping jobs effortlessly
        </p>
      </div>

      <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 border border-gray-100 overflow-hidden min-h-[700px]">
        <ScraperWizard />
      </div>
    </div>
  );
};
