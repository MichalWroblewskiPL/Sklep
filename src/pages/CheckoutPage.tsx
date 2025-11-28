import { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  doc,
  getDoc,
  runTransaction,
  collection,
  serverTimestamp,
} from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface CartItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  mainImageUrl: string;
}

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadCart = async () => {
      try {
        const cartRef = doc(db, "users", user.uid, "cart", "cart");
        const snap = await getDoc(cartRef);

        if (snap.exists()) {
          setItems(snap.data().items || []);
        }
      } catch (err) {
        console.error("Błąd ładowania koszyka:", err);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [user]);

  if (!user) {
    return (
      <div className="p-10 text-center text-gray-700">
        Musisz być zalogowany, aby złożyć zamówienie.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">
        Ładowanie koszyka...
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="p-10 text-center text-gray-700">
        Twój koszyk jest pusty.
      </div>
    );
  }

  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

const handlePurchase = async () => {
  setMessage("");

  try {
    await runTransaction(db, async (transaction) => {

      const cartRef = doc(db, "users", user!.uid, "cart", "cart");
      const cartSnap = await transaction.get(cartRef);

      if (!cartSnap.exists()) throw new Error("EMPTY_CART");

      const cartItems: CartItem[] = cartSnap.data().items || [];
      if (cartItems.length === 0) throw new Error("EMPTY_CART");

      // Pobierz produkty
      const productRefs = cartItems.map((item) =>
        doc(db, "products", item.productId)
      );

      const productSnaps = await Promise.all(
        productRefs.map((ref) => transaction.get(ref))
      );

      // Sprawdz stock
      productSnaps.forEach((snap, i) => {
        if (!snap.exists()) throw new Error("PRODUCT_NOT_FOUND");

        const stock = snap.data().stockQuantity ?? 0;
        const qty = cartItems[i].quantity;

        if (stock < qty) throw new Error("NOT_ENOUGH_STOCK");
      });

      // Update stocka
      productSnaps.forEach((snap, i) => {
        const ref = productRefs[i];
        const stock = snap.data()?.stockQuantity;
        const qty = cartItems[i].quantity;

        transaction.update(ref, {
          stockQuantity: stock - qty,
        });
      });

      // Nowe zamówienie
      const orderRef = doc(collection(db, "users", user!.uid, "orders"));

      transaction.set(orderRef, {
        createdAt: serverTimestamp(),
        totalValue: total,
        status: "Oczekujące",
        items: cartItems.map((i) => ({
          productId: i.productId,
          productName: i.name,
          quantity: i.quantity,
          unitPrice: i.price,
        })),
      });

      // Czyszczenie koszyka
      transaction.update(cartRef, { items: [] });
    });

    setMessage("Zamówienie zostało złożone pomyślnie!");
    setTimeout(() => navigate("/orders"), 1200);

  } catch (err: any) {
    console.error(err);

    if (err.message === "NOT_ENOUGH_STOCK") {
      setMessage("Brakuje produktów na magazynie.");
    } else if (err.message === "EMPTY_CART") {
      setMessage("Twój koszyk jest pusty.");
    } else {
      setMessage("Wystąpił błąd podczas składania zamówienia.");
    }
  }
};


  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Podsumowanie zamówienia</h1>

      <div className="bg-white shadow rounded-xl p-6 mb-8">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between border-b py-4"
          >
            <div>
              <p className="font-semibold text-gray-900">{item.name}</p>
              <p className="text-sm text-gray-600">
                {item.quantity} × {item.price.toFixed(2)} zł
              </p>
            </div>

            <p className="text-lg font-bold text-purple-700">
              {(item.price * item.quantity).toFixed(2)} zł
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-100 rounded-xl p-6 text-xl font-semibold text-gray-900">
        Razem:{" "}
        <span className="text-purple-700">{total.toFixed(2)} zł</span>
      </div>

      {message && (
        <p className="mt-4 text-center text-lg font-medium text-purple-700">
          {message}
        </p>
      )}

      <button
        onClick={handlePurchase}
        className="mt-8 w-full px-8 py-4 bg-green-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:bg-green-700 transition"
      >
        Zapłać
      </button>
    </div>
  );
};

export default CheckoutPage;
