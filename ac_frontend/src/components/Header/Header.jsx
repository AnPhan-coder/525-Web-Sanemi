import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  UserCircle,
  LayoutDashboard,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef(null);

  const loadUser = () => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    } else {
        setUser(null);
    }
  };

  useEffect(() => {
    loadUser();
    const handleStorageChange = () => {
      loadUser();
    };
    window.addEventListener("user-update", handleStorageChange);
    const updateAuthStatus = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    updateAuthStatus();
    window.addEventListener("auth-change", updateAuthStatus);

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("user-update", handleStorageChange);
      window.removeEventListener("auth-change", updateAuthStatus);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (location.pathname === "/movies") {
      const searchParams = new URLSearchParams(location.search);
      const urlKeyword = searchParams.get("keyword");
      if (urlKeyword) {
        setKeyword(decodeURIComponent(urlKeyword));
      }
    } else {
      setKeyword("");
    }
  }, [location.pathname, location.search]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.dispatchEvent(new Event("auth-change"));
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (keyword.trim()) {
      navigate(`/movies?keyword=${encodeURIComponent(keyword.trim())}`); 
      setIsMobileMenuOpen(false);
    }
  };

  const isActive = (path) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const getAvatarLetter = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  return (
    <header className="fixed top-0 left-0 w-full h-20 z-50 bg-neutral-900/95 backdrop-blur-sm border-b border-neutral-800">
      <div className="max-w-7xl mx-auto px-4 w-full h-full">
        <div className="flex justify-between items-center h-full">
          <Link
            to="/"
            className="text-2xl font-display font-bold text-white tracking-tight hover:opacity-80 transition-opacity"
          >
            SA<span className="text-red-500">NEMI</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/"
              className={`text-sm font-medium uppercase tracking-wide transition-colors ${
                isActive("/")
                  ? "text-red-500"
                  : "text-neutral-400 hover:text-red-400"
              }`}
            >
              Trang chủ
            </Link>

            <Link
              to="/schedule"
              className={`text-sm font-medium uppercase tracking-wide transition-colors ${
                isActive("/schedule")
                  ? "text-red-500"
                  : "text-neutral-400 hover:text-red-400"
              }`}
            >
              Lịch chiếu
            </Link>

            <Link
              to="/movies"
              className={`text-sm font-medium uppercase tracking-wide transition-colors ${
                isActive("/movies")
                  ? "text-red-500"
                  : "text-neutral-400 hover:text-red-400"
              }`}
            >
              Phim
            </Link>
            
          </nav>

          <div className="flex items-center gap-4">
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 w-64 focus-within:border-red-500 transition-colors"
            >
              <input
                type="text"
                placeholder="Tìm tên phim..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-neutral-500"
              />
              <button
                type="submit"
                className="text-neutral-400 hover:text-red-500 transition-colors"
              >
                <Search size={18} />
              </button>
            </form>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="w-9 h-9 bg-linear-to-br from-red-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {getAvatarLetter(user.name || user.username)}
                  </div>
                  <span className="text-sm font-semibold text-white hidden lg:block max-w-[100px] truncate">
                    {user.name || user.username || "Khách"}
                  </span>
                  <ChevronDown
                    size={16}
                    className={`text-neutral-400 transition-transform ${
                      showDropdown ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showDropdown && (
                  <div className="absolute right-0 mt-3 w-56 bg-neutral-800 border border-neutral-700 rounded-xl overflow-hidden shadow-xl">
                    <div className="px-4 py-3 border-b border-neutral-700 bg-neutral-850">
                      <p className="text-sm text-white font-bold truncate">
                        {user.name || user.username}
                      </p>
                      <p className="text-xs text-neutral-400 truncate">
                        {user.role || "Member"}
                      </p>
                    </div>

                    <Link
                      to="/profile"
                      className="flex items-center gap-2 px-4 py-3 text-sm text-neutral-300 hover:bg-neutral-700 hover:text-red-400 transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <UserCircle size={18} />
                      Hồ sơ của tôi
                    </Link>

                    {user.role?.toUpperCase() === "ADMIN" && (
                      <Link
                        to="/admin/dashboard"
                        className="flex items-center gap-2 px-4 py-3 text-sm text-red-400 font-bold hover:bg-neutral-700 hover:text-yellow-300 transition-colors"
                        onClick={() => setShowDropdown(false)}
                      >
                        <LayoutDashboard size={18} />
                        Trang Quản Trị
                      </Link>
                    )}

                    <div className="border-t border-neutral-700"></div>

                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-3 text-sm text-red-400 hover:bg-neutral-700 hover:text-yellow-300 transition-colors text-left"
                    >
                      <LogOut size={18} />
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="flex items-center gap-2 bg-linear-to-r from-red-300 to-blue-600 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:from-red-600 hover:to-blue-700 transition-all"
              >
                <User size={18} />
                <span>Đăng nhập</span>
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="md:hidden text-white"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </div>

      {isMobileMenuOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 w-80 h-full bg-neutral-900 border-l border-neutral-800 z-50 p-6 overflow-y-auto">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-white"
            >
              <X size={24} />
            </button>

            <div className="mb-8 pt-2">
              <Link
                to="/"
                className="text-2xl font-display font-bold text-white"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                SA<span className="text-red-600">NEMI</span>
              </Link>
            </div>

            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex items-center bg-neutral-800 border border-neutral-700 rounded-lg px-3 py-2 focus-within:border-red-500 transition-colors">
                <input
                  type="text"
                  placeholder="Tìm tên phim..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-neutral-500"
                />
                <button type="submit" className="text-neutral-400">
                  <Search size={18} />
                </button>
              </div>
            </form>

            <nav className="flex flex-col gap-1">
              <Link
                to="/"
                className={`px-4 py-3 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors ${
                  isActive("/")
                    ? "bg-red-500/10 text-red-500"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Trang chủ
              </Link>
              
              <Link
                to="/schedule"
                className={`px-4 py-3 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors ${
                  isActive("/schedule")
                    ? "bg-red-500/10 text-red-500"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Lịch chiếu
              </Link>

              <Link
                to="/movies"
                className={`px-4 py-3 rounded-lg text-sm font-medium uppercase tracking-wide transition-colors ${
                  isActive("/movies")
                    ? "bg-red-500/10 text-red-500"
                    : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Phim
              </Link>

            </nav>
          </div>
        </>
      )}
    </header>
  );
};

export default Header;