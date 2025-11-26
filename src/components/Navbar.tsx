import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCartCount } from "../hooks/useCartCount";

const Navbar = () => {
  const { user, logout } = useAuth();
  const cartCount = useCartCount();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      {/* Logo */}
      <Link to="/" className="text-2xl font-extrabold flex items-center gap-1">
        <span className="text-purple-700">Pc</span>
        <span className="text-green-500">Base</span>
      </Link>

      <div className="flex items-center gap-6">

        {/* === Ikona koszyka — widoczna tylko dla USER === */}
        {user?.role !== "employee" &&  (
          <Link to="/cart" className="relative">
            <span className="text-2xl">🛒</span>

            {cartCount > 0 && (
              <span className="absolute -top-1 -right-2 bg-red-600 text-white text-xs font-bold rounded-full px-2 py-[1px]">
                {cartCount}
              </span>
            )}
          </Link>
        )}

        {/* === Zalogowany === */}
        {user ? (
          <>
            <span className="text-sm text-gray-700">
              {user.email} ({user.role})
            </span>

            {user.role === "employee" || user.role === "admin" ? (
              <Link
                to="/employee"
                className="text-purple-700 text-sm hover:underline"
              >
                Panel pracownika
              </Link>
            ) : (
              <Link
                to="/profile"
                className="text-purple-700 text-sm hover:underline"
              >
                Profil
              </Link>
            )}

            <button
              onClick={logout}
              className="text-purple-700 text-sm hover:underline"
            >
              Wyloguj
            </button>
          </>
        ) : (
          <Link to="/login" className="text-purple-700 hover:underline">
            Zaloguj
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
