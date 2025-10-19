import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db, auth } from "../firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updateEmail } from "firebase/auth";

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

  // 🔹 Zapis zmian w Firestore i Firebase Auth
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

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="bg-white shadow-lg rounded-xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
          Twój profil
        </h2>

        <div className="flex flex-col gap-4">
          <input
            type="text"
            name="firstName"
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

        <div className="flex justify-center mt-6">
          {editing ? (
            <>
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition mr-3"
              >
                Zapisz
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
              >
                Anuluj
              </button>
            </>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="bg-purple-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
            >
              Edytuj dane
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
