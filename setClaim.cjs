const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// 👇 TU WKLEJ UID PRACOWNIKA
const uid = "bCBZPyMC4ZaujYyRKyK4dvWKK413";

admin.auth().setCustomUserClaims(uid, { role: "employee" })
  .then(() => {
    console.log("✅ Ustawiono claim: role=employee dla:", uid);
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Błąd ustawiania claimów:", err);
    process.exit(1);
  });
