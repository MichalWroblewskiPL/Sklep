import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { addToCart } from "../utils/cart";

const ProductPage = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const ref = doc(db, "products", id!);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setProduct({ id: snap.id, ...snap.data() });
        }
      } catch (err) {
        console.error("Błąd pobierania produktu:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id]);

  const handleAddToCart = async () => {
    if (!user) {
      setMessage("Musisz być zalogowany, aby dodać produkt do koszyka.");
      return;
    }

    if (user.role === "employee" || user.role === "admin") {
      setMessage("Pracownik nie może dodawać produktów do koszyka.");
      return;
    }

    try {
      await addToCart(user.uid, {
        id: product.id,
        name: product.name,
        price: product.price,
        mainImageUrl: product.mainImageUrl,
      });

      setMessage("Produkt dodany do koszyka!");
    } catch (err: any) {
      if (err.message === "MAX_LIMIT_5") {
        setMessage("Możesz dodać maksymalnie 5 sztuk tego produktu.");
      } else {
        setMessage("Błąd podczas dodawania do koszyka.");
      }
    }

    setTimeout(() => setMessage(""), 3000);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-gray-600">
        Ładowanie produktu...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-gray-600">
        Nie znaleziono produktu.
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-10">
      <img
        src={product.mainImageUrl}
        alt={product.name}
        className="rounded-xl shadow-lg w-full h-96 object-cover"
      />

      <div>
        <h1 className="text-4xl font-bold text-gray-900">{product.name}</h1>

        <p className="text-purple-700 text-3xl font-semibold mt-4">
          {product.price.toFixed(2)} zł
        </p>

        <p className="mt-6 text-gray-700 leading-relaxed">
          {product.description}
        </p>

        {product.specifications && (
          <div className="mt-6 bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold text-lg mb-2">Specyfikacja:</h3>
            <ul className="text-sm text-gray-700">
              {Object.entries(product.specifications).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong> <span>{String(value)}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {user?.role === "employee" || user?.role === "admin" ? (
          <p className="mt-6 text-red-600 font-semibold">
            Pracownik nie może dodawać produktów do koszyka.
          </p>
        ) : (
          <button
            onClick={handleAddToCart}
            className="mt-6 px-8 py-3 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition"
          >
            Dodaj do koszyka
          </button>
        )}

        {message && (
          <p className="mt-4 font-medium text-purple-700">{message}</p>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
