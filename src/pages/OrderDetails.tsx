import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

const paymentLabel = (method: string) => {
  if (method === "gotowka") return "Gotówka";
  if (method === "karta") return "Karta";
  return "–";
};

const shippingLabel = (method: string) => {
  if (method === "kurier") return "Kurier";
  if (method === "odbior") return "Odbiór osobisty";
  return "–";
};

const OrderDetails = () => {
  const { orderId } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!user || !orderId) return;

      try {
        const ref = doc(db, "users", user.uid, "orders", orderId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setOrder(snap.data());
        }
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [user, orderId]);

  if (loading) {
    return <p className="text-center mt-10">Ładowanie…</p>;
  }

  if (!order) {
    return (
      <p className="text-center mt-10 text-red-600">
        Nie znaleziono zamówienia.
      </p>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Szczegóły zamówienia
      </h1>

      <div className="mb-6 space-y-1">
        <p>
          <strong>ID zamówienia:</strong> {orderId}
        </p>
        <p>
          <strong>Status:</strong> {order.status}
        </p>
        <p>
          <strong>Dostawa:</strong>{" "}
          {shippingLabel(order.shippingMethod)}
        </p>
        <p>
          <strong>Płatność:</strong>{" "}
          {paymentLabel(order.paymentMethod)}
        </p>

        {order.shippingMethod === "kurier" &&
          order.deliveryAddress && (
            <div className="mt-3">
              <p className="font-semibold">Adres dostawy:</p>
              <p>{order.deliveryAddress.street}</p>
              <p>
                {order.deliveryAddress.postalCode}{" "}
                {order.deliveryAddress.city}
              </p>
              <p>{order.deliveryAddress.country}</p>
              <p>Telefon: {order.deliveryAddress.phone}</p>
            </div>
          )}
      </div>

      <h2 className="text-xl font-semibold mb-3">
        Produkty
      </h2>

      <ul className="space-y-3">
        {order.items.map((item: any, idx: number) => (
          <li
            key={idx}
            className="border rounded p-3 flex gap-4"
          >
            <img
              src={item.mainImageUrl}
              alt={item.name}
              className="w-20 h-20 object-cover rounded"
            />
            <div>
              <p className="font-semibold">{item.name}</p>
              <p>Ilość: {item.quantity}</p>
              <p>Cena: {item.price} zł</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="mt-4 text-lg font-bold">
        Łączna kwota: {order.totalValue} zł
      </p>

      <Link
        to="/orders"
        className="inline-block mt-6 text-purple-600 hover:underline"
      >
        ← Powrót do zamówień
      </Link>
    </div>
  );
};

export default OrderDetails;
