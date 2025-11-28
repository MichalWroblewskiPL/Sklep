import { useEffect, useMemo, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useLocation, useNavigate, Link } from "react-router-dom";


interface Product {
  id: string;
  name: string;
  price?: number; 
  category?: string;
  stockQuantity?: number;
  mainImageUrl?: string;
  description?: string;
}

const Shop = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [filteredCategory, setFilteredCategory] = useState<string>("Wszystkie");
  const [loading, setLoading] = useState(true);

  // Pobierz produkty z Firestore
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snapshot = await getDocs(collection(db, "products"));
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Product[];
        setProducts(data);
      } catch (error) {
        console.error("Błąd podczas pobierania produktów:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const cat = params.get("category");
    if (cat) setFilteredCategory(cat);
  }, [location.search]);

  const categories = useMemo(() => {
    const set = new Set<string>(["Wszystkie"]);
    products.forEach((p) => p.category && set.add(p.category));
    return Array.from(set);
  }, [products]);

  const filteredProducts =
    filteredCategory === "Wszystkie"
      ? products
      : products.filter((p) => p.category === filteredCategory);

  const handleCategoryClick = (cat: string) => {
    setFilteredCategory(cat);
    if (cat === "Wszystkie") {
      navigate("/shop", { replace: true });
    } else {
      navigate(`/shop?category=${encodeURIComponent(cat)}`, { replace: true });
    }
  };

  const formatPrice = (price?: number) =>
    typeof price === "number" ? `${price.toFixed(2)} zł` : "—";

  return (
    <div className="min-h-screen bg-gray-50 py-16 px-6">
      <h1 className="text-4xl font-bold text-center text-purple-700 mb-10">
        Nasze produkty
      </h1>

      <div className="flex justify-center gap-4 mb-10 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => handleCategoryClick(cat)}
            className={`px-5 py-2 rounded-full font-medium transition ${
              filteredCategory === cat
                ? "bg-purple-700 text-white shadow"
                : "bg-white text-purple-700 border border-purple-300 hover:bg-purple-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-center text-gray-600">Ładowanie produktów...</p>
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {filteredProducts.map((product) => (
            <Link
              to={`/product/${product.id}`}
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition block">
              <img
                src={product.mainImageUrl}
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{product.name}</h3>
                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                  {product.description}
                </p>
                <p className="text-lg font-bold text-purple-700">
                  {product.price ? `${product.price.toFixed(2)} zł` : "—"}
                </p>
            </div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-600">
          Brak produktów w tej kategorii.
        </p>
      )}
    </div>
  );
};

export default Shop;
