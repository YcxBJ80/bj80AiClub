import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import { Toaster } from 'sonner';

function App() {
  return (
    <div className="h-screen bg-gray-50 flex flex-col overflow-hidden">
      <Navbar />
      <main className="flex-1 overflow-hidden pt-12">
        <Outlet />
      </main>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;
