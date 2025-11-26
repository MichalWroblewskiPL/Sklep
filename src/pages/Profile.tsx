import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
    email: "",
    street: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState("");

  // hasło
  const [showPasswordBox, setShowPasswordBox] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");

  // pobierz dane użytkownika
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (snap.exists()) {
          const data = snap.data();
          setFormData({
            firstName: data.firstName || "",
            lastName: data.lastName || "",
            email: data.email || "",
            street: data.address?.street || "",
            city: data.address?.city || "",
            postalCode: data.address?.postalCode || "",
            country: data.address?.country || "",
            phone: data.address?.phone || "",
          });
        }
      } catch (err) {
        console.error("Błąd pobierania profilu", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  if (!user)
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <h2 className="text-2xl text-purple-700 font-bold">
          Musisz być zalogowany
        </h2>
      </div>
    );

  if (loading)
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-gray-600">
        Ładowanie profilu...
      </div>
    );

  // obsługa zmian inputów
  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // zapis danych
  const handleSave = async () => {
    try {
      const ref = doc(db, "users", user.uid);

      await updateDoc(ref, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        address: {
          street: formData.street,
          city: formData.city,
          postalCode: formData.postalCode,
          country: formData.country,
          phone: formData.phone,
        },
      });

      if (auth.currentUser && auth.currentUser.email !== formData.email)
        await updateEmail(auth.currentUser, formData.email);

      setEditing(false);
      setMessage("✅ Dane zaktualizowane!");
    } catch (err) {
      console.error(err);
      setMessage("❌ Błąd zapisu");
    }
  };

  // zmiana hasła
  const handleChangePassword = async () => {
    setPwdMessage("");

    if (newPassword !== newPasswordConfirm)
      return setPwdMessage("❌ Hasła nie są identyczne");

    if (newPassword.length < 6)
      return setPwdMessage("❌ Minimum 6 znaków");

    try {
      const credential = EmailAuthProvider.credential(
        auth.currentUser!.email!,
        currentPassword
      );

      await reauthenticateWithCredential(auth.currentUser!, credential);
      await updatePassword(auth.currentUser!, newPassword);

      setPwdMessage("✅ Hasło zostało zmienione");
      setShowPasswordBox(false);
    } catch (err: any) {
      console.error(err);
      setPwdMessage("❌ Błąd zmiany hasła");
    }
  };

  // reset hasła przez e-mail
  const handleSendResetLink = async () => {
    try {
      await sendPasswordResetEmail(auth, formData.email);
      setPwdMessage("📩 Link wysłany na e-mail");
    } catch (err) {
      console.error(err);
      setPwdMessage("❌ Błąd wysyłania linku");
    }
  };

  return (
    <div className="min-h-[80vh] bg-gray-50 px-4 py-10 flex justify-center">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* KAFEL 1 — Dane użytkownika */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Dane osobowe
          </h2>

          <div className="flex flex-col gap-3">
            <input
              name="firstName"
              disabled={!editing}
              placeholder="Imię"
              value={formData.firstName}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="lastName"
              disabled={!editing}
              placeholder="Nazwisko"
              value={formData.lastName}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="email"
              disabled={!editing}
              placeholder="E-mail"
              value={formData.email}
              onChange={handleChange}
              className="input-field"
            />

            {message && (
              <p className="text-sm text-center mt-2 text-green-600">
                {message}
              </p>
            )}

            <div className="flex gap-2 mt-3">
              {editing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="btn-primary flex-1"
                  >
                    Zapisz
                  </button>
                  <button
                    onClick={() => setEditing(false)}
                    className="btn-secondary flex-1"
                  >
                    Anuluj
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="btn-primary w-full"
                >
                  Edytuj dane
                </button>
              )}
            </div>
          </div>
        </div>

        {/* KAFEL 2 — Adres dostawy */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Adres dostawy
          </h2>

          <div className="flex flex-col gap-3">
            <input
              name="street"
              disabled={!editing}
              placeholder="Ulica i numer"
              value={formData.street}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="city"
              disabled={!editing}
              placeholder="Miasto"
              value={formData.city}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="postalCode"
              disabled={!editing}
              placeholder="Kod pocztowy"
              value={formData.postalCode}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="country"
              disabled={!editing}
              placeholder="Kraj"
              value={formData.country}
              onChange={handleChange}
              className="input-field"
            />

            <input
              name="phone"
              disabled={!editing}
              placeholder="Telefon"
              value={formData.phone}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* KAFEL 3 — Zamówienia */}
        <Link
          to="/orders"
          className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 hover:shadow-xl transition cursor-pointer flex flex-col justify-center items-center"
        >
          <h2 className="text-xl font-semibold text-gray-900">
            Moje zamówienia
          </h2>
          <p className="text-purple-700 font-medium mt-2">
            Zobacz historię zamówień →
          </p>
        </Link>

        {/* KAFEL 4 — Zmiana hasła */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Bezpieczeństwo konta
          </h2>

          <button
            onClick={() => setShowPasswordBox((v) => !v)}
            className="btn-secondary w-full"
          >
            Zmień hasło
          </button>

          {showPasswordBox && (
            <div className="mt-4 flex flex-col gap-3">
              <input
                type="password"
                placeholder="Obecne hasło"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Nowe hasło"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-field"
              />
              <input
                type="password"
                placeholder="Powtórz hasło"
                value={newPasswordConfirm}
                onChange={(e) =>
                  setNewPasswordConfirm(e.target.value)
                }
                className="input-field"
              />

              {pwdMessage && (
                <p
                  className={`text-sm text-center ${
                    pwdMessage.startsWith("✅")
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                >
                  {pwdMessage}
                </p>
              )}

              <button
                onClick={handleChangePassword}
                className="btn-primary w-full"
              >
                Zapisz nowe hasło
              </button>

              <button
                onClick={handleSendResetLink}
                className="btn-secondary w-full"
              >
                Wyślij link resetujący
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
