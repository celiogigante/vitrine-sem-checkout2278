import { useState, useEffect } from "react";
import { getSettings } from "@/lib/products";
import { Instagram, MessageCircle, MapPin, Globe } from "lucide-react";

interface Settings {
  footerInstagram?: string;
  whatsappNumber?: string;
}

export default function Links() {
  const [settings, setSettings] = useState<Settings | null>(null);
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const loaded = await getSettings();
        setSettings(loaded);
      } catch (err) {
        console.error("Error loading settings:", err);
      }
    };
    loadSettings();
  }, []);

  const instagram = settings?.footerInstagram || "@mastercellbg";
  const whatsapp = settings?.whatsappNumber || "5566992473929";
  const website = "https://www.mastercellbg.com/";
  const location = "https://maps.app.goo.gl/kP9HvFtU6faBvTPA9";

  const links = [
    {
      id: "website",
      label: "Visite nosso site",
      description: "Veja todos os nossos produtos",
      icon: Globe,
      url: website,
      color: "from-blue-600 to-blue-700",
    },
    {
      id: "instagram",
      label: "Instagram",
      description: `Siga-nos: ${instagram}`,
      icon: Instagram,
      url: `https://instagram.com/${instagram.replace("@", "")}`,
      color: "from-pink-500 to-purple-600",
    },
    {
      id: "whatsapp",
      label: "WhatsApp",
      description: "Fale conosco direto no WhatsApp",
      icon: MessageCircle,
      url: `https://wa.me/${whatsapp}?text=Olá! Tive seu contato pelo link do Master Cell.`,
      color: "from-green-500 to-green-600",
    },
    {
      id: "location",
      label: "Localização",
      description: "Barra do Garças - MT",
      icon: MapPin,
      url: location,
      color: "from-orange-500 to-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-gray-900 text-white">
      {/* Header */}
      <div className="sticky top-0 z-50 backdrop-blur-lg border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-3">
            <img 
              src="https://cdn.builder.io/api/v1/image/assets%2F745a6a1096d546999a2f21f0471c7da5%2F79ed162aed044a158c0b43eac2527532?format=webp&width=800&height=1200" 
              alt="Master Cell Logo"
              className="h-10 w-auto"
            />
            <span className="text-lg font-bold">Master Cell</span>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="container mx-auto px-4 py-4 md:py-8 text-center">
        <p className="text-gray-300 text-sm md:text-base max-w-2xl mx-auto">
          Acesse nossos links e contatos
        </p>
      </div>

      {/* Links Grid */}
      <div className="container mx-auto px-2 md:px-4 pb-16">
        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6 max-w-2xl mx-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => window.open(link.url, "_blank")}
                className="group relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br hover:border-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-5 group-hover:opacity-10 transition-opacity duration-300`} />

                {/* Hover shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full duration-700" />

                {/* Content */}
                <div className="relative p-3 md:p-6 flex flex-col items-center text-center gap-2 md:gap-3">
                  <Icon className="w-8 h-8 md:w-12 md:h-12 group-hover:scale-110 transition-transform duration-300" />
                  <div className="min-h-12 md:min-h-auto">
                    <h3 className="text-sm md:text-lg font-bold mb-0.5 md:mb-1 leading-tight">{link.label}</h3>
                    <p className="text-gray-300 text-xs md:text-sm leading-tight">{link.description}</p>
                  </div>
                  <div className="text-yellow-300 text-xs md:text-sm font-semibold group-hover:text-yellow-200 transition-colors">
                    Abrir →
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-white/10 mt-12 py-8">
        <div className="container mx-auto px-4 text-center text-gray-400 text-sm">
          <p>© 2024 Master Cell. Todos os direitos reservados.</p>
        </div>
      </div>
    </div>
  );
}
