const { onDocumentUpdated, onDocumentDeleted } = require("firebase-functions/v2/firestore");
const admin = require("firebase-admin");

admin.initializeApp();

exports.setEmployeeClaims = onDocumentUpdated("users/{uid}", async (event) => {
  const newData = event.data.after.data();
  const previousData = event.data.before.data();
  const uid = event.params.uid;

  if (newData.role === "employee" && previousData.role !== "employee") {
    try {
      await admin.auth().setCustomUserClaims(uid, { role: "employee" });
      console.log(`Ustawiono claim 'employee' dla UID: ${uid}`);
    } catch (error) {
      console.error("Błąd ustawiania custom claims:", error);
    }
  }

  return null;
});

exports.onUserDeleted = onDocumentDeleted("users/{uid}", async (event) => {
  const uid = event.params.uid;

  try {
    await admin.auth().deleteUser(uid);
    console.log(`Usunięto użytkownika ${uid} z Firebase Auth`);
  } catch (error) {
    console.error("Błąd podczas usuwania użytkownika z Auth:", error);
  }

  return null;
});
