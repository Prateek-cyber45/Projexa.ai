import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import AllCourses from './pages/AllCourses';
import Course from './pages/Course';
import Certifications from './pages/Certifications';

function Navigation() {
  return (
    <nav className="border-b border-white/10 bg-[#06101f] sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-6">
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">DeepHunt Academy</span>
            <div className="hidden md:flex gap-4 border-l border-white/10 pl-6 ml-2">
              <Link to="/" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Dashboard</Link>
              <Link to="/courses" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Courses</Link>
              <Link to="/certifications" className="text-sm font-bold text-gray-400 hover:text-white transition-colors">Certifications</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/50 flex items-center justify-center text-xs font-bold text-blue-400">OP</div>
          </div>
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter basename="/academy">
      <div className="min-h-screen bg-[#0a0f18] text-white">
        <Navigation />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/courses" element={<AllCourses />} />
            <Route path="/courses/:courseId" element={<Course />} />
            <Route path="/certifications" element={<Certifications />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
