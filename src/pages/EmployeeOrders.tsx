import { useEffect, useMemo, useState } from "react";
import {
  collectionGroup,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

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

const ITEMS_PER_PAGE = 6;

const EmployeeOrders = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!user || user.role !== "employee") return;

    const fetchOrders = async () => {
      try {
        const snap = await getDocs(collectionGroup(db, "orders"));

        const list: Order[] = snap.docs.map((d) => {
          const data = d.data();
          const segments = d.ref.path.split("/");
          const userId = segments[1];

          return {
            id: d.id,
            userId,
            createdAt: data.createdAt,
            totalValue: data.totalValue ?? 0,
            status: data.status || "Nieznany",
            items: data.items || [],
          };
        });

        setOrders(list);
      } catch (err) {
        console.error("Błąd pobierania zamówień:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const handleDelete = async (order: Order) => {
    try {
      const ref = doc(db, `users/${order.userId}/orders/${order.id}`);
      await deleteDoc(ref);
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
    } catch (err) {
      console.error("Błąd usuwania zamówienia:", err);
    }
  };

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;

    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(q) ||
        o.userId.toLowerCase().includes(q)
    );
  }, [orders, search]);

  const totalPages = Math.ceil(
    filteredOrders.length / ITEMS_PER_PAGE
  );

  const paginatedOrders = filteredOrders.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  useEffect(() => {
    setPage(1);
  }, [search]);

  if (!user || user.role !== "employee") {
    return (
      <div className="text-center p-10 text-gray-600">
        Brak uprawnień do przeglądania zamówień.
      </div>
    );
  }

  if (loading) {
    return (
      <p className="text-center mt-10 text-gray-600">
        Ładowanie zamówień...
      </p>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-10">
      <h1 className="text-3xl font-bold text-purple-700 text-center mb-8">
        Zamówienia klientów
      </h1>

      <div className="mb-8 max-w-md mx-auto">
        <input
          type="text"
          placeholder="Szukaj po ID zamówienia lub ID użytkownika"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 border rounded"
        />
      </div>

      {filteredOrders.length === 0 ? (
        <p className="text-center text-gray-600">
          Brak zamówień spełniających kryteria.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-6">
            {paginatedOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white shadow-md rounded-xl p-6 border"
              >
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold">
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

                <h3 className="font-semibold mt-4">
                  Pozycje:
                </h3>
                <ul className="ml-4 list-disc text-gray-700">
                  {order.items.map((item) => (
                    <li key={item.productId}>
                      {item.productName} × {item.quantity}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex gap-3">
                  <button
                    onClick={() =>
                      navigate(
                        `/employee/orders/${order.userId}/${order.id}`
                      )
                    }
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Edytuj
                  </button>
                  <button
                    onClick={() => handleDelete(order)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
                  >
                    Usuń
                  </button>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-10">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 border rounded disabled:opacity-40"
              >
                Poprzednia
              </button>

              <span>
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
    </div>
  );
};

export default EmployeeOrders;
