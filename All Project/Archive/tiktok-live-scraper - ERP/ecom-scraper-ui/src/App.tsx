import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard, Scraper, DataBrowser, Webhooks, Settings, Logs } from './pages';
import { ErrorBoundary } from './components/ui';

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/" element={<AppLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="scraper" element={<Scraper />} />
            <Route path="data" element={<DataBrowser />} />
            <Route path="webhooks" element={<Webhooks />} />
            <Route path="settings" element={<Settings />} />
            <Route path="logs" element={<Logs />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
