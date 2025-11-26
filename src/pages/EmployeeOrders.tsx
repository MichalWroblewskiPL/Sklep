import { useEffect, useState } from "react";
import {
  collectionGroup,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  userId: string;
  createdAt: any;
  totalValue: number;
  status: string;
  items: OrderItem[];
}

const EmployeeOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // 🔥 POZWALAMY employee + admin
  const isEmployee =
    user && (user.role === "employee" || user.role === "admin");

  useEffect(() => {
    if (!isEmployee) return;

    const fetchOrders = async () => {
      try {
        // pobieramy WSZYSTKIE orders w całej bazie
        const snap = await getDocs(collectionGroup(db, "orders"));

        const list: Order[] = snap.docs.map((d) => {
          const data = d.data();
          const path = d.ref.path;
          const segments = path.split("/"); // users/{uid}/orders/{id}
          const userId = segments[1];

          return {
            id: d.id,
            userId,
            createdAt: data.createdAt,
            totalValue: data.totalValue,
            status: data.status,
            items: data.items || [],
          };
        });

        setOrders(list);
      } catch (err) {
        console.error("❌ Błąd pobierania zamówień:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [isEmployee]);

  if (!isEmployee) {
    return (
      <div className="text-center p-10 text-gray-600">
        Brak uprawnień do przeglądania zamówień.
      </div>
    );
  }

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600">Ładowanie zamówień...</p>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-10">
      <h1 className="text-3xl font-bold text-purple-700 text-center mb-10">
        Zamówienia klientów
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-600">Brak zamówień</p>
      ) : (
        <div className="flex flex-col gap-6">
          {orders.map((order) => (
            <div key={order.id} className="bg-white shadow-md rounded-xl p-6 border">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Zamówienie #{order.id}
                </h2>

                <p className="text-purple-700 font-bold text-lg">
                  {order.totalValue.toFixed(2)} zł
                </p>
              </div>

              <p className="text-sm text-gray-500 mt-1">
                Użytkownik: <b>{order.userId}</b>
              </p>

              <p className="mt-2">
                Status: <b>{order.status}</b>
              </p>

              <h3 className="font-semibold mt-4">Pozycje:</h3>
              <ul className="ml-4 list-disc text-gray-700">
                {order.items.map((item) => (
                  <li key={item.productId}>
                    {item.productName} × {item.quantity}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeeOrders;
