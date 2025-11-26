import { useEffect, useState } from "react";
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
  role: string;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [form, setForm] = useState<UserRecord | null>(null);

  // Ochrona dostępu
  useEffect(() => {
    if (!user) return;
    if (user.role !== "employee" && user.role !== "admin") navigate("/");
  }, [user]);

  // Pobieranie użytkowników
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const snap = await getDocs(collection(db, "users"));
        const list = snap.docs.map((d) => ({
          id: d.id,
          ...d.data(),
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
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        role: form.role,
      });

      setUsers((prev) => prev.map((u) => (u.id === form.id ? form : u)));
      setEditingUser(null);
      setForm(null);
      alert("Dane zapisane.");
    } catch (err) {
      console.error(err);
    }
  };

  const handlePasswordReset = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
      alert("Wysłano link resetujący do " + email);
    } catch (err) {
      console.error(err);
      alert("Błąd wysyłania resetu hasła.");
    }
  };

  const deleteUserAccount = async (id: string) => {
    if (!window.confirm("Usunąć użytkownika?")) return;

    try {
      await deleteDoc(doc(db, "users", id));
      setUsers((prev) => prev.filter((u) => u.id !== id));
      alert("Usunięto użytkownika.");
    } catch (err) {
      console.error(err);
      alert("Błąd usuwania.");
    }
  };

  if (loading) {
    return <p className="text-center mt-10">Ładowanie...</p>;
  }

  return (
    <div className="min-h-screen p-10 bg-gray-50">
      <h1 className="text-4xl font-bold text-purple-700 mb-10 text-center">
        Panel pracownika
      </h1>

      {/* === ZARZĄDZANIE UŻYTKOWNIKAMI === */}
      <section className="bg-white rounded-xl shadow p-6 mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Zarządzanie użytkownikami
        </h2>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
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

                  {u.id !== user.uid && (
                    <button
                      onClick={() => deleteUserAccount(u.id)}
                      className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                      Usuń
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* === ZARZĄDZANIE PRODUKTAMI === */}
      <section className="bg-white rounded-xl shadow p-6 mb-12">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Zarządzanie produktami
        </h2>

        <button
          onClick={() => navigate("/employee/products")}
          className="px-6 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800"
        >
          Przejdź do listy produktów
        </button>
      </section>

      {/* === NOWE! ZARZĄDZANIE ZAMÓWIENIAMI === */}
      <section className="bg-white rounded-xl shadow p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
          Zarządzanie zamówieniami
        </h2>

        <p className="text-gray-600 mb-4">
          Przeglądaj wszystkie zamówienia, zmieniaj status i usuwaj zamówienia użytkowników.
        </p>

        <button
          onClick={() => navigate("/employee/orders")}
          className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700"
        >
          Przejdź do zamówień
        </button>
      </section>

      {/* === MODAL EDYCJI === */}
      {editingUser && form && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-lg">
            <h3 className="text-xl font-bold mb-4">Edytuj użytkownika</h3>

            <div className="flex flex-col gap-3">
              <input
                type="text"
                value={form.firstName}
                onChange={(e) =>
                  setForm({ ...form, firstName: e.target.value })
                }
                className="border rounded px-3 py-2"
                placeholder="Imię"
              />

              <input
                type="text"
                value={form.lastName}
                onChange={(e) =>
                  setForm({ ...form, lastName: e.target.value })
                }
                className="border rounded px-3 py-2"
                placeholder="Nazwisko"
              />

              <input
                type="email"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
                className="border rounded px-3 py-2"
                placeholder="Email"
              />

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
                className="border rounded px-3 py-2"
              >
                <option value="user">User</option>
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
    </div>
  );
};

export default EmployeeDashboard;
