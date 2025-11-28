import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface OrderData {
  createdAt: any;
  totalValue: number;
  status: string;
  items: OrderItem[];
}

const OrderDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !id) return;

    const loadOrder = async () => {
      try {
        const ref = doc(db, "users", user.uid, "orders", id);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setOrder(snap.data() as OrderData);
        } else {
          setOrder(null);
        }
      } catch (e) {
        console.error("Błąd pobierania zamówienia:", e);
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [user, id]);

  if (!user) {
    return (
      <div className="p-10 text-center text-gray-600">
        Musisz być zalogowany, aby zobaczyć zamówienie.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-600">Ładowanie zamówienia...</div>
    );
  }

  if (!order) {
    return (
      <div className="p-10 text-center text-gray-600">
        Nie znaleziono zamówienia.
      </div>
    );
  }

  const createdDate = order.createdAt?.toDate
    ? order.createdAt.toDate().toLocaleString()
    : "Brak danych";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <Link to="/orders" className="text-purple-600 hover:underline">
        ← Powrót do zamówień
      </Link>

      <h1 className="text-3xl font-bold mt-6 mb-4 text-purple-700">
        Zamówienie #{id}
      </h1>

      <div className="bg-white shadow rounded-xl p-6 mb-8">
        <p className="text-gray-700 mb-2">
          <strong>Data zamówienia:</strong> {createdDate}
        </p>

        <p className="text-gray-700 mb-2">
          <strong>Status:</strong>{" "}
          <span className="text-purple-700">{order.status}</span>
        </p>

        <p className="text-gray-700 text-lg font-semibold mt-4">
          Suma:{" "}
          <span className="text-purple-700">
            {order.totalValue.toFixed(2)} zł
          </span>
        </p>
      </div>

      <h2 className="text-2xl font-bold mb-4 text-gray-900">Pozycje:</h2>

      <div className="bg-white shadow rounded-xl p-6">
        {order.items.map((item, index) => (
          <div
            key={index}
            className="flex items-center justify-between border-b py-4"
          >
            <div>
              <p className="text-lg font-semibold text-gray-900">
                {item.productName}
              </p>
              <p className="text-sm text-gray-600">
                {item.quantity} × {item.unitPrice.toFixed(2)} zł
              </p>
            </div>

            <p className="text-lg font-bold text-purple-700">
              {(item.quantity * item.unitPrice).toFixed(2)} zł
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-100 rounded-xl p-6 text-xl font-semibold text-gray-900 mt-8">
        Razem:{" "}
        <span className="text-purple-700">
          {order.totalValue.toFixed(2)} zł
        </span>
      </div>
    </div>
  );
};

export default OrderDetails;
