import { useState, useEffect } from "react";
import { Link, NavLink } from "react-router-dom";
import { motion } from "framer-motion";

// --- INTERFACES --- //
interface NavItem {
  label: string;
  path: string;
  dropdown?: Array<{ label: string; path: string }>;
}

interface DropdownMenuProps {
  isOpen: boolean;
  items: Array<{ label: string; path: string }>;
  onClose: () => void;
}

// --- SUB-COMPONENTS --- //

const ThemeToggleButton: React.FC = () => {
  const [isDark, setIsDark] = useState<boolean>(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark]);

  return (
    <motion.button
      onClick={() => setIsDark(!isDark)}
      className="flex items-center justify-center w-12 h-12 text-white rounded-full bg-gradient-to-br from-[#0069b4] to-[#004f8a] transition-all duration-300"
      aria-label="Toggle Theme"
      whileHover={{ scale: 1.15, rotate: 15 }}
      whileTap={{ scale: 0.95 }}
    >
      {isDark ? (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </motion.button>
  );
};

const DropdownMenu: React.FC<DropdownMenuProps> = ({ isOpen, items, onClose }) => {
  return (
    <motion.div
      className={`absolute left-0 mt-2 w-56 bg-gradient-to-b from-[#0069b4] to-[#004f8a] rounded-lg shadow-xl z-50 ${
        isOpen ? "block" : "hidden"
      }`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isOpen ? 1 : 0, y: isOpen ? 0 : -10 }}
      transition={{ duration: 0.3 }}
    >
      <div className="py-2">
        {items.map((item) => (
          <Link
            key={item.label}
            to={item.path}
            className="block px-4 py-2 text-sm font-medium text-white hover:bg-white/20 transition-colors duration-200 text-center rounded-md mx-2"
            onClick={onClose}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </motion.div>
  );
};

// --- MAIN HEADER COMPONENT --- //
const Header: React.FC = () => {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  const companyMenuItems = [
    { label: "MCL-Group", path: "/company/mcl-group" },
    { label: "Leadership", path: "/company/leadership" },
    { label: "Diversity and Inclusion", path: "/company/diversity-and-inclusion" },
    { label: "Sustainability", path: "/company/sustainability" },
    { label: "Giving Back", path: "/company/giving-back" },
    { label: "MCL Pink 130", path: "/company/pink-130" },
    { label: "Our Standards", path: "/company/our-standards" },
  ];

  const careersMenuItems = [
    { label: "Vacancies", path: "/careers/vacancies" },
    { label: "What We Do", path: "/careers/what-we-do" },
    { label: "Life At FT Blog", path: "/careers/life-at-ft-blog" },
    { label: "Benefits", path: "/careers/benefits" },
    { label: "Values", path: "/careers/values" },
    { label: "Early Careers", path: "/careers/early-careers" },
    { label: "Join Our Talent Community", path: "/careers/join-our-talent-community" },
  ];

  const navItems: NavItem[] = [
    { label: "About Us", path: "/" },
    { label: "Company", path: "/company/home", dropdown: companyMenuItems },
    { label: "Services", path: "/company/services" },
    { label: "Careers", path: "/careers", dropdown: careersMenuItems },
    { label: "News", path: "/company/news" },
    { label: "Contact", path: "/company/contact-us" },
    { label: "Sign In", path: "/sign-in" },
  ];

  const navLinkClass = "font-extrabold text-white hover:text-[#e6f0fa] transition-colors duration-200";

  return (
    <motion.header
      className="sticky top-0 z-50 w-full bg-gradient-to-r from-[#0069b4] to-[#004f8a] shadow-2xl py-4"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between w-full px-8 py-4 mx-auto max-w-8xl lg:px-12">
        <Link to="/" className="flex items-center gap-4">
          <img src="/logo.png" alt="MCL" className="h-14" />
          <h3 className="font-extrabold text-white text-lg tracking-tight">
            Mwananchi Communications LTD
          </h3>
        </Link>
        <nav className="items-center hidden gap-8 lg:flex">
          {/* UPDATED: Loop now handles the "Sign In" button as a special case */}
          {navItems.map((item) => {
            if (item.label === "Sign In") {
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className="px-6 py-2 font-bold text-white transition-all duration-300 bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg"
                >
                  {item.label}
                </Link>
              );
            }
            return (
              <div
                key={item.label}
                className="relative"
                onMouseEnter={() => item.dropdown && setOpenDropdown(item.label)}
                onMouseLeave={() => item.dropdown && setOpenDropdown(null)}
              >
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${navLinkClass} text-lg text-center ${
                      isActive ? "underline underline-offset-8" : ""
                    }`
                  }
                >
                  {item.label}
                </NavLink>
                {item.dropdown && (
                  <DropdownMenu
                    isOpen={openDropdown === item.label}
                    items={item.dropdown}
                    onClose={() => setOpenDropdown(null)}
                  />
                )}
              </div>
            );
          })}
        </nav>
        <div className="flex items-center gap-4">
          <div className="hidden lg:block">
             <ThemeToggleButton />
          </div>
          <button
            className="lg:hidden text-white"
            onClick={() => setMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle Mobile Menu"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <motion.nav
          className="lg:hidden bg-gradient-to-r from-[#0069b4] to-[#004f8a] w-full px-8 py-6"
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* UPDATED: Mobile loop also handles the "Sign In" button as a special case */}
          {navItems.map((item) => {
            if (item.label === "Sign In") {
              return (
                <div key={item.label} className="py-3 text-center">
                  <Link
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="inline-block px-8 py-3 font-bold text-white transition-all duration-300 bg-red-600 rounded-lg shadow-md hover:bg-red-700 hover:shadow-lg"
                  >
                    {item.label}
                  </Link>
                </div>
              );
            }
            return (
              <div key={item.label} className="relative py-3 text-center">
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    `${navLinkClass} block text-sm ${isActive ? "underline underline-offset-8" : ""}`
                  }
                  onClick={() => {
                    // Close menu, but if it has a dropdown, don't navigate immediately
                    // This part is complex, for simplicity we close on any click.
                    setMobileMenuOpen(false);
                  }}
                >
                  {item.label}
                </NavLink>
                {item.dropdown && (
                  <div className="mt-2 space-y-2">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.label}
                        to={subItem.path}
                        className="block text-xs font-medium text-white/80 hover:text-white"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
          <div className="flex justify-center mt-6">
            <ThemeToggleButton />
          </div>
        </motion.nav>
      )}
    </motion.header>
  );
};

export default Header;