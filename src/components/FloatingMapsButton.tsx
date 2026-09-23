import { MapPin } from "lucide-react";

const FloatingMapsButton = () => {
  return (
    <button
      onClick={() => window.open("https://maps.app.goo.gl/kP9HvFtU6faBvTPA9", "_blank")}
      className="fixed bottom-6 right-6 z-40 flex h-11 w-11 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-110 bg-red-500 hover:bg-red-600"
      aria-label="Localização no Google Maps"
      title="Localização"
    >
      <MapPin className="h-5 w-5 text-white" />
    </button>
  );
};

export default FloatingMapsButton;
