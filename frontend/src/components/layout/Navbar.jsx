import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { BookOpen, User, LogOut, LogIn, UserPlus, Menu, X, Home, BookOpenCheck, Clock, Award, Settings, ChevronDown, Users } from "lucide-react";
import AuthContext from "../../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.user-menu')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isDropdownOpen]);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-[#0d1117]/95 backdrop-blur-md shadow-lg" : "bg-gradient-to-br from-[#0d1117] to-[#1f2937]"
    }`}>
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-3 text-white group">
          <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-lg p-2 transform group-hover:scale-110 transition-transform duration-300">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-pink-400">
            QuizNova
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/dashboard" 
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-200
              ${location.pathname === '/dashboard' 
                ? 'bg-pink-600/20 text-pink-400' 
                : 'hover:bg-[#1a2234] hover:text-pink-400'}`}
          >
            <Home className="h-5 w-5" />
            <span>Dashboard</span>
          </Link>
          
          <Link 
            to="/exams" 
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-200
              ${location.pathname.includes('/exams') 
                ? 'bg-pink-600/20 text-pink-400' 
                : 'hover:bg-[#1a2234] hover:text-pink-400'}`}
          >
            <BookOpenCheck className="h-5 w-5" />
            <span>Exams</span>
          </Link>
          
          {user?.role === "Admin" && (
            <Link 
              to="/admin/users" 
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-200
                ${location.pathname.includes('/admin') 
                  ? 'bg-pink-600/20 text-pink-400' 
                  : 'hover:bg-[#1a2234] hover:text-pink-400'}`}
            >
              <Users className="h-5 w-5" />
              <span>Users</span>
            </Link>
          )}

          {isAuthenticated ? (
            <div className="relative user-menu">
              <button
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 text-gray-200
                  ${isDropdownOpen 
                    ? 'bg-indigo-600/20 text-indigo-400' 
                    : 'hover:bg-[#1a2234] hover:text-indigo-400'}`}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full w-8 h-8 flex items-center justify-center">
                  <User className="h-4 w-4 text-white" />
                </div>
                <span>{user?.name || "User"}</span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-60 bg-[#0f172a] border border-pink-500/30 rounded-xl shadow-lg py-2 z-20 overflow-hidden animate-fade-in">
                  <div className="px-4 py-3 border-b border-pink-500/20">
                    <p className="text-sm text-gray-400">Signed in as</p>
                    <p className="font-semibold text-white">{user?.email}</p>
                  </div>
                  
                  <Link to="/profile" className="flex items-center px-4 py-2 hover:bg-pink-600/10 text-gray-300 hover:text-white transition-colors">
                    <Settings className="h-4 w-4 mr-3 text-pink-400" />
                    Profile Settings
                  </Link>
                  
                  <Link to="/exam-history" className="flex items-center px-4 py-2 hover:bg-pink-600/10 text-gray-300 hover:text-white transition-colors">
                    <Clock className="h-4 w-4 mr-3 text-pink-400" />
                    Exam History
                  </Link>
                  
                  <Link to="/certificates" className="flex items-center px-4 py-2 hover:bg-pink-600/10 text-gray-300 hover:text-white transition-colors">
                    <Award className="h-4 w-4 mr-3 text-pink-400" />
                    Certificates
                  </Link>
                  
                  <div className="border-t border-pink-500/20 mt-2 pt-2">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center px-4 py-2 hover:bg-red-600/20 text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <LogOut className="h-4 w-4 mr-3 text-red-400" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link 
                to="/login" 
                className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-pink-500/50 hover:bg-pink-500/20 text-gray-200 hover:text-white transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Sign In</span>
              </Link>
              
              <Link
                to="/register"
                className="flex items-center space-x-2 bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 px-4 py-2 rounded-lg text-white transition-colors"
              >
                <UserPlus className="h-4 w-4" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white bg-[#1a2234] p-2 rounded-lg hover:bg-pink-600/30 transition-colors focus:outline-none"
          aria-label="Toggle menu"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-[#0f172a] border-t border-pink-500/20 py-4 animate-fade-in">
          <div className="container mx-auto px-6 flex flex-col space-y-1">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-3 px-4 py-3 mb-2 bg-[#1a2234] rounded-xl">
                  <div className="bg-gradient-to-br from-indigo-600 to-pink-600 rounded-full w-10 h-10 flex items-center justify-center">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{user?.name}</p>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                  </div>
                </div>
                
                <Link 
                  to="/dashboard" 
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors
                    ${location.pathname === '/dashboard' 
                      ? 'bg-pink-600/20 text-pink-400' 
                      : 'hover:bg-[#1a2234] text-gray-300 hover:text-pink-400'}`}
                >
                  <Home className="h-5 w-5" />
                  <span>Dashboard</span>
                </Link>
                
                <Link 
                  to="/exams" 
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors
                    ${location.pathname.includes('/exams') 
                      ? 'bg-pink-600/20 text-pink-400' 
                      : 'hover:bg-[#1a2234] text-gray-300 hover:text-pink-400'}`}
                >
                  <BookOpenCheck className="h-5 w-5" />
                  <span>Exams</span>
                </Link>
                
                {user?.role === "Admin" && (
                  <Link 
                    to="/admin/users" 
                    className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors
                      ${location.pathname.includes('/admin') 
                        ? 'bg-pink-600/20 text-pink-400' 
                        : 'hover:bg-[#1a2234] text-gray-300 hover:text-pink-400'}`}
                  >
                    <Users className="h-5 w-5" />
                    <span>Users</span>
                  </Link>
                )}
                
                <Link 
                  to="/profile" 
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors
                    ${location.pathname === '/profile' 
                      ? 'bg-pink-600/20 text-pink-400' 
                      : 'hover:bg-[#1a2234] text-gray-300 hover:text-pink-400'}`}
                >
                  <Settings className="h-5 w-5" />
                  <span>Profile Settings</span>
                </Link>
                
                <Link 
                  to="/exam-history" 
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors
                    ${location.pathname === '/exam-history' 
                      ? 'bg-pink-600/20 text-pink-400' 
                      : 'hover:bg-[#1a2234] text-gray-300 hover:text-pink-400'}`}
                >
                  <Clock className="h-5 w-5" />
                  <span>Exam History</span>
                </Link>
                
                <Link 
                  to="/certificates" 
                  className={`flex items-center space-x-3 px-4 py-3 rounded-xl transition-colors
                    ${location.pathname === '/certificates' 
                      ? 'bg-pink-600/20 text-pink-400' 
                      : 'hover:bg-[#1a2234] text-gray-300 hover:text-pink-400'}`}
                >
                  <Award className="h-5 w-5" />
                  <span>Certificates</span>
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-600/20 hover:text-red-300 mt-2"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Sign Out</span>
                </button>
              </>
            ) : (
              <div className="space-y-3 px-4 py-2">
                <Link 
                  to="/login" 
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl border border-pink-500/50 hover:bg-pink-500/20 text-gray-300 hover:text-white transition-colors"
                >
                  <LogIn className="h-5 w-5" />
                  <span>Sign In</span>
                </Link>
                
                <Link
                  to="/register"
                  className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white transition-colors"
                >
                  <UserPlus className="h-5 w-5" />
                  <span>Register</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;