import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { auth, db } from "../firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import {
  doc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");

  const [isRegister, setIsRegister] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("reset") === "1") {
      setMessage("Hasło zostało zmienione. Zaloguj się nowym hasłem.");
    }
  }, [location.search]);

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

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (isRegister) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        const newUser = userCredential.user;

        const userData = {
          email: newUser.email,
          firstName,
          lastName,
          role: "user",
          createdAt: serverTimestamp(),
          address: {
            street,
            city,
            postalCode,
            country,
            phone,
          },
        };

        await setDoc(doc(db, "users", newUser.uid), userData);

        await setDoc(doc(db, "users", newUser.uid, "cart", "cart"), {
          items: [],
        });

        navigate("/");
        return;
      }
 // logowanie
      await signInWithEmailAndPassword(auth, email, password);
      setMessage("Zalogowano pomyślnie!");
      setTimeout(() => navigate("/"), 500);
    } catch (error: any) {
      setMessage("Błąd: " + error.message);
    }
  };

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
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Nazwisko"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2"
              />

              <input
                type="text"
                placeholder="Ulica i numer"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Miasto"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Kod pocztowy"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Kraj"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Telefon"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="border border-gray-300 rounded px-3 py-2"
              />
            </>
          )}

          <input
            type="email"
            placeholder="Adres e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="border border-gray-300 rounded px-3 py-2"
          />

          <input
            type="password"
            placeholder="Hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="border border-gray-300 rounded px-3 py-2"
          />

          <button
            type="submit"
            className="bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
          >
            {isRegister ? "Zarejestruj się" : "Zaloguj się"}
          </button>
        </form>

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
