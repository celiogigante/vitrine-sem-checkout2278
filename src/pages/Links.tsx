import { useState, useEffect } from "react";
import { getSettings } from "@/lib/products";
import { Button } from "@/components/ui/button";
import { Instagram, MessageCircle, MapPin, Globe, Copy, Check } from "lucide-react";

interface Settings {
  footerInstagram?: string;
  whatsappNumber?: string;
}

export default function Links() {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

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

  const handleCopy = (link: string) => {
    navigator.clipboard.writeText(link);
    setCopiedLink(link);
    setTimeout(() => setCopiedLink(null), 2000);
  };

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
      <div className="container mx-auto px-4 py-12 md:py-20 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
          Master Cell
        </h1>
        <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
          Seus links para entrar em contato conosco e conhecer nossos produtos
        </p>
      </div>

      {/* Links Grid */}
      <div className="container mx-auto px-4 py-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.id}
                onClick={() => window.open(link.url, "_blank")}
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br hover:border-white/20 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${link.color} opacity-10 group-hover:opacity-20 transition-opacity duration-300`} />
                
                {/* Hover shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-transparent via-white to-transparent -translate-x-full group-hover:translate-x-full duration-700" />

                {/* Content */}
                <div className="relative p-6 md:p-8 flex flex-col items-center text-center gap-3">
                  <Icon className="w-12 h-12 md:w-16 md:h-16 group-hover:scale-110 transition-transform duration-300" />
                  <div>
                    <h3 className="text-xl md:text-2xl font-bold mb-1">{link.label}</h3>
                    <p className="text-gray-300 text-sm md:text-base">{link.description}</p>
                  </div>
                  <div className="mt-4 text-yellow-400 text-sm font-semibold group-hover:text-yellow-300 transition-colors">
                    Abrir →
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Copy Links Section */}
      <div className="container mx-auto px-4 py-12 border-t border-white/10">
        <h2 className="text-2xl font-bold mb-8 text-center">Copiar Links</h2>
        <div className="space-y-3 max-w-2xl mx-auto">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between bg-gray-800/50 hover:bg-gray-800 border border-white/10 rounded-lg p-4 transition-colors"
            >
              <div className="text-sm text-gray-300 truncate flex-1">{link.label}</div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleCopy(link.url)}
                className="ml-2 text-yellow-400 hover:text-yellow-300 hover:bg-yellow-400/10"
              >
                {copiedLink === link.url ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          ))}
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
