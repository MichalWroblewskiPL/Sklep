// src/hooks/useCartCount.ts
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
import { useAuth } from "../context/AuthContext";

export const useCartCount = () => {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user || user.role !== "user") {
      setCount(0);
      return;
    }

    const ref = doc(db, "users", user.uid, "cart", "cart");

    const unsub = onSnapshot(ref, (snap) => {
      if (!snap.exists()) {
        setCount(0);
        return;
      }

      const items = snap.data().items || [];

      const total = items.reduce((sum: number, item: any) => {
        return sum + (item.quantity || 0);
      }, 0);

      setCount(total);
    });

    return () => unsub();
  }, [user]);

  return count;
};
