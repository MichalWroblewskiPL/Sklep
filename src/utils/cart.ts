import { db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface CartItem {
  id: string;
  name: string;
  price: number;
  mainImageUrl: string;
}

export const addToCart = async (uid: string, product: CartItem) => {
  const userRef = doc(db, "users", uid);
  const userSnap = await getDoc(userRef);

  if (!userSnap.exists()) throw new Error("USER_NOT_FOUND");

  const role = userSnap.data().role;

  if (role === "employee" || role === "admin") {
    throw new Error("EMPLOYEE_CANNOT_BUY");
  }

  const cartRef = doc(db, "users", uid, "cart", "cart");
  const cartSnap = await getDoc(cartRef);

  let items: any[] = [];

  if (cartSnap.exists()) {
    items = cartSnap.data().items || [];
  }

  const existing = items.find((i) => i.productId === product.id);

  if (existing) {
    if (existing.quantity >= 5) {
      throw new Error("MAX_LIMIT_5");
    }
    existing.quantity += 1;
  } else {
    items.push({
      productId: product.id,
      name: product.name,
      price: product.price,
      mainImageUrl: product.mainImageUrl,
      quantity: 1,
    });
  }

  await setDoc(cartRef, { items });
};
