const Contact = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
      <h1 className="text-3xl font-bold mb-4 text-purple-700">Skontaktuj się z nami</h1>
      <p className="text-gray-700 max-w-lg">
        Masz pytania dotyczące produktów lub zamówień?  
        Napisz do nas na adres:{" "}
        <a
          href="mailto:support@pcbase.pl"
          className="text-green-600 font-semibold hover:underline"
        >
          support@pcbase.pl
        </a>
      </p>
    </div>
  );
};

export default Contact;
