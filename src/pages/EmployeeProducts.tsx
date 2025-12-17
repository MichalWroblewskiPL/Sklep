import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface Product {
  id: string;
  name?: string;
  price?: number;
  category?: string;
  stockQuantity?: number;
}

const ITEMS_PER_PAGE = 10;

const EmployeeProducts = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

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

        // 🔒 USUWAMY PRODUKTY BEZ NAZWY
        const validProducts = list.filter(
          (p) => typeof p.name === "string" && p.name.trim() !== ""
        );

        setProducts(validProducts);
      } catch (err) {
        console.error("Błąd pobierania produktów:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [user, navigate]);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;

    return products.filter(
      (p) =>
        typeof p.name === "string" &&
        p.name.toLowerCase().includes(q)
    );
  }, [products, search]);

  const totalPages = Math.ceil(
    filteredProducts.length / ITEMS_PER_PAGE
  );

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (loading) {
    return (
      <p className="p-10 text-center text-gray-600">
        Ładowanie produktów...
      </p>
    );
  }

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h1 className="text-4xl font-bold text-purple-700 mb-8 text-center">
        Zarządzanie produktami
      </h1>

      <div className="max-w-md mx-auto mb-6">
        <input
          type="text"
          placeholder="Szukaj produktu po nazwie"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow min-h-[300px]">
        {filteredProducts.length === 0 ? (
          <p className="text-center text-gray-500 py-20">
            Brak produktów spełniających kryteria wyszukiwania.
          </p>
        ) : (
          <>
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
                {paginatedProducts.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b hover:bg-gray-100"
                  >
                    <td className="p-2">{p.name}</td>
                    <td className="p-2">
                      {p.price ?? 0} zł
                    </td>
                    <td className="p-2">
                      {p.category ?? "-"}
                    </td>
                    <td className="p-2">
                      {p.stockQuantity ?? 0}
                    </td>
                    <td className="p-2 text-right">
                      <button
                        onClick={() =>
                          navigate(`/employee/products/${p.id}`)
                        }
                        className="px-3 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Edytuj
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border rounded disabled:opacity-40"
                >
                  Poprzednia
                </button>

                <span>
                  {page} / {totalPages}
                </span>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => p + 1)}
                  className="px-4 py-2 border rounded disabled:opacity-40"
                >
                  Następna
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EmployeeProducts;
