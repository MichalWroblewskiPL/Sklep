import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useParams } from "react-router-dom";

const EmployeeEditProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "employee" && user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchProduct = async () => {
      try {
        const ref = doc(db, "products", id!);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setMessage("Nie znaleziono produktu.");
          return;
        }

        setForm(snap.data());
      } catch (e) {
        console.error("Błąd pobierania produktu:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [user]);

  const save = async () => {
    try {
      await updateDoc(doc(db, "products", id!), {
        ...form,
      });

      setMessage("Zmiany zapisane!");
      setTimeout(() => navigate("/employee/products"), 800);
    } catch (e) {
      console.error("Błąd zapisu produktu:", e);
      setMessage("Błąd zapisu.");
    }
  };

  if (loading) return <p className="p-10 text-center">Ładowanie...</p>;
  if (!form) return <p className="p-10 text-center">{message}</p>;

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">
        Edycja produktu
      </h1>

      <div className="bg-white p-8 rounded-xl shadow w-full max-w-xl">
        <div className="flex flex-col gap-4">
          <input
            className="border rounded px-3 py-2"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Nazwa"
          />

          <input
            className="border rounded px-3 py-2"
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            placeholder="Cena"
          />

          <input
            className="border rounded px-3 py-2"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            placeholder="Kategoria"
          />

          <input
            className="border rounded px-3 py-2"
            type="number"
            value={form.stockQuantity}
            onChange={(e) =>
              setForm({ ...form, stockQuantity: Number(e.target.value) })
            }
            placeholder="Ilość"
          />

          <textarea
            className="border rounded px-3 py-2"
            rows={4}
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
            placeholder="Opis"
          />

          {message && (
            <p className="text-center text-purple-700 font-semibold">{message}</p>
          )}

          <button
            onClick={save}
            className="bg-purple-700 text-white py-2 rounded-lg font-semibold hover:bg-purple-800 transition"
          >
            Zapisz zmiany
          </button>

          <button
            onClick={() => navigate("/employee/products")}
            className="bg-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-400 transition"
          >
            Powrót
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeEditProduct;
