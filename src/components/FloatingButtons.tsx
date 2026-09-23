import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { getSettings } from "@/lib/products";

const FloatingButtons = () => {
  const [num, setNum] = useState(getSettings().whatsappNumber);

  useEffect(() => {
    const handleSettings = () => setNum(getSettings().whatsappNumber);
    window.addEventListener("settings-updated", handleSettings);
    return () => window.removeEventListener("settings-updated", handleSettings);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col gap-4">
      {/* WhatsApp Button - Image only for hover effect */}
      <a
        href={`https://wa.me/${num}`}
        target="_blank"
        rel="noopener noreferrer"
        className="transition-transform hover:scale-110 animate-float-bounce"
        aria-label="Contato via WhatsApp"
        title="WhatsApp"
      >
        <img
          src="https://cdn.builder.io/api/v1/image/assets%2F3a4b716306f84cbea69438c199a4f5ae%2Fa560d2af2ff543d3ae83ddf136da6ca2?format=webp&width=800&height=1200"
          alt="WhatsApp"
          className="h-14 w-14 rounded-full shadow-lg"
        />
      </a>

      {/* Google Maps Button */}
      <button
        onClick={() => window.open("https://maps.app.goo.gl/kP9HvFtU6faBvTPA9", "_blank")}
        className="flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 bg-red-500 hover:bg-red-600"
        aria-label="Localização no Google Maps"
        title="Localização"
      >
        <MapPin className="h-5 w-5 text-white" />
      </button>
    </div>
  );
};

export default FloatingButtons;
