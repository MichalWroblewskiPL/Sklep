import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const ValidationRules = {
  email: /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/,
  password: {
    minLength: 6,
    patterns: [/[0-9]/, /[A-Z]/],
  },
  firstName: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{2,30}$/,
  lastName: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]{2,50}$/,
};

type Errors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  general?: string;
};

const Login = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [errors, setErrors] = useState<Errors>({});

  if (user) {
    return (
      <div className="max-w-md mx-auto mt-32 bg-white shadow-md rounded-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-purple-700 mb-6">
          Jesteś już zalogowany
        </h1>

        <button
          onClick={logout}
          className="w-full mb-3 bg-red-500 text-white py-2 rounded font-semibold hover:bg-red-600 transition"
        >
          Wyloguj się
        </button>

        <button
          onClick={() => navigate("/")}
          className="w-full bg-purple-700 text-white py-2 rounded font-semibold hover:bg-purple-800 transition"
        >
          Powrót do strony głównej
        </button>
      </div>
    );
  }

  const validateRegister = (): boolean => {
    const newErrors: Errors = {};

    if (!ValidationRules.firstName.test(firstName))
      newErrors.firstName = "Imię: 2–30 znaków, bez cyfr.";

    if (!ValidationRules.lastName.test(lastName))
      newErrors.lastName = "Nazwisko: 2–50 znaków, bez cyfr.";

    if (!ValidationRules.email.test(email))
      newErrors.email = "Podaj poprawny adres e-mail.";

    if (password.length < ValidationRules.password.minLength)
      newErrors.password = "Hasło musi mieć co najmniej 6 znaków.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateLogin = (): boolean => {
    const newErrors: Errors = {};

    if (!ValidationRules.email.test(email))
      newErrors.email = "Podaj poprawny adres e-mail.";

    if (!password)
      newErrors.password = "Podaj hasło.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAuth = async () => {
    setErrors({});

    try {
      if (isRegister) {
        if (!validateRegister()) return;

        const cred = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );

        await setDoc(doc(db, "users", cred.user.uid), {
          email,
          firstName,
          lastName,
          role: "user",
          createdAt: serverTimestamp(),
        });

        navigate("/");
        return;
      }

      if (!validateLogin()) return;

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/");
    } catch {
      setErrors({ general: "Nieprawidłowy adres e-mail lub hasło." });
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 bg-white shadow-md rounded-xl p-8">
      <h1 className="text-3xl font-bold mb-6 text-center text-purple-700">
        {isRegister ? "Rejestracja" : "Logowanie"}
      </h1>

      {isRegister && (
        <>
          <label htmlFor="firstName" className="block text-sm font-medium mb-1">
            Imię
          </label>
          <input
            id="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.firstName && (
            <p className="text-sm text-red-600 mb-3">{errors.firstName}</p>
          )}

          <label htmlFor="lastName" className="block text-sm font-medium mb-1 mt-2">
            Nazwisko
          </label>
          <input
            id="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            className="w-full px-4 py-2 border rounded"
          />
          {errors.lastName && (
            <p className="text-sm text-red-600 mb-3">{errors.lastName}</p>
          )}
        </>
      )}

      <label htmlFor="email" className="block text-sm font-medium mb-1 mt-2">
        Adres e-mail
      </label>
      <input
        id="email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-4 py-2 border rounded"
      />
      {errors.email && (
        <p className="text-sm text-red-600 mb-3">{errors.email}</p>
      )}

      <label htmlFor="password" className="block text-sm font-medium mb-1 mt-2">
        Hasło
      </label>
      <input
        id="password"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className={`w-full px-4 py-2 border rounded ${
          errors.password ? "" : "mb-4"
        }`}
      />
      {errors.password && (
        <p className="text-sm text-red-600 mb-4">{errors.password}</p>
      )}

      {errors.general && (
        <p className="text-sm text-center mb-4 text-red-600">
          {errors.general}
        </p>
      )}

      <button
        onClick={handleAuth}
        className="w-full bg-purple-700 text-white py-2 rounded font-semibold hover:bg-purple-800 transition"
      >
        {isRegister ? "Zarejestruj się" : "Zaloguj się"}
      </button>

      <p
        className="mt-4 text-sm text-center text-purple-700 hover:underline cursor-pointer"
        onClick={() => setIsRegister(!isRegister)}
      >
        {isRegister
          ? "Masz już konto? Zaloguj się"
          : "Nie masz konta? Zarejestruj się"}
      </p>
    </div>
  );
};

export default Login;
