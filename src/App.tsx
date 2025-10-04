import React, { useEffect } from "react";
import { db } from "./firebase";
import { collection, getDocs } from "firebase/firestore";

function App() {
  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "testCollection"));
        querySnapshot.forEach((doc) => {
          console.log(`${doc.id} =>`, doc.data());
        });
      } catch (error) {
        console.error("Błąd Firestore:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <h1>Hello Firebase + React + TS!</h1>
    </div>
  );
}

export default App;
