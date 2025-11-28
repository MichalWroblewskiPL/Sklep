import { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase";
import { Link } from "react-router-dom";


const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string>("");

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage("");

    try {
      const actionCodeSettings = {
        url: `${window.location.origin}/login?reset=1`,
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(auth, email, actionCodeSettings);
      setMessage("Wysłaliśmy mail z linkiem do resetu hasła. Sprawdź swoją skrzynkę.");
    } catch (err: any) {
      setMessage(`Błąd: ${err?.message || "nie udało się wysłać maila."}`);
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
      <div className="bg-white shadow-md rounded-xl p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-center text-purple-700 mb-6">
          Reset hasła
        </h1>

        <form onSubmit={handleReset} className="flex flex-col gap-4">
          <input
            type="email"
            placeholder="Adres e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
          <button
            type="submit"
            className="bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
          >
            Wyślij link resetujący
          </button>
        </form>

        {message && (
          <p
            className={`text-center text-sm mt-4 ${
              message.includes("Wysłaliśmy mail") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        <div className="text-center mt-4">
          <Link to="/login" className="text-sm text-purple-700 hover:underline">
            Wróć do logowania
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
