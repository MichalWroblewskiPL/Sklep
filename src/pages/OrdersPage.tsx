import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
import { Link } from "react-router-dom";

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

const OrdersPage = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!user) return;

      const q = query(
        collection(db, "users", user.uid, "orders"),
        orderBy("createdAt", "desc")
      );

      const snapshot = await getDocs(q);
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setOrders(data);
    };

    fetchOrders();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-purple-700">
        Twoje zamówienia
      </h1>

      {orders.length === 0 ? (
        <p>Brak zamówień.</p>
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border rounded-lg p-4 shadow-sm"
            >
              <p>
                <strong>ID:</strong> {order.id}
              </p>
              <p>
                <strong>Status:</strong> {order.status}
              </p>
              <p>
                <strong>Płatność:</strong>{" "}
                {paymentLabel(order.paymentMethod)}
              </p>
              <p>
                <strong>Dostawa:</strong>{" "}
                {shippingLabel(order.shippingMethod)}
              </p>

              <Link
                to={`/orders/${order.id}`}
                className="inline-block mt-3 text-purple-600 hover:underline font-medium"
              >
                Szczegóły zamówienia →
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default OrdersPage;
