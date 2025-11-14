import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <Link to="/" className="text-2xl font-extrabold flex items-center gap-1">
        <span className="text-purple-700">Pc</span>
        <span className="text-green-500">Base</span>
      </Link>

      <div className="flex items-center gap-4">
        {user ? (
          <>
            <span className="text-sm text-gray-700">
              {user.email}{" "}
              {user.role === "employee"
                ? "(Pracownik)"
                : user.role === "admin"
                ? "(Administrator)"
                : "(Użytkownik)"}
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
