import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BookOpen, User, LogOut, LogIn, UserPlus, Menu, X } from "lucide-react";
import AuthContext from "../../context/AuthContext";

const Navbar = () => {
  const { isAuthenticated, user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-indigo-700 to-purple-700 shadow-lg text-white">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2 text-white">
          <BookOpen className="h-8 w-8" />
          <span className="text-2xl font-bold tracking-wide">QuizNova</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-6">
          <Link to="/dashboard" className="hover:text-indigo-200">Dashboard</Link>
          <Link to="/exams" className="hover:text-indigo-200">Exams</Link>
          {user?.role === "Admin" && (
            <Link to="/admin/users" className="hover:text-indigo-200">Users</Link>
          )}

          {isAuthenticated ? (
            <div className="relative">
              <button
                className="flex items-center space-x-1 hover:text-indigo-200"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <User className="h-6 w-6" />
                <span>{user?.name || "User"}</span>
              </button>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-white bg-opacity-20 backdrop-blur-lg text-gray-900 rounded-lg shadow-lg py-2 z-20">
                  <Link to="/profile" className="block px-4 py-2 hover:bg-indigo-100">
                    Profile
                  </Link>
                  <Link to="/exam-history" className="block px-4 py-2 hover:bg-indigo-100">
                    Exam History
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-2 hover:bg-red-200 text-red-700"
                  >
                    <LogOut className="h-4 w-4 inline-block mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="flex items-center space-x-1 hover:text-indigo-200">
                <LogIn className="h-5 w-5" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center space-x-1 bg-white text-indigo-700 px-4 py-2 rounded-lg hover:bg-indigo-100 transition"
              >
                <UserPlus className="h-5 w-5" />
                <span>Register</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white focus:outline-none"
        >
          {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-indigo-800 py-4 px-6">
          {isAuthenticated ? (
            <div className="flex flex-col space-y-3">
              <Link to="/dashboard" className="hover:text-indigo-300" onClick={() => setIsMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/exams" className="hover:text-indigo-300" onClick={() => setIsMenuOpen(false)}>
                Exams
              </Link>
              {user?.role === "Admin" && (
                <Link to="/admin/users" className="hover:text-indigo-300" onClick={() => setIsMenuOpen(false)}>
                  Users
                </Link>
              )}
              <Link to="/profile" className="hover:text-indigo-300" onClick={() => setIsMenuOpen(false)}>
                Profile
              </Link>
              <Link to="/exam-history" className="hover:text-indigo-300" onClick={() => setIsMenuOpen(false)}>
                Exam History
              </Link>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMenuOpen(false);
                }}
                className="flex items-center text-red-300 hover:text-red-500"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            </div>
          ) : (
            <div className="flex flex-col space-y-3">
              <Link to="/login" className="hover:text-indigo-300" onClick={() => setIsMenuOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-indigo-700 px-4 py-2 rounded-md hover:bg-indigo-100 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
