import { useState } from "react";

const ContactPage = () => {
  const [copied, setCopied] = useState(false);
  const email = "mkmprojektwsb@gmail.com";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Nie udało się skopiować adresu:", err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center">
      <h1 className="text-4xl font-bold text-purple-700 mb-4">Kontakt</h1>
      <p className="text-lg text-gray-700 mb-6 max-w-xl">
        Jeśli masz pytania dotyczące aplikacji, skontaktuj się z nami
        bezpośrednio pod adresem e-mail:{" "}
        <span className="font-semibold text-purple-700">{email}</span>
      </p>

      <button
        onClick={handleCopy}
        className="bg-purple-700 text-white px-6 py-3 rounded-lg hover:bg-purple-800 transition"
      >
        📋 Skopiuj adres e-mail
      </button>

      {copied && (
        <p className="text-green-600 mt-3 font-medium">Skopiowano do schowka</p>
      )}
    </div>
  );
};

export default ContactPage;
