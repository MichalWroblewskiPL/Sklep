import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { db } from "../firebase";
import { collection, getDocs, QueryDocumentSnapshot } from "firebase/firestore";
import { Link } from "react-router-dom";

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

interface Order {
  id: string;
  items: OrderItem[];
  totalValue: number;
  status?: string;
  createdAt?: any;
}


const safeCreatedAtToDate = (createdAt: any): Date | null => {
  if (!createdAt) return null;

  if (typeof createdAt.toDate === "function") {
    try {
      return createdAt.toDate();
    } catch {
      return null;
    }
  }

  if (createdAt.seconds && typeof createdAt.seconds === "number") {
    return new Date(createdAt.seconds * 1000);
  }

  if (createdAt instanceof Date) return createdAt;
  return null;
};

const formatDate = (d: Date | null) => {
  if (!d) return "—";
  return d.toLocaleString();
};

const OrdersPage = () => {
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);

      try {
        if (!user) {
          setOrders([]);
          setLoading(false);
          return;
        }

        const ref = collection(db, "users", user.uid, "orders");
        const snap = await getDocs(ref);

        const list = snap.docs.map((d: QueryDocumentSnapshot) => {
          const raw = d.data() as any;
          return {
            id: d.id,
            items: raw.items || [],
            totalValue: typeof raw.totalValue === "number" ? raw.totalValue : 0,
            status: raw.status || "Oczekujące",
            createdAt: raw.createdAt ?? null,
          } as Order;
        });

        list.sort((a, b) => {
          const da = safeCreatedAtToDate(a.createdAt);
          const dbt = safeCreatedAtToDate(b.createdAt);

          if (!da && !dbt) return 0;
          if (!da) return 1;
          if (!dbt) return -1;
          return dbt.getTime() - da.getTime();
        });

        setOrders(list);
      } catch (err: any) {
        console.error("Błąd pobierania zamówień:", err);
        setError("Wystąpił błąd podczas pobierania zamówień.");
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, [user]);

  if (!user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600">Musisz się zalogować, aby zobaczyć zamówienia.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <p className="text-gray-600">Ładowanie zamówień...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="px-4 py-2 bg-purple-700 text-white rounded">
          Spróbuj ponownie
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mb-4">Brak zamówień</h2>
        <p className="text-gray-600">Nie złożyłeś jeszcze żadnego zamówienia.</p>
        <Link to="/shop" className="mt-4 px-5 py-2 bg-purple-700 text-white rounded">
          Przejdź do sklepu
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-purple-700 mb-6">Twoje zamówienia</h1>

      <div className="flex flex-col gap-6">
        {orders.map((o) => {
          const date = safeCreatedAtToDate(o.createdAt);
          return (
            <div key={o.id} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold">Zamówienie #{o.id}</h3>
                  <p className="text-sm text-gray-500">Złożone: {formatDate(date)}</p>
                  <p className="text-sm mt-2">Status: <strong>{o.status}</strong></p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold text-purple-700">{Number(o.totalValue || 0).toFixed(2)} zł</p>
                  <Link to={`/order/${o.id}`} className="text-sm mt-2 inline-block text-purple-700 hover:underline">
                    Szczegóły zamówienia
                  </Link>
                </div>
              </div>

              <div className="mt-4 border-t pt-4">
                <h4 className="text-sm text-gray-700 mb-2">Pozycje:</h4>
                <ul className="space-y-2">
                  {o.items && o.items.length > 0 ? (
                    o.items.map((it, idx) => (
                      <li key={idx} className="flex justify-between text-sm">
                        <span>{it.productName} × {it.quantity}</span>
                        <span>{(it.unitPrice * it.quantity).toFixed(2)} zł</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">Brak pozycji w zamówieniu</li>
                  )}
                </ul>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersPage;
