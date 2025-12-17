import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

type CartItem = {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  mainImageUrl: string;
};

const ValidationRules = {
  street: {
    validate: (v: string) => v.length >= 3 && v.length <= 100,
    message: "Ulica: 3–100 znaków",
  },
  city: {
    pattern: /^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ\s-]{2,50}$/,
    message: "Miasto: 2–50 znaków, tylko litery",
  },
  postalCode: {
    pattern: /^\d{2}-\d{3}$/,
    message: "Kod pocztowy: format XX-XXX",
  },
  country: {
    validate: (v: string) => v.length >= 2 && v.length <= 50,
    message: "Kraj: 2–50 znaków",
  },
  phone: {
    pattern: /^(\+48)?[0-9]{9}$/,
    message: "Telefon: 9 cyfr lub +48 i 9 cyfr",
  },
};

const CheckoutPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [shippingMethod, setShippingMethod] =
    useState<"odbior" | "kurier">("odbior");

  const [paymentMethod, setPaymentMethod] =
    useState<"gotowka" | "karta" | "">("");

  const [useProfileAddress, setUseProfileAddress] = useState(true);

  const [address, setAddress] = useState({
    street: "",
    city: "",
    postalCode: "",
    country: "",
    phone: "",
  });

  const [error, setError] = useState("");

  useEffect(() => {
    const loadCart = async () => {
      if (!user) return;

      const cartRef = doc(db, "users", user.uid, "cart", "cart");
      const snap = await getDoc(cartRef);
      if (snap.exists()) {
        setCartItems(snap.data().items || []);
      }
      setLoading(false);
    };

    loadCart();
  }, [user]);

  useEffect(() => {
    const loadProfileAddress = async () => {
      if (!user || !useProfileAddress || shippingMethod !== "kurier") return;

      const ref = doc(db, "users", user.uid);
      const snap = await getDoc(ref);
      const a = snap.data()?.address || {};

      setAddress({
        street: a.street || "",
        city: a.city || "",
        postalCode: a.postalCode || "",
        country: a.country || "",
        phone: a.phone || "",
      });
    };

    loadProfileAddress();
  }, [user, useProfileAddress, shippingMethod]);

  const totalValue = cartItems.reduce(
    (s, i) => s + i.price * i.quantity,
    0
  );

  const validateAddress = () => {
    const e: string[] = [];
    if (!ValidationRules.street.validate(address.street))
      e.push(ValidationRules.street.message);
    if (!ValidationRules.city.pattern.test(address.city))
      e.push(ValidationRules.city.message);
    if (!ValidationRules.postalCode.pattern.test(address.postalCode))
      e.push(ValidationRules.postalCode.message);
    if (!ValidationRules.country.validate(address.country))
      e.push(ValidationRules.country.message);
    if (!ValidationRules.phone.pattern.test(address.phone))
      e.push(ValidationRules.phone.message);
    return e;
  };

  const handleOrder = async () => {
    setError("");

    if (!user || cartItems.length === 0) return;

    if (!paymentMethod) {
      setError("Wybierz metodę płatności.");
      return;
    }

    if (shippingMethod === "kurier") {
      const errors = validateAddress();
      if (errors.length) {
        setError(errors.join(", "));
        return;
      }
    }

    try {
      await runTransaction(db, async (tx) => {
      const productSnapshots = [];

     for (const item of cartItems) {
        const ref = doc(db, "products", item.productId);
        const snap = await tx.get(ref);

        const stock = snap.data()?.stockQuantity || 0;
        if (item.quantity > stock) {
         throw new Error(`Brak w magazynie: ${item.name}`);
       }

        productSnapshots.push({
          ref,
         newStock: stock - item.quantity,
        });
     }

     for (const p of productSnapshots) {
       tx.update(p.ref, {
          stockQuantity: p.newStock,
    });
    }

  const orderRef = doc(collection(db, "users", user.uid, "orders"));

  tx.set(orderRef, {
    userId: user.uid,
    items: cartItems,
    totalValue,
    status: "Oczekujące",
    shippingMethod,
    paymentMethod,
    deliveryAddress: shippingMethod === "kurier" ? address : null,
    createdAt: serverTimestamp(),
  });

  tx.update(doc(db, "users", user.uid, "cart", "cart"), {
    items: [],
  });
});

      navigate("/orders");
    } catch (err: any) {
      setError(err.message || "Błąd składania zamówienia.");
    }
  };

  if (loading) {
    return <p className="text-center mt-20">Ładowanie koszyka…</p>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Podsumowanie zamówienia
      </h1>

      <div className="bg-white shadow rounded-xl p-6 mb-6">
        {cartItems.map((item) => (
          <div key={item.productId} className="flex gap-4 mb-4">
            <img
              src={item.mainImageUrl}
              alt={item.name}
              className="w-20 h-20 rounded object-cover"
            />
            <div className="flex-1">
              <p className="font-semibold">{item.name}</p>
              <p className="text-sm text-gray-600">
                {item.quantity} × {item.price} zł
              </p>
            </div>
            <p className="font-semibold">
              {item.quantity * item.price} zł
            </p>
          </div>
        ))}
        <div className="text-right font-bold">
          Razem: {totalValue} zł
        </div>
      </div>

      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">Dostawa</h2>

        <label className="block">
          <input
            type="radio"
            checked={shippingMethod === "odbior"}
            onChange={() => setShippingMethod("odbior")}
          />{" "}
          Odbiór osobisty
        </label>

        <label className="block mt-2">
          <input
            type="radio"
            checked={shippingMethod === "kurier"}
            onChange={() => setShippingMethod("kurier")}
          />{" "}
          Kurier
        </label>

        {shippingMethod === "kurier" && (
          <div className="mt-4">
            <label className="block mb-2">
              <input
                type="checkbox"
                checked={useProfileAddress}
                onChange={(e) =>
                  setUseProfileAddress(e.target.checked)
                }
              />{" "}
              Użyj danych z profilu
            </label>

            {(
              [
                ["street", "Ulica"],
                ["postalCode", "Kod pocztowy"],
                ["city", "Miasto"],
                ["country", "Kraj"],
                ["phone", "Telefon"],
              ] as const
            ).map(([key, label]) => (
              <div key={key} className="mb-3">
                <label className="block text-sm mb-1">{label}</label>
                <input
                  className="w-full px-4 py-2 border rounded"
                  value={address[key]}
                  onChange={(e) =>
                    setAddress((p) => ({
                      ...p,
                      [key]: e.target.value,
                    }))
                  }
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-xl p-6 mb-6">
        <h2 className="font-semibold mb-4">
          Płatność <span className="text-sm text-gray-500">(TYLKO przy odbiorze)</span>
        </h2>

        <label className="block">
          <input
            type="radio"
            checked={paymentMethod === "gotowka"}
            onChange={() => setPaymentMethod("gotowka")}
          />{" "}
          Gotówka
        </label>

        <label className="block mt-2">
          <input
            type="radio"
            checked={paymentMethod === "karta"}
            onChange={() => setPaymentMethod("karta")}
          />{" "}
          Karta
        </label>
      </div>

      {error && (
        <p className="text-sm text-red-600 mb-4">{error}</p>
      )}

      <button
        onClick={handleOrder}
        className="w-full bg-purple-700 text-white py-3 rounded font-semibold hover:bg-purple-800"
      >
        Złóż zamówienie
      </button>
    </div>
  );
};

export default CheckoutPage;
