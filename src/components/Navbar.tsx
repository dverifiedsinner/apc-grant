import React from "react";
import { Shield, Sparkles, UserCheck, Menu, X, LogOut, LayoutDashboard, Home, Award } from "lucide-react";
import { User } from "../types";
import APCLogo from "./APCLogo";

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string) => void;
  currentUser: User | null;
  onLogout: () => void;
  isAdmin: boolean;
  onToggleAdmin: () => void;
}

export default function Navbar({
  currentView,
  onNavigate,
  currentUser,
  onLogout,
  isAdmin,
  onToggleAdmin
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-slate-200 text-slate-800 backdrop-blur-md bg-opacity-95 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Brand / Party Style */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => onNavigate("home")}>
            <APCLogo className="w-10 h-10 shadow-md hover:scale-105 transition-all duration-300" />
            <div>
              <div className="flex items-center space-x-1">
                <span className="font-extrabold text-base tracking-tight text-slate-900">APC GRANTS</span>
                <span className="bg-[#008751]/10 text-[#008751] text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border border-[#008751]/20">Empowerment</span>
              </div>
              <p className="text-[10px] text-slate-500 font-mono">Federal Republic of Nigeria</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={() => onNavigate("home")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "home"
                  ? "bg-[#008751]/10 text-[#008751] border-b-2 border-[#D10000]"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onNavigate("faq")}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                currentView === "faq"
                  ? "bg-slate-100 text-slate-800"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
              }`}
            >
              <span>FAQs</span>
            </button>

            {currentUser && (
              <button
                onClick={() => onNavigate("dashboard")}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  currentView === "dashboard"
                    ? "bg-[#008751]/10 text-[#008751] border-b-2 border-[#D10000]"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>My Dashboard</span>
              </button>
            )}

            {/* Quick Simulation Mode Toggle (Admin Controls) */}
            <button
              onClick={onToggleAdmin}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-300 ${
                isAdmin
                  ? "bg-gradient-to-r from-[#D10000] to-amber-600 text-white shadow-md ring-2 ring-amber-400/50"
                  : "bg-slate-150 hover:bg-slate-200 text-amber-700 border border-slate-300"
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>{isAdmin ? "Admin: Control Room" : "Simulate Admin"}</span>
            </button>
          </div>

          {/* User Section / Action CTA */}
          <div className="hidden md:flex items-center space-x-3">
            {currentUser ? (
              <div className="flex items-center space-x-3 border-l border-slate-200 pl-3">
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[120px]">{currentUser.fullName}</p>
                  <p className="text-[10px] text-[#008751] flex items-center justify-end font-mono">
                    <UserCheck className="w-2.5 h-2.5 mr-0.5" />
                    ₦{currentUser.grantAmount.toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={onLogout}
                  className="p-1 rounded-full text-slate-400 hover:text-red-500 hover:bg-slate-100 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onNavigate("login")}
                  className="px-3 border border-[#008751]/30 text-[#008751] rounded-md py-1.5 text-sm font-medium hover:bg-slate-50 transition-colors"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate("register")}
                  className="relative group overflow-hidden bg-[#008751] hover:bg-[#007345] text-white rounded-md px-4 py-1.5 text-sm font-bold shadow-sm transition-all cursor-pointer"
                >
                  <span className="relative z-10 flex items-center space-x-1">
                    <span>Apply for Grant</span>
                    <Sparkles className="w-3.5 h-4 text-emerald-200" />
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={onToggleAdmin}
              className={`p-1.5 rounded-full ${isAdmin ? "bg-red-50 border border-red-500 text-red-700" : "bg-slate-150 text-amber-700"}`}
              title="Simulate Admin View"
            >
              <Shield className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 px-2 pt-2 pb-4 space-y-1">
          <button
            onClick={() => {
              onNavigate("home");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left flex items-center space-x-2 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            <Home className="w-4 h-4 text-[#008751]" />
            <span>Home</span>
          </button>
          
          <button
            onClick={() => {
              onNavigate("faq");
              setMobileMenuOpen(false);
            }}
            className="w-full text-left flex items-center space-x-2 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
          >
            <span>FAQs</span>
          </button>

          {currentUser && (
            <button
              onClick={() => {
                onNavigate("dashboard");
                setMobileMenuOpen(false);
              }}
              className="w-full text-left flex items-center space-x-2 px-3 py-2.5 rounded-md text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50"
            >
              <LayoutDashboard className="w-4 h-4 text-[#008751]" />
              <span>My Dashboard</span>
            </button>
          )}

          <div className="border-t border-slate-100 my-2 pt-2 px-3">
            {currentUser ? (
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-xs font-bold text-slate-800">{currentUser.fullName}</span>
                  <span className="text-xs text-[#008751] font-mono">₦{currentUser.grantAmount.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center space-x-2 bg-slate-100 text-red-600 hover:bg-red-50 px-4 py-2 rounded-md text-xs font-bold transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2 pb-2">
                <button
                  onClick={() => {
                    onNavigate("login");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full border border-[#008751]/30 text-[#008751] text-center py-2 rounded-md text-xs font-semibold"
                >
                  Sign In
                </button>
                <button
                  onClick={() => {
                    onNavigate("register");
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-[#008751] text-white text-center py-2 rounded-md text-xs font-bold shadow"
                >
                  Apply Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
