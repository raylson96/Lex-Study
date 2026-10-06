import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/layout/Sidebar';
import { Navbar } from './components/layout/Navbar';
import { DashboardView } from './components/dashboard/DashboardView';
import { StudyDocEditor } from './components/editor/StudyDocEditor';
import { ScheduleView } from './components/schedule/ScheduleView';
import { CalendarView } from './components/calendar/CalendarView';
import { LibraryView } from './components/library/LibraryView';
import { QuestionsView } from './components/flashcards/QuestionsView';
import { MetricsView } from './components/metrics/MetricsView';
import { SettingsView } from './components/settings/SettingsView';
import { ToastContainer } from './components/common/ToastContainer';
import { LoginView } from './components/auth/LoginView';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, createDocument, theme, isAuthenticated } = useApp();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return (
      <>
        <LoginView />
        <ToastContainer />
      </>
    );
  }

  const handleNewDocument = () => {
    createDocument('Novo Caderno de Estudo', 'Direito Constitucional');
    setActiveTab('editor');
  };

  const bgClasses =
    theme === 'megapreto'
      ? 'bg-black text-white'
      : theme === 'branco'
      ? 'bg-[#fcfcfd] text-black'
      : 'bg-[#090d16] text-slate-100';

  return (
    <div className={`min-h-screen ${bgClasses} flex flex-row font-sans antialiased relative transition-colors duration-300 w-full`}>
      {/* Ambient background glow for glassmorphism */}
      {theme !== 'megapreto' && (
        <>
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none -z-10" />
          <div className="fixed bottom-10 right-1/4 w-96 h-96 bg-violet-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none -z-10" />
        </>
      )}

      {/* Modern Collapsible Glass Sidebar */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        setIsMobileOpen={setIsMobileSidebarOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Glass Navbar */}
        <Navbar
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
          onNewDocument={handleNewDocument}
        />

        {/* Tab View Content - Fluid Full-Width Layout with State Preservation */}
        <main className="flex-1 p-3 sm:p-5 lg:p-6 w-full print:p-0 print:m-0 print:w-full">
          <div className={activeTab === 'dashboard' ? 'block animate-in fade-in duration-200' : 'hidden'}>
            <DashboardView
              onOpenEditor={() => setActiveTab('editor')}
              onOpenSchedule={() => setActiveTab('cronograma')}
              onOpenLibrary={() => setActiveTab('biblioteca')}
            />
          </div>

          <div className={activeTab === 'editor' ? 'block animate-in fade-in duration-200' : 'hidden'}>
            <StudyDocEditor />
          </div>

          <div className={activeTab === 'cronograma' ? 'block animate-in fade-in duration-200' : 'hidden'}>
            <ScheduleView />
          </div>

          <div className={activeTab === 'calendario' ? 'block animate-in fade-in duration-200' : 'hidden'}>
            <CalendarView />
          </div>

          <div className={activeTab === 'biblioteca' ? 'block animate-in fade-in duration-200' : 'hidden'}>
            <LibraryView />
          </div>

          <div className={activeTab === 'questoes' ? 'block animate-in fade-in duration-200' : 'hidden'}>
            <QuestionsView />
          </div>

          <div className={activeTab === 'metricas' ? 'block animate-in fade-in duration-200' : 'hidden'}>
            <MetricsView />
          </div>

          <div className={activeTab === 'configuracoes' ? 'block animate-in fade-in duration-200' : 'hidden'}>
            <SettingsView />
          </div>
        </main>
      </div>

      {/* Global Toast Notifications */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
