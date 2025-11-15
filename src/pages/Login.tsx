import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");

  // ✅ jeżeli wróciliśmy po zmianie hasła (z continueUrl)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("reset") === "1") {
      setMessage("Hasło zostało zresetowane. Zaloguj się nowym hasłem.");
    }
  }, [location.search]);

  // ✅ jeśli użytkownik już zalogowany – nie pokazujemy formularza
  if (user) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm text-center">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">
            Jesteś już zalogowany
          </h2>
          <p className="text-gray-600 mb-6">{user.email}</p>
          <button
            onClick={logout}
            className="bg-purple-700 text-white py-2 px-4 rounded-lg font-semibold hover:bg-purple-800 transition"
          >
            Wyloguj się
          </button>
        </div>
      </div>
    );
  }

  // 🔐 Obsługa logowania i rejestracji
  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Zapis danych użytkownika w Firestore
        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          firstName,
          lastName,
          address,
          role: "user",
          createdAt: serverTimestamp(),
        });

        // Wyczyść formularz
        setEmail("");
        setPassword("");
        setFirstName("");
        setLastName("");
        setAddress("");

        // 🔁 Przejdź na stronę główną — użytkownik już zalogowany
        navigate("/");
        return;
      }

      // Logowanie istniejącego użytkownika
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Zalogowano pomyślnie!");
      setTimeout(() => navigate("/"), 500);

    } catch (error) {
      if (error instanceof Error) {
        setMessage("Błąd: " + error.message);
      } else {
        setMessage("Wystąpił nieznany błąd.");
      }
    }
  };

  // 🧱 Widok formularza logowania / rejestracji
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center text-purple-700 mb-6">
          {isRegister ? "Rejestracja" : "Logowanie"}
        </h2>

        <form onSubmit={handleAuth} className="flex flex-col gap-4">
          {isRegister && (
            <>
              <input
                type="text"
                placeholder="Imię"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="text"
                placeholder="Nazwisko"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
              <input
                type="text"
                placeholder="Adres zamieszkania"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />
            </>
          )}

          <input
            type="email"
            placeholder="Adres email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            className="bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
          >
            {isRegister ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </form>

        {/* Link do resetu hasła */}
        {!isRegister && (
          <div className="text-center mt-3">
            <Link
              to="/reset-password"
              className="text-sm text-purple-700 hover:underline"
            >
              Zapomniałeś hasła?
            </Link>
          </div>
        )}

        {message && (
          <p
            className={`text-center text-sm mt-4 ${
              message.includes("Błąd") ? "text-red-600" : "text-green-600"
            }`}
          >
            {message}
          </p>
        )}

        <p
          onClick={() => {
            setIsRegister(!isRegister);
            setMessage("");
          }}
          className="text-center text-sm text-purple-700 mt-4 cursor-pointer hover:underline"
        >
          {isRegister
            ? "Masz już konto? Zaloguj się"
            : "Nie masz konta? Zarejestruj się"}
        </p>
      </div>
    </div>
  );
};

export default Login;
