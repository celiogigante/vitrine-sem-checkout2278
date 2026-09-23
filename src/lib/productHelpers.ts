import { Product } from "@/lib/supabase";

export const WHATSAPP_NUMBER = "5511999999999";

export function conditionLabel(c: Product["condition"]): string {
  const map: Record<string, string> = {
    novo: "Novo",
    seminovo: "Seminovo",
    excelente: "Excelente",
    bom: "Bom",
    regular: "Regular",
  };
  return map[c] || c;
}

export function conditionColor(c: Product["condition"]): string {
  const map: Record<string, string> = {
    novo: "bg-accent text-accent-foreground",
    seminovo: "bg-blue-500 text-white",
    excelente: "bg-emerald-500 text-white",
    bom: "bg-yellow-500 text-white",
    regular: "bg-orange-500 text-white",
  };
  return map[c] || "";
}

export function getWhatsAppLink(product: Product): string {
  const message = encodeURIComponent(
    `Olá! Tenho interesse no *${product.name}* anunciado por *R$ ${product.price.toLocaleString("pt-BR")}*. Podemos negociar?`
  );
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`;
}
