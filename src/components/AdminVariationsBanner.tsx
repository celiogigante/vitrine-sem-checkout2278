import { Lightbulb, ArrowDown, Check } from "lucide-react";

interface AdminVariationsBannerProps {
  productName: string;
}

export default function AdminVariationsBanner({ productName }: AdminVariationsBannerProps) {
  return (
    <div className="rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-300 p-4 mb-4 space-y-3">
      <div className="flex items-start gap-3">
        <Lightbulb className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-green-900 text-sm">
            ✓ Adicione múltiplas unidades aqui!
          </h3>
          <p className="text-xs text-green-800 mt-1">
            O produto "<strong>{productName}</strong>" já está criado. Agora você pode adicionar quantas variações quiser (cores, storage, preços diferentes).
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 space-y-2">
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold shrink-0">
            1
          </div>
          <p className="text-green-900">
            <strong>Cor/Storage:</strong> Preto 256GB
          </p>
          <Check className="h-4 w-4 text-green-600 shrink-0" />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold shrink-0">
            2
          </div>
          <p className="text-green-900">
            <strong>Cor/Storage:</strong> Azul 128GB
          </p>
          <Check className="h-4 w-4 text-green-600 shrink-0" />
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-300 text-white text-xs font-bold shrink-0">
            3+
          </div>
          <p className="text-blue-700">
            <strong>Adicione mais!</strong> Clique "+ Adicionar Variação"
          </p>
          <ArrowDown className="h-4 w-4 text-blue-500 shrink-0 animate-bounce" />
        </div>
      </div>

      <div className="border-t border-green-200 pt-2">
        <p className="text-xs text-green-700">
          💡 Cada variação tem seu próprio: SKU, cor, storage, preço e estoque
        </p>
      </div>
    </div>
  );
}
