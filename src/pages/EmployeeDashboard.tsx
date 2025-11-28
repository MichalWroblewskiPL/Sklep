import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

interface UserData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

const EmployeeDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<
    { id: string; data: UserData }[]
  >([]);

  useEffect(() => {
    if (!user) return;

    if (user.role !== "employee" && user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchUsers = async () => {
      const usersSnapshot = await getDocs(collection(db, "users"));
      const fetched = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        data: doc.data() as UserData,
      }));
      setUsers(fetched);
    };

    fetchUsers();
  }, [user]);

  const deleteUser = async (uid: string) => {
    if (!window.confirm("Czy na pewno chcesz usunąć użytkownika?")) return;
    await deleteDoc(doc(db, "users", uid));
    setUsers((prev) => prev.filter((u) => u.id !== uid));
  };

  const resetRole = async (uid: string) => {
    await updateDoc(doc(db, "users", uid), { role: "user" });
    setUsers((prev) =>
      prev.map((u) =>
        u.id === uid ? { ...u, data: { ...u.data, role: "user" } } : u
      )
    );
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-purple-700 mb-6 text-center">
        Panel pracownika
      </h1>

      {/* USERS */}
      <div className="bg-white shadow rounded-xl p-6 border border-gray-200 mb-10">
        <h2 className="text-xl font-semibold mb-4">Zarządzanie użytkownikami</h2>

        <table className="w-full border border-gray-300 text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Imię</th>
              <th className="p-2 text-left">Nazwisko</th>
              <th className="p-2 text-left">Rola / UID</th>
              <th className="p-2 text-left">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {users.map(({ id, data }) => (
              <tr key={id} className="border-t border-gray-200">
                <td className="p-2">{data.email}</td>
                <td className="p-2">{data.firstName}</td>
                <td className="p-2">{data.lastName}</td>
                <td className="p-2">
                  <div className="text-black">{data.role}</div>
                  <div className="text-xs font-mono text-gray-500">{id}</div>
                </td>
                <td className="p-2 flex flex-wrap gap-2">
                  <button
                    onClick={() => navigate(`/employee/users/${id}/edit`)}
                    className="px-3 py-1 bg-purple-600 text-white text-xs rounded"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => resetRole(id)}
                    className="px-3 py-1 bg-blue-600 text-white text-xs rounded"
                  >
                    Reset hasła
                  </button>
                  {user?.uid !== id && (
                    <button
                      onClick={() => deleteUser(id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded"
                    >
                      Usuń
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PRODUCTS */}
      <div className="bg-white shadow rounded-xl p-6 border border-gray-200 mb-10">
        <h2 className="text-xl font-semibold mb-3">Zarządzanie produktami</h2>
        <p className="text-sm text-gray-600 mb-4">
          Dodawaj, edytuj i usuwaj produkty w sklepie.
        </p>
        <button
          onClick={() => navigate("/employee/products")}
          className="bg-purple-600 text-white px-5 py-2 rounded hover:bg-purple-700"
        >
          Przejdź do listy produktów
        </button>
      </div>

      {/* ORDERS */}
      <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
        <h2 className="text-xl font-semibold mb-3">Zarządzanie zamówieniami</h2>
        <p className="text-sm text-gray-600 mb-4">
          Przeglądaj wszystkie zamówienia, zmieniaj status i usuwaj zamówienia użytkowników.
        </p>
        <button
          onClick={() => navigate("/employee/orders")}
          className="bg-green-600 text-white px-5 py-2 rounded hover:bg-green-700"
        >
          Przejdź do zamówień
        </button>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
