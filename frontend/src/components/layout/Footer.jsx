import React from 'react';
import { BookOpen, Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-gray-800 text-white pt-10 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <BookOpen className="h-6 w-6" />
              <h3 className="text-xl font-bold">ExamMaster</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Empowering education through innovative online examination solutions.
            </p>
          </div>
          
          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/" className="text-gray-300 hover:text-white">Home</a>
              </li>
              <li>
                <a href="/exams" className="text-gray-300 hover:text-white">Exams</a>
              </li>
              <li>
                <a href="/dashboard" className="text-gray-300 hover:text-white">Dashboard</a>
              </li>
              <li>
                <a href="/profile" className="text-gray-300 hover:text-white">Profile</a>
              </li>
            </ul>
          </div>
          
          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Help Center</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">Terms of Service</a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">FAQ</a>
              </li>
            </ul>
          </div>
          
          {/* Contact */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <ul className="space-y-2">
              <li className="flex items-center space-x-2">
                <Mail className="h-5 w-5 text-gray-400" />
                <a href="mailto:info@exammaster.com" className="text-gray-300 hover:text-white">
                  info@exammaster.com
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-gray-400" />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-white">
                  +1 (234) 567-890
                </a>
              </li>
              <li className="flex items-start space-x-2">
                <MapPin className="h-5 w-5 text-gray-400 mt-1" />
                <span className="text-gray-300">
                  123 Education Street, Learning City, ED 12345
                </span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
          <p>&copy; {currentYear} ExamMaster. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;