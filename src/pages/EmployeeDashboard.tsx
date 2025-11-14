import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, deleteDoc, updateDoc } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { db, auth } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserRecord {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  role: string;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState<UserRecord | null>(null);

  // 🔐 Ochrona strony przed dostępem zwykłych userów
  useEffect(() => {
    if (!user) return;
    if (user.role !== "employee" && user.role !== "admin") {
      navigate("/"); // brak uprawnień
    }
  }, [user]);

  // 📌 Pobieranie wszystkich użytkowników
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnap = await getDocs(collection(db, "users"));
        const list = querySnap.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        })) as UserRecord[];

        setUsers(list);
      } catch (err) {
        console.error("Błąd pobierania użytkowników:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const startEdit = (u: UserRecord) => {
    setEditingUser(u);
    setForm({ ...u });
  };

  const saveEdit = async () => {
    if (!form) return;

    try {
      await updateDoc(doc(db, "users", form.id), {
        firstName: form.firstName || "",
        lastName: form.lastName || "",
        address: form.address || "",
        email: form.email,
        role: form.role,
      });

      setUsers((prev) =>
        prev.map((u) => (u.id === form.id ? form : u))
      );

      setEditingUser(null);
      setForm(null);
      alert("Dane użytkownika zostały zapisane.");
    } catch (err) {
      console.error("Błąd zapisu:", err);
    }
  };

  // 🛠 Reset hasła
  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Wysłano link do zmiany hasła na " + email);
    } catch (err) {
      console.error("Błąd resetu hasła:", err);
      alert("Nie udało się wysłać maila.");
    }
  };

  // 🗑 Usuwanie użytkownika
  const deleteUserAccount = async (id: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć tego użytkownika?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert("Użytkownik został usunięty.");
    } catch (err) {
      console.error("Błąd usuwania:", err);
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-600">Ładowanie...</p>;
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-purple-700 mb-6 text-center">
        Panel pracownika
      </h1>

      {/* =======================
          LISTA UŻYTKOWNIKÓW
      ======================== */}
      <h2 className="text-2xl font-semibold text-gray-800 mb-4">
        Zarządzanie użytkownikami
      </h2>

      <div className="bg-white rounded-xl shadow p-6">
        {users.length === 0 ? (
          <p>Brak użytkowników.</p>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b text-gray-700">
                <th className="p-2">Email</th>
                <th className="p-2">Imię</th>
                <th className="p-2">Nazwisko</th>
                <th className="p-2">Rola</th>
                <th className="p-2 text-right">Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b hover:bg-gray-100">
                  <td className="p-2">{u.email}</td>
                  <td className="p-2">{u.firstName}</td>
                  <td className="p-2">{u.lastName}</td>
                  <td className="p-2">{u.role}</td>
                  <td className="p-2 flex gap-2 justify-end">
                    <button
                      onClick={() => startEdit(u)}
                      className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                    >
                      Edytuj
                    </button>
                    <button
                      onClick={() => handlePasswordReset(u.email)}
                      className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Reset hasła
                    </button>
                    <button
                      onClick={() => deleteUserAccount(u.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Usuń
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* =======================
          MODAL EDYCJI UŻYTKOWNIKA
      ======================== */}
      {editingUser && form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edytuj użytkownika</h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Imię"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Nazwisko"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="text"
                placeholder="Adres"
                value={form.address}
                onChange={(e) =>
                  setForm({ ...form, address: e.target.value })
                }
                className="border rounded px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="border rounded px-3 py-2"
              />

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="border rounded px-3 py-2"
              >
                <option value="user">Użytkownik</option>
                <option value="employee">Pracownik</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setEditingUser(null);
                  setForm(null);
                }}
                className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                Anuluj
              </button>
              <button
                onClick={saveEdit}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Zapisz
              </button>
            </div>
          </div>
        </div>
      )}
    <h2 className="text-2xl font-semibold text-gray-800 mt-12 mb-4">
  Zarządzanie produktami
</h2>

<button
  onClick={() => navigate("/employee/products")}
  className="px-6 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition"
>
  Przejdź do listy produktów
</button>

    </div>
  );
};

export default EmployeeDashboard;
