import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLocation, useNavigate, Link } from "react-router-dom";

interface Product {
  id: string;
  name: string;
  price?: number;
  category?: string;
  mainImageUrl?: string;
  description?: string;
}

const ITEMS_PER_PAGE = 6;

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredCategory, setFilteredCategory] = useState("Wszystkie");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      const snap = await getDocs(collection(db, "products"));
      setProducts(
        snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Product[]
      );
      setLoading(false);
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    setFilteredCategory(cat || "Wszystkie");
    setPage(1);
  }, [location.search]);

  const categories = useMemo(() => {
    const set = new Set(["Wszystkie"]);
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filteredProducts =
    filteredCategory === "Wszystkie"
      ? products
      : products.filter((p) => p.category === filteredCategory);

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);

  const paginatedProducts = filteredProducts.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  return (
    <div className="bg-gray-50 py-16 px-6">
      <h1 className="text-4xl font-bold text-center text-purple-700 mb-10">
        Produkty
      </h1>

      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() =>
              navigate(
                cat === "Wszystkie"
                  ? "/shop"
                  : `/shop?category=${encodeURIComponent(cat)}`
              )
            }
            className={`px-5 py-2 rounded-full ${
              filteredCategory === cat
                ? "bg-purple-700 text-white"
                : "bg-white border text-purple-700"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center">Ładowanie…</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {paginatedProducts.map((p) => (
              <Link
                key={p.id}
                to={`/product/${p.id}`}
                className="bg-white rounded-xl shadow hover:shadow-lg"
              >
                <img
                  src={p.mainImageUrl}
                  alt={p.name}
                  className="h-48 w-full object-cover rounded-t-xl"
                />
                <div className="p-6">
                  <h3 className="font-semibold mb-2">{p.name}</h3>
                  <p className="text-purple-700 font-bold">
                    {p.price?.toFixed(2)} zł
                  </p>
                </div>
              </Link>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-40"
              >
                Poprzednia
              </button>
              <span className="self-center">
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
  );
};

export default Shop;
