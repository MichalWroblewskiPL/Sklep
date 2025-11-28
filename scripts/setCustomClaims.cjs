// scripts/setCustomClaims.cjs
// Użycie: node setCustomClaims.cjs <UID> <role>
// role: user | employee | admin

const fs = require("fs");
const path = require("path");
const admin = require("firebase-admin");

const args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Użycie: node setCustomClaims.cjs <UID> <role>");
  process.exit(1);
}
const [uid, role] = args;
if (!["user", "employee", "admin"].includes(role)) {
  console.error("Rola musi być jedną z: user, employee, admin");
  process.exit(1);
}

const tryPaths = [
  path.join(__dirname, "serviceAccountKey.json"),
  path.join(__dirname, "..", "serviceAccountKey.json"),
  path.join(process.cwd(), "serviceAccountKey.json"),
];

let keyPath = null;
for (const p of tryPaths) {
  if (fs.existsSync(p)) {
    keyPath = p;
    break;
  }
}
if (!keyPath) {
  console.error("Nie znaleziono serviceAccountKey.json. Włóż plik z kluczem serwisowym w folder scripts/ lub w katalogu głównym projektu.");
  process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8"));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

(async () => {
  try {
    console.log(`Ustawiam role='${role}' dla UID=${uid} (klucz: ${keyPath})`);
    await admin.auth().setCustomUserClaims(uid, { role });
    console.log("Użytkownik powinien się wylogować i zalogować, aby token się zaktualizował.");
    process.exit(0);
  } catch (err) {
    console.error("Błąd:", err);
    process.exit(1);
  }
})();