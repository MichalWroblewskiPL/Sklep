import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { doc, updateDoc, deleteDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  sendPasswordResetEmail,
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";

const ValidationRules = {
  firstName: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]{2,30}$/,
  lastName: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ-]{2,50}$/,

  street: {
    validate: (v: string) => v.length <= 100,
    message: "Ulica: maksymalnie 100 znaków.",
  },
  city: {
    pattern: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]{2,50}$/,
    message: "Miasto: 2–50 znaków, tylko litery.",
  },
  postalCode: {
    pattern: /^\d{2}-\d{3}$/,
    message: "Kod pocztowy: format XX-XXX.",
  },
  country: {
    validate: (v: string) => v.length <= 50,
    message: "Kraj: maksymalnie 50 znaków.",
  },
  phone: {
    pattern: /^(\+48)?[0-9]{9}$/,
    message: "Telefon: 9 cyfr lub +48 i 9 cyfr.",
  },
};

type Errors = {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
  general?: string;
};

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    address: {
      street: user?.address?.street || "",
      postalCode: user?.address?.postalCode || "",
      city: user?.address?.city || "",
      country: user?.address?.country || "",
      phone: user?.address?.phone || "",
    },
  });

  const [errors, setErrors] = useState<Errors>({});
  const [msg, setMsg] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name in form.address) {
      setForm((p) => ({
        ...p,
        address: { ...p.address, [name]: value },
      }));
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Errors = {};

    if (!ValidationRules.firstName.test(form.firstName)) {
      newErrors.firstName = "Imię jest wymagane (2–30 znaków).";
    }

    if (!ValidationRules.lastName.test(form.lastName)) {
      newErrors.lastName = "Nazwisko jest wymagane (2–50 znaków).";
    }

    for (const key in form.address) {
      const value = form.address[key as keyof typeof form.address];
      const rule = ValidationRules[key as keyof typeof ValidationRules] as any;

      if (value && rule) {
        if (
          (rule.pattern && !rule.pattern.test(value)) ||
          (rule.validate && !rule.validate(value))
        ) {
          newErrors[key as keyof Errors] = rule.message;
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    setErrors({});
    setMsg("");

    if (!validateForm()) return;

    try {
      await updateDoc(doc(db, "users", user!.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        address: form.address,
      });
      setMsg("Dane zostały zapisane.");
    } catch {
      setErrors({ general: "Błąd zapisu danych." });
    }
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    try {
      await sendPasswordResetEmail(auth, user.email);
      setPwdMessage("Wysłano e-mail do resetu hasła.");
    } catch {
      setPwdMessage("Nie udało się wysłać wiadomości.");
    }
  };

  const confirmDeleteAccount = async () => {
    setDeleteError("");

    try {
      if (!deletePassword || !auth.currentUser?.email) return;

      const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        deletePassword
      );

      await reauthenticateWithCredential(auth.currentUser, credential);
      await deleteDoc(doc(db, "users", user!.uid));
      await deleteUser(auth.currentUser);

      await logout();
      navigate("/");
    } catch {
      setDeleteError("Nieprawidłowe hasło lub sesja wygasła.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white shadow rounded-xl mt-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        Twój profil
      </h1>

      <label className="block text-sm font-medium mb-1">Imię *</label>
      <input
        name="firstName"
        value={form.firstName}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
      />
      {errors.firstName && (
        <p className="text-sm text-red-600 mt-1 mb-3">
          {errors.firstName}
        </p>
      )}

      <label className="block text-sm font-medium mb-1 mt-2">
        Nazwisko *
      </label>
      <input
        name="lastName"
        value={form.lastName}
        onChange={handleChange}
        className="w-full px-4 py-2 border rounded"
      />
      {errors.lastName && (
        <p className="text-sm text-red-600 mt-1 mb-4">
          {errors.lastName}
        </p>
      )}

      <h2 className="text-xl font-semibold mt-6 mb-4">
        Adres dostawy
      </h2>

      {(["street", "postalCode", "city", "country", "phone"] as const).map(
        (field) => (
          <div key={field} className="mb-3">
            <label className="block text-sm font-medium mb-1">
              {field === "street" && "Ulica"}
              {field === "postalCode" && "Kod pocztowy"}
              {field === "city" && "Miasto"}
              {field === "country" && "Kraj"}
              {field === "phone" && "Telefon"}
            </label>
            <input
              name={field}
              value={form.address[field]}
              onChange={handleChange}
              className="w-full px-4 py-2 border rounded"
            />
            {errors[field] && (
              <p className="text-sm text-red-600 mt-1">
                {errors[field]}
              </p>
            )}
          </div>
        )
      )}

      {errors.general && (
        <p className="text-sm text-red-600 mt-2">
          {errors.general}
        </p>
      )}
      {msg && (
        <p className="text-sm text-green-600 mt-2">
          {msg}
        </p>
      )}

      <button
        onClick={handleSave}
        className="w-full mt-4 bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold"
      >
        Zapisz dane
      </button>

      <div className="mt-6 flex flex-col gap-3">
        <button
          onClick={() => navigate("/orders")}
          className="w-full border border-purple-600 text-purple-700 py-2 rounded font-semibold hover:bg-purple-50"
        >
          Moje zamówienia
        </button>

        <button
          onClick={handlePasswordReset}
          className="w-full border border-blue-600 text-blue-600 py-2 rounded font-semibold hover:bg-blue-50"
        >
          Zmień hasło
        </button>

        <button
          onClick={() => setShowDeleteModal(true)}
          className="w-full bg-red-600 text-white py-2 rounded font-semibold hover:bg-red-700"
        >
          Usuń konto
        </button>
      </div>

      {pwdMessage && (
        <p className="text-sm text-center text-gray-700 mt-3">
          {pwdMessage}
        </p>
      )}

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg p-6 w-full max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Potwierdź usunięcie konta
            </h2>

            <label className="block text-sm font-medium mb-1">
              Podaj hasło
            </label>
            <input
              type="password"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className="w-full px-4 py-2 border rounded mb-2"
            />

            {deleteError && (
              <p className="text-sm text-red-600 mb-2">
                {deleteError}
              </p>
            )}

            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletePassword("");
                  setDeleteError("");
                }}
                className="flex-1 py-2 border rounded"
              >
                Anuluj
              </button>

              <button
                onClick={confirmDeleteAccount}
                className="flex-1 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Usuń konto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
