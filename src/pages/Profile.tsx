import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import {
  updateEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
  sendPasswordResetEmail,
} from "firebase/auth";

const Profile = () => {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    address: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  // ---- Stan dla zmiany hasła ----
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");

  // 🔹 Pobierz dane użytkownika z Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData({
            firstName: docSnap.data().firstName || "",
            lastName: docSnap.data().lastName || "",
            address: docSnap.data().address || "",
            email: docSnap.data().email || "",
          });
        }
      } catch (err) {
        console.error("Błąd pobierania danych profilu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh]">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">
          Musisz być zalogowany, aby zobaczyć swój profil
        </h2>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <p className="text-gray-500">Ładowanie danych...</p>
      </div>
    );
  }

  // 🔹 Obsługa edycji pól
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // 🔹 Zapis zmian w Firestore i Firebase Auth (email)
  const handleSave = async () => {
    try {
      if (!user) return;
      const docRef = doc(db, "users", user.uid);

      await updateDoc(docRef, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        address: formData.address,
        email: formData.email,
      });

      // Jeśli użytkownik zmienił e-mail, zaktualizuj też w Firebase Auth
      if (auth.currentUser && auth.currentUser.email !== formData.email) {
        await updateEmail(auth.currentUser, formData.email);
      }

      setEditing(false);
      setMessage("✅ Dane zostały zaktualizowane!");
    } catch (err) {
      console.error("Błąd zapisu danych:", err);
      setMessage("❌ Wystąpił błąd podczas zapisywania zmian.");
    }
  };

  // 🔒 Zmiana hasła (z reautoryzacją)
  const handleChangePassword = async () => {
    setPwdMessage("");

    // Walidacja prostych warunków
    if (newPassword.length < 6) {
      setPwdMessage("❌ Nowe hasło musi mieć co najmniej 6 znaków.");
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setPwdMessage("❌ Nowe hasła nie są identyczne.");
      return;
    }
    if (!auth.currentUser || !auth.currentUser.email) {
      setPwdMessage("❌ Brak zalogowanego użytkownika lub adresu e-mail.");
      return;
    }
    try {
      // Firebase wymaga „świeżych” poświadczeń — reautoryzacja
      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Aktualizacja hasła
      await updatePassword(auth.currentUser, newPassword);

      setPwdMessage("✅ Hasło zostało zmienione.");
      setCurrentPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
      setShowPasswordBox(false);
    } catch (err: any) {
      // Typowe kody błędów Firebase
      const code = err?.code || "";
      if (code === "auth/wrong-password") {
        setPwdMessage("❌ Błędne obecne hasło.");
      } else if (code === "auth/too-many-requests") {
        setPwdMessage(
          "❌ Zbyt wiele prób. Spróbuj ponownie później lub użyj resetu hasła e-mailem."
        );
      } else if (code === "auth/requires-recent-login") {
        setPwdMessage(
          "ℹ️ Wymagane ponowne zalogowanie. Możesz też skorzystać z resetu hasła e-mailem."
        );
      } else {
        setPwdMessage("❌ Nie udało się zmienić hasła.");
        console.error("Password change error:", err);
      }
    }
  };

  // ✉️ Alternatywa: wyślij link resetujący na e-mail
  const handleSendResetLink = async () => {
    setPwdMessage("");
    if (!auth.currentUser || !auth.currentUser.email) {
      setPwdMessage("❌ Brak zalogowanego użytkownika lub adresu e-mail.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, auth.currentUser.email);
      setPwdMessage("✅ Wysłano wiadomość z linkiem do zmiany hasła.");
    } catch (err) {
      console.error("Reset email error:", err);
      setPwdMessage("❌ Nie udało się wysłać wiadomości resetującej.");
    }
  };

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
          Twój profil
        </h2>

        {/* Dane profilowe */}
        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="firstName"
            placeholder="Imię"
            value={formData.firstName}
            onChange={handleChange}
            disabled={!editing}
            className={`border rounded px-3 py-2 ${
              editing ? "border-purple-500" : "border-gray-300 bg-gray-100"
            }`}
          />
          <input
            type="text"
            name="lastName"
            placeholder="Nazwisko"
            value={formData.lastName}
            onChange={handleChange}
            disabled={!editing}
            className={`border rounded px-3 py-2 ${
              editing ? "border-purple-500" : "border-gray-100"
            }`}
          />
          <input
            type="text"
            name="address"
            placeholder="Adres"
            value={formData.address}
            onChange={handleChange}
            disabled={!editing}
            className={`border rounded px-3 py-2 ${
              editing ? "border-purple-500" : "border-gray-100"
            }`}
          />
          <input
            type="email"
            name="email"
            placeholder="Adres e-mail"
            value={formData.email}
            onChange={handleChange}
            disabled={!editing}
            className={`border rounded px-3 py-2 ${
              editing ? "border-purple-500" : "border-gray-100"
            }`}
          />
        </div>

        {message && (
          <p
            className={`text-center text-sm mt-4 ${
              message.includes("✅") ? "text-green-600" : "text-red-600"
            }`}
          >
            {message}
          </p>
        )}

        {/* Akcje profilu */}
        <div className="flex justify-center mt-6 gap-3 flex-wrap">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition"
              >
                Zapisz
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setMessage("");
                }}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Anuluj
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setEditing(true)}
                className="bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
              >
                Edytuj dane
              </button>
              <button
                onClick={() => {
                  setShowPasswordBox((s) => !s);
                  setPwdMessage("");
                }}
                className="bg-white border border-purple-300 text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                Zmień hasło
              </button>
            </>
          )}
        </div>

        {/* Sekcja zmiany hasła */}
        {showPasswordBox && (
          <div className="mt-8 border-t pt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Zmiana hasła
            </h3>

            <div className="flex flex-col gap-3">
              <input
                type="password"
                placeholder="Obecne hasło"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="password"
                placeholder="Nowe hasło (min. 6 znaków)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <input
                type="password"
                placeholder="Powtórz nowe hasło"
                value={newPasswordConfirm}
                onChange={(e) => setNewPasswordConfirm(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {pwdMessage && (
              <p
                className={`text-center text-sm mt-4 ${
                  pwdMessage.startsWith("✅")
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {pwdMessage}
              </p>
            )}

            <div className="mt-5 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={handleChangePassword}
                className="bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
              >
                Zapisz nowe hasło
              </button>
              <button
                onClick={handleSendResetLink}
                className="bg-white border border-purple-300 text-purple-700 px-6 py-2 rounded-lg font-semibold hover:bg-purple-50 transition"
              >
                Wyślij link resetujący e-mailem
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
