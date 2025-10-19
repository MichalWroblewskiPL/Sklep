import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Home = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const categories = [
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

  const handleCategoryClick = (category: string) => {
    navigate(`/shop?category=${encodeURIComponent(category)}`);
  };

  return (
    <div className="font-sans text-gray-900 bg-gray-50">
      {/* HERO */}
      <section className="bg-gradient-to-r from-purple-700 to-green-500 text-white py-24 px-6 flex flex-col items-center text-center shadow-inner">
        <h1 className="text-6xl font-extrabold mb-4 tracking-tight">
          Pc<span className="text-green-300">Base</span>
        </h1>
        <p className="text-lg mb-8 max-w-2xl leading-relaxed text-gray-100">
          Twój sklep z komponentami komputerowymi, akcesoriami i sprzętem gamingowym.
          Szybko, nowocześnie i w dobrej cenie.
        </p>
        <Link
          to="/shop"
          className="bg-white text-purple-700 px-8 py-3 rounded-full font-semibold shadow hover:bg-gray-100 transition"
        >
          Przeglądaj produkty
        </Link>
      </section>

      {/* KATEGORIE */}
      <section className="py-20 px-8 bg-gray-50">
        <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
          Kategorie produktów
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 max-w-6xl mx-auto">
          {categories.map((cat) => (
            <div
              key={cat.name}
              onClick={() => handleCategoryClick(cat.name)}
              className="bg-white shadow-md rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-2xl transition transform cursor-pointer"
            >
              <img
                src={cat.img}
                alt={cat.name}
                className="w-full h-52 object-cover"
              />
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {cat.name}
                </h3>
                <p className="text-gray-500 text-sm">
                  Zobacz produkty w tej kategorii
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-purple-700 text-white text-center">
        {user ? (
          <>
            <h2 className="text-3xl font-bold mb-6">
              Witaj ponownie, {user.email?.split("@")[0]}!
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto text-gray-200">
              Możesz sprawdzić swoje dane i historię zamówień w swoim profilu.
            </p>
            <Link
              to="/profile"
              className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-green-600 transition"
            >
              Przejdź do profilu
            </Link>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-6">
              Dołącz do PcBase już dziś
            </h2>
            <p className="text-lg mb-8 max-w-xl mx-auto text-gray-200">
              Utwórz konto, aby zapisywać swoje zamówienia i korzystać z naszych zniżek.
            </p>
            <Link
              to="/login"
              className="bg-green-500 text-white px-8 py-3 rounded-full font-semibold shadow hover:bg-green-600 transition"
            >
              Zaloguj się
            </Link>
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
