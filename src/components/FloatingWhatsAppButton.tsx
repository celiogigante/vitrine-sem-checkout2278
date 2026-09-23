import { useState, useEffect } from "react";
import { getSettings } from "@/lib/products";

const FloatingWhatsAppButton = () => {
  const [num, setNum] = useState(getSettings().whatsappNumber);

  useEffect(() => {
    const handleSettings = () => setNum(getSettings().whatsappNumber);
    window.addEventListener("settings-updated", handleSettings);
    return () => window.removeEventListener("settings-updated", handleSettings);
  }, []);

  return (
    <a
      href={`https://wa.me/${num}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-20 right-6 z-40 inline-block transition-transform hover:scale-110 animate-float-bounce"
      aria-label="Contato via WhatsApp"
      title="WhatsApp"
    >
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F3a4b716306f84cbea69438c199a4f5ae%2Fa560d2af2ff543d3ae83ddf136da6ca2?format=webp&width=800&height=1200"
        alt="WhatsApp"
        className="h-14 w-14 rounded-full shadow-lg transition-all duration-300 hover:scale-[1.2] hover:shadow-xl hover:brightness-110"
      />
    </a>
  );
};

export default FloatingWhatsAppButton;
