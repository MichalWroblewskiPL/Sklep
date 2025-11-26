import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  mainImageUrl: string;
  quantity: number;
}

const CartPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchCart = async () => {
      try {
        const ref = doc(db, "users", user.uid, "cart", "cart");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setItems(snap.data().items || []);
        } else {
          setItems([]);
        }
      } catch (err) {
        console.error("Błąd pobierania koszyka:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCart();
  }, [user]);

  const updateQuantity = async (productId: string, newQty: number) => {
    if (!user) return;

    const updated = items.map((item) =>
      item.productId === productId ? { ...item, quantity: newQty } : item
    );

    setItems(updated);

    const ref = doc(db, "users", user.uid, "cart", "cart");
    await updateDoc(ref, { items: updated });
  };

  const removeItem = async (productId: string) => {
    if (!user) return;

    const updated = items.filter((i) => i.productId !== productId);
    setItems(updated);

    const ref = doc(db, "users", user.uid, "cart", "cart");
    await updateDoc(ref, { items: updated });
  };

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-gray-600">
        Musisz być zalogowany, aby zobaczyć koszyk.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center text-gray-600">
        Ładowanie koszyka...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col justify-center items-center text-gray-600">
        <p>Twój koszyk jest pusty.</p>
        <button
          onClick={() => navigate("/shop")}
          className="mt-4 px-6 py-3 bg-purple-700 text-white rounded-lg"
        >
          Przejdź do sklepu
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Twój koszyk</h1>

      <div className="flex flex-col gap-6">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex gap-4 bg-white shadow rounded-lg p-4"
          >
            <img
              src={item.mainImageUrl}
              alt={item.name}
              className="w-32 h-32 rounded object-cover"
            />
            <div className="flex flex-col flex-1">
              <h2 className="text-xl font-semibold">{item.name}</h2>
              <p className="text-purple-700 font-bold">
                {(item.price * item.quantity).toFixed(2)} zł
              </p>

              <div className="flex items-center gap-3 mt-3">
                {/* Quantity selector */}
                <button
                  className="px-3 py-1 bg-gray-200 rounded"
                  disabled={item.quantity <= 1}
                  onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                >
                  -
                </button>

                <span className="px-4">{item.quantity}</span>

                <button
                  className="px-3 py-1 bg-gray-200 rounded"
                  disabled={item.quantity >= 5}
                  onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                >
                  +
                </button>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.productId)}
                  className="ml-auto text-red-600 hover:underline"
                >
                  Usuń
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Total */}
      <div className="mt-10 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Suma:</h2>
        <p className="text-3xl font-bold text-purple-700">
          {total.toFixed(2)} zł
        </p>
      </div>

      {/* Checkout button */}
      <button
        onClick={() => navigate("/checkout")}
        className="mt-6 w-full bg-purple-700 text-white py-3 rounded-lg text-lg font-semibold hover:bg-purple-800"
      >
        Przejdź do zakupu
      </button>
    </div>
  );
};

export default CartPage;
