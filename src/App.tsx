import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { RTLProvider } from '@/components/Layout/RTLProvider';
import { Layout } from '@/components/Layout/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MobileNavigationProvider } from '@/contexts/MobileNavigationContext';
import { HomePage } from '@/pages/HomePage';
import { PatientsPage } from '@/pages/PatientsPage';
import { TemplatesPage } from '@/pages/TemplatesPage';
import { DocumentsPage } from '@/pages/DocumentsPage';
import { DocumentEditor } from '@/pages/DocumentEditor';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <RTLProvider direction="rtl">
        <MobileNavigationProvider>
          <Router>
            <Layout>
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/patients" element={<PatientsPage />} />
                <Route path="/patients/new" element={<PatientsPage initialAction="new" />} />
                <Route path="/templates" element={<TemplatesPage />} />
                <Route path="/documents" element={<DocumentsPage />} />
                <Route path="/documents/edit/:id" element={<DocumentEditor />} />
              </Routes>
            </ErrorBoundary>
            </Layout>
          </Router>
        </MobileNavigationProvider>
      </RTLProvider>
    </ErrorBoundary>
  );
}

export default App;