import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  stockQuantity: number;
  mainImageUrl: string;
  description: string;
}

const EmployeeProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    if (user.role !== "employee" && user.role !== "admin") {
      navigate("/");
      return;
    }

    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const list = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];

        setProducts(list);
      } catch (e) {
        console.error("Błąd pobierania produktów:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user]);

  if (loading) return <p className="p-10 text-center">Ładowanie...</p>;

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-purple-700 mb-6 text-center">
        Zarządzanie produktami
      </h1>

      <div className="bg-white p-6 rounded-xl shadow">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-gray-700">
              <th className="p-2">Nazwa</th>
              <th className="p-2">Cena</th>
              <th className="p-2">Kategoria</th>
              <th className="p-2">Ilość</th>
              <th className="p-2 text-right">Akcje</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-100">
                <td className="p-2">{p.name}</td>
                <td className="p-2">{p.price} zł</td>
                <td className="p-2">{p.category}</td>
                <td className="p-2">{p.stockQuantity}</td>
                <td className="p-2 text-right">
                  <button
                    onClick={() => navigate(`/employee/products/${p.id}`)}
                    className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Edytuj
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {products.length === 0 && (
          <p className="text-center text-gray-500 mt-4">Brak produktów.</p>
        )}
      </div>
    </div>
  );
};

export default EmployeeProducts;
