import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
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
  status: "Oczekujące" | "Wysłane" | "Dostarczone" | "Anulowane";
  items: OrderItem[];
  deliveryAddress?: {
    street?: string;
    city?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
  };
}

const STATUS_OPTIONS: OrderData["status"][] = [
  "Oczekujące",
  "Wysłane",
  "Dostarczone",
  "Anulowane",
];

const EmployeeOrderDetails = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { userId, orderId } = useParams();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!user) return;

    if (user.role !== "employee" && user.role !== "admin") {
      navigate("/");
      return;
    }

    const load = async () => {
      try {
        if (!userId || !orderId) return;

        const ref = doc(db, "users", userId, "orders", orderId);
        const snap = await getDoc(ref);

        if (snap.exists()) {
          setOrder(snap.data() as OrderData);
        }
      } catch (e) {
        console.error("Błąd:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, userId, orderId, navigate]);

  const updateStatus = async (newStatus: OrderData["status"]) => {
    try {
      const ref = doc(db, "users", userId!, "orders", orderId!);
      await updateDoc(ref, { status: newStatus });
      setOrder((prev) => (prev ? { ...prev, status: newStatus } : prev));
      setMsg("Zaktualizowano status zamówienia");
    } catch (err) {
      console.error(err);
      setMsg("Błąd podczas zmiany statusu");
    }
  };

  const deleteOrder = async () => {
    if (!window.confirm("Czy na pewno chcesz usunąć zamówienie?")) return;

    try {
      await deleteDoc(doc(db, "users", userId!, "orders", orderId!));
      navigate("/employee/orders");
    } catch (err) {
      console.error(err);
      setMsg("Błąd usuwania zamówienia");
    }
  };

  if (loading) {
    return <p className="text-center mt-10 text-gray-700">Ładowanie...</p>;
  }

  if (!order) {
    return (
      <p className="text-center mt-10 text-gray-700">
        Nie znaleziono zamówienia
      </p>
    );
  }

  const date = order.createdAt?.seconds
    ? new Date(order.createdAt.seconds * 1000).toLocaleString("pl-PL")
    : "Brak danych";

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-4xl font-bold text-purple-700 mb-8">
        Szczegóły zamówienia
      </h1>

      <div className="bg-white shadow rounded-xl p-6 border border-gray-200">
        <h2 className="text-2xl font-semibold mb-2">
          Zamówienie #{orderId}
        </h2>

        <p className="text-gray-600 text-sm">
          Użytkownik: <span className="font-semibold">{userId}</span>
        </p>

        <p className="text-gray-600 text-sm">
          Złożone: <span className="font-semibold">{date}</span>
        </p>

        <p className="text-gray-800 mt-3">
          Status:{" "}
          <span className="font-bold text-purple-600">
            {order.status}
          </span>
        </p>

        <div className="mt-4">
          <label className="text-sm mr-2 text-gray-700">
            Zmień status:
          </label>
          <select
            value={order.status}
            onChange={(e) =>
              updateStatus(e.target.value as OrderData["status"])
            }
            className="border rounded px-3 py-2"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {order.deliveryAddress && (
          <div className="mt-6 bg-gray-100 rounded p-4">
            <h3 className="text-lg font-semibold mb-2">
              Adres dostawy
            </h3>
            <p>{order.deliveryAddress.street}</p>
            <p>
              {order.deliveryAddress.postalCode}{" "}
              {order.deliveryAddress.city}
            </p>
            <p>{order.deliveryAddress.country}</p>
            <p className="text-gray-700 mt-1">
              Tel: {order.deliveryAddress.phone}
            </p>
          </div>
        )}

        <h3 className="text-xl font-semibold mt-6 mb-2">
          Pozycje:
        </h3>

        <div className="flex flex-col gap-4">
          {order.items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between border-b pb-3 text-gray-800"
            >
              <div>
                <p className="font-semibold">{item.productName}</p>
                <p className="text-sm text-gray-600">
                  {item.quantity} × {item.unitPrice.toFixed(2)} zł
                </p>
              </div>
              <p className="text-purple-700 font-bold">
                {(item.quantity * item.unitPrice).toFixed(2)} zł
              </p>
            </div>
          ))}
        </div>

        <p className="text-2xl font-bold text-right text-purple-700 mt-6">
          Razem: {order.totalValue.toFixed(2)} zł
        </p>

        {msg && (
          <p className="mt-4 text-center text-purple-700 font-medium">
            {msg}
          </p>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => navigate("/employee/orders")}
            className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
          >
            ← Powrót
          </button>

          <button
            onClick={deleteOrder}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Usuń zamówienie
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeOrderDetails;
