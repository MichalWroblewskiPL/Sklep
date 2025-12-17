import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type ProductDoc = {
  category?: string;
  mainImageUrl?: string;
};

const CATEGORIES_PER_PAGE = 6;

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [products, setProducts] = useState<ProductDoc[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const snap = await getDocs(collection(db, "products"));
        setProducts(snap.docs.map((d) => d.data() as ProductDoc));
      } catch (e) {
        console.error("Błąd pobierania produktów:", e);
      } finally {
        setLoadingCats(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const map = new Map<string, string | undefined>();

    for (const p of products) {
      const cat = (p.category || "").trim();
      if (!cat) continue;
      if (!map.has(cat)) {
        map.set(cat, p.mainImageUrl);
      }
    }

    if (map.size === 0) {
      return [
        {
          name: "Akcesoria komputerowe",
          img: "https://source.unsplash.com/600x400/?computer,accessory",
        },
        {
          name: "Karty graficzne",
          img: "https://source.unsplash.com/600x400/?gpu,graphics,computer",
        },
        {
          name: "Procesory",
          img: "https://source.unsplash.com/600x400/?cpu,processor,computer",
        },
      ];
    }

    return Array.from(map.entries()).map(([name, img]) => ({
      name,
      img: img || "https://source.unsplash.com/600x400/?computer,hardware",
    }));
  }, [products]);

  const totalPages = Math.ceil(
    categories.length / CATEGORIES_PER_PAGE
  );

  const paginatedCategories = categories.slice(
    (page - 1) * CATEGORIES_PER_PAGE,
    page * CATEGORIES_PER_PAGE
  );

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  const joinedDate = user?.createdAt
    ? user.createdAt.toDate().toLocaleDateString("pl-PL")
    : "";

  return (
    <div className="font-sans text-gray-900 bg-gray-50">
      <section className="bg-gradient-to-r from-purple-700 to-green-500 text-white py-24 px-6 text-center">
        <h1 className="text-6xl font-extrabold mb-4">
          Pc<span className="text-green-300">Base</span>
        </h1>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Twój sklep z komponentami komputerowymi, akcesoriami i sprzętem gamingowym.
        </p>
        <Link
          to="/shop"
          className="bg-white text-purple-700 px-8 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition"
        >
          Przeglądaj produkty
        </Link>
      </section>

      <section className="py-20 px-8">
        <h2 className="text-3xl font-bold text-center mb-12">
          Kategorie produktów
        </h2>

        {loadingCats ? (
          <p className="text-center">Ładowanie kategorii…</p>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
              {paginatedCategories.map((cat) => (
                <div
                  key={cat.name}
                  onClick={() => handleCategoryClick(cat.name)}
                  className="bg-white shadow-md rounded-xl overflow-hidden hover:shadow-xl cursor-pointer transition"
                >
                  <img
                    src={cat.img}
                    alt={cat.name}
                    className="h-52 w-full object-cover"
                  />
                  <div className="p-6 text-center">
                    <h3 className="text-xl font-semibold mb-2">
                      {cat.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      Zobacz produkty w tej kategorii
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-12">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                  className="px-4 py-2 border rounded disabled:opacity-40"
                >
                  Poprzednia
                </button>

                <span className="text-sm">
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
      </section>

      <section className="py-20 bg-purple-700 text-white text-center">
        {!user ? (
          <>
            <h2 className="text-3xl font-bold mb-6">
              Dołącz do PcBase już dziś
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto text-gray-200">
              Utwórz konto, aby zapisywać swoje zamówienia i korzystać z naszych zniżek.
            </p>
            <Link
              to="/login"
              className="bg-green-500 px-8 py-3 rounded-full font-semibold hover:bg-green-600 transition"
            >
              Zaloguj się
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4">
              {user.firstName}, jesteś z PcBase od {joinedDate}!
            </h2>
            <p className="text-lg text-gray-200">
              Dziękujemy za Twoje zaufanie!
            </p>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
