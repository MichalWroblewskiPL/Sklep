import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-white border-t border-gray-200 text-gray-700 py-6 mt-10">
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Pc Base */}
        <div className="text-2xl font-extrabold flex items-center gap-1">
          <span className="text-purple-700">Pc</span>
          <span className="text-green-500">Base</span>
        </div>

        {/* Linki */}
        <div className="flex gap-6 text-sm">
          <Link to="/" className="hover:text-purple-700 transition">
            Strona główna
          </Link>
          <Link to="/shop" className="hover:text-purple-700 transition">
            Produkty
          </Link>
          <Link to="/login" className="hover:text-purple-700 transition">
            Logowanie
          </Link>
          <Link to="/contact" className="hover:text-purple-700 transition">
            Kontakt
          </Link>
        </div>

        {/* Copyright */}
        <p className="text-sm text-gray-500">
          © {new Date().getFullYear()} PcBase. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
