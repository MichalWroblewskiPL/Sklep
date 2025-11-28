import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const EmployeeUserEdit = () => {
  const { uid } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user || user.role !== "employee") {
      navigate("/");
      return;
    }

    const load = async () => {
      try {
        const snap = await getDoc(doc(db, "users", uid!));
        if (snap.exists()) {
          const data = snap.data();
          setRole(data.role || "user");
        }
      } catch (e) {
        console.error("Błąd:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, uid]);

  const update = async () => {
    try {
      await updateDoc(doc(db, "users", uid!), { role });
      setMsg("Zaktualizowano dane użytkownika");
    } catch (e) {
      console.error("Błąd:", e);
      setMsg("Nie udało się zapisać zmian");
    }
  };

  if (loading) return <p className="text-center mt-10">Ładowanie...</p>;

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded shadow border">
      <h1 className="text-2xl font-bold text-purple-700 mb-6">
        Edycja użytkownika
      </h1>

      <p className="mb-4 text-sm text-gray-600 font-mono">UID: {uid}</p>

      <div className="mb-4">
        <label className="block mb-1 text-gray-700">Rola:</label>
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="border px-4 py-2 rounded w-full"
        >
          <option value="user">user</option>
          <option value="employee">employee</option>
        </select>
      </div>

      <div className="flex justify-between mt-6">
        <button
          onClick={() => navigate("/employee")}
          className="bg-gray-200 px-4 py-2 rounded"
        >
          Anuluj
        </button>

        <button
          onClick={update}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Zapisz zmiany
        </button>
      </div>

      {msg && <p className="text-purple-700 mt-4">{msg}</p>}
    </div>
  );
};

export default EmployeeUserEdit;
