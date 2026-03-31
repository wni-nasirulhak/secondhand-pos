import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PlatformSelector } from './PlatformSelector';
import type { ScraperType } from './ScrapingTypeSelector';
import { ScrapingTypeSelector } from './ScrapingTypeSelector';
import { JobConfigForm } from './JobConfigForm';
import { CheckCircle, ChevronLeft, PlusCircle } from 'lucide-react';
import { useStartScraper } from '../../hooks/useScraper';

export const ScraperWizard: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const startScraper = useStartScraper();

  const [step, setStep] = useState(1);
  const [platform, setPlatform] = useState<'tiktok' | 'shopee' | 'lazada' | null>(
    (searchParams.get('platform') as any) || null
  );
  const [type, setType] = useState<ScraperType | null>(null);

  // Sync state with query params
  useEffect(() => {
    const p = searchParams.get('platform');
    if (p && (p === 'tiktok' || p === 'shopee' || p === 'lazada')) {
      setPlatform(p as any);
      setStep(Math.max(step, 2));
    }
  }, [searchParams]);

  const handlePlatformSelect = (p: 'tiktok' | 'shopee' | 'lazada') => {
    setPlatform(p);
    setStep(2);
    setSearchParams({ platform: p });
  };

  const handleTypeSelect = (t: ScraperType) => {
    setType(t);
    setStep(3);
  };

  const handleConfigSubmit = (config: any) => {
    startScraper.mutate(config, {
      onSuccess: () => {
        navigate('/'); // Go back to dashboard to see progress
      },
    });
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const steps = [
    { id: 1, title: 'Platform', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 2, title: 'Scraper Type', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 3, title: 'Configuration', icon: <PlusCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      {/* Stepper Header */}
      <div className="flex items-center justify-center mb-10 overflow-x-auto pb-4">
        {steps.map((s, index) => (
          <React.Fragment key={s.id}>
            <div className="flex flex-col items-center relative min-w-[120px]">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                  step === s.id
                    ? 'bg-blue-600 text-white ring-4 ring-blue-100 scale-110'
                    : step > s.id
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white text-gray-400 border border-gray-200'
                }`}
              >
                {step > s.id ? <CheckCircle className="w-6 h-6" /> : <span>{s.id}</span>}
              </div>
              <span
                className={`text-xs font-bold mt-3 uppercase tracking-wider ${
                  step === s.id ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {s.title}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-24 h-[2px] mb-6 transition-colors duration-500 ${
                  step > s.id ? 'bg-emerald-500' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Step Content */}
      <div className="min-h-[400px]">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h2 className="text-4xl font-black text-gray-900 mb-3">Choose Your Source</h2>
              <p className="text-lg text-gray-500">Pick the platform you want to extract data from.</p>
            </div>
            <PlatformSelector selectedPlatform={platform} onSelect={handlePlatformSelect} />
          </div>
        )}

        {step === 2 && platform && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={handleBack} 
                className="group flex items-center text-sm font-bold text-gray-500 hover:text-blue-600"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Back to Platforms
              </button>
              <div className="text-center">
                <h2 className="text-4xl font-black text-gray-900 mb-2">Select Goal</h2>
                <p className="text-gray-500">What data are we looking for on {platform}?</p>
              </div>
              <div className="w-20" /> {/* Spacer */}
            </div>
            <ScrapingTypeSelector
              platform={platform}
              selectedType={type}
              onSelect={handleTypeSelect}
            />
          </div>
        )}

        {step === 3 && platform && type && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500 pb-12">
            <div className="flex items-center justify-between mb-8">
              <button 
                onClick={handleBack} 
                className="group flex items-center text-sm font-bold text-gray-500 hover:text-blue-600"
              >
                <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                Change Scraper Type
              </button>
              <div className="text-center">
                <h2 className="text-4xl font-black text-gray-900 mb-2">Configure Job</h2>
                <p className="text-gray-500">Set the parameters for your {type} scraping job.</p>
              </div>
              <div className="w-20" /> {/* Spacer */}
            </div>
            <JobConfigForm
              platform={platform}
              type={type}
              loading={startScraper.isPending}
              onSubmit={handleConfigSubmit}
              onBack={handleBack}
            />
          </div>
        )}
      </div>
    </div>
  );
};
