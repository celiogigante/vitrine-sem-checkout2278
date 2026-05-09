import { Link } from "react-router-dom";
import {
  Product,
  conditionLabel,
  conditionColor,
  statusLabel,
  statusColor,
} from "@/lib/products";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Layers } from "lucide-react";
import { recordProductClick } from "@/hooks/useProductClick";

interface CardFormatProps {
  product: Product;
  variantCount: number;
}

export const CompactCardFormat = ({ product, variantCount }: CardFormatProps) => {
  const sold = product.status === "vendido";

  const handleViewDetailsClick = () => {
    recordProductClick(product.id, { type: "product_card" });
  };

  return (
    <div
      className={`group rounded-lg border border-gray-200 bg-white overflow-hidden transition-all hover:shadow-md flex flex-col h-full ${
        sold ? "opacity-60" : ""
      }`}
    >
      <Link
        to={`/produto/${product.id}`}
        className="block relative aspect-square md:aspect-[4/3] overflow-hidden bg-gray-50 flex-shrink-0"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {product.promotion && product.status === "disponivel" && (
          <div className="absolute top-2 left-2">
            <Badge className="bg-green-600 text-white font-bold text-xs px-2 py-1">
              Super Oferta
            </Badge>
          </div>
        )}

        {(product as any).is_on_request && (
          <Badge className="absolute bottom-2 left-2 bg-orange-500 text-white">
            Por Pedido
          </Badge>
        )}
      </Link>

      <div className="p-3 flex flex-col h-full">
        <div className="space-y-2 flex-1">
          <p className="text-xs text-gray-500">{product.brand}</p>
          <h3 className="font-semibold text-sm line-clamp-2">
            {product.name}
          </h3>

          <div className="space-y-1">
            {product.originalPrice && (
              <p className="text-xs text-gray-400 line-through">
                R$ {product.originalPrice.toLocaleString("pt-BR")}
              </p>
            )}
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-orange-500">
                R$ {product.price.toLocaleString("pt-BR")}
              </span>
              {product.promotion && (
                <span className="text-xs font-bold text-green-600">
                  -{Math.round((1 - product.price / product.originalPrice!) * 100)}%
                </span>
              )}
            </div>
          </div>

          {variantCount > 0 && (
            <p className="text-xs text-blue-600 flex items-center gap-1">
              <Layers className="h-3 w-3" /> {variantCount} variações
            </p>
          )}
        </div>

        <Button
          asChild
          size="sm"
          className="w-full h-9 mt-3 bg-orange-500 hover:bg-orange-600 text-white"
          onClick={handleViewDetailsClick}
        >
          <Link to={`/produto/${product.id}`}>Comprar</Link>
        </Button>
      </div>
    </div>
  );
};

export const ModernCardFormat = ({ product, variantCount }: CardFormatProps) => {
  const sold = product.status === "vendido";

  const handleViewDetailsClick = () => {
    recordProductClick(product.id, { type: "product_card" });
  };

  return (
    <div
      className={`group rounded-xl border bg-card overflow-hidden transition-shadow hover:shadow-lg flex flex-col h-full ${
        sold ? "opacity-60" : ""
      }`}
      style={{ boxShadow: "var(--card-shadow)" }}
    >
      <Link
        to={`/produto/${product.id}`}
        className="block relative aspect-[3/4] md:aspect-video overflow-hidden bg-secondary flex-shrink-0"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-300 group-hover:scale-105"
          loading="lazy"
        />

        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <Badge className={statusColor(product.status)}>
            {statusLabel(product.status)}
          </Badge>

          <Badge className={conditionColor(product.condition)}>
            {conditionLabel(product.condition)}
          </Badge>

          {product.promotion && product.status === "disponivel" && (
            <Badge className="bg-destructive text-destructive-foreground">
              Oferta
            </Badge>
          )}

          {(product as any).is_on_request && (
            <Badge className="bg-orange-500 text-white">
              Por Pedido
            </Badge>
          )}

          {variantCount > 0 && (
            <Badge className="bg-blue-500 text-white flex items-center gap-1">
              <Layers className="h-3 w-3" /> {variantCount} variações
            </Badge>
          )}
        </div>

        <div className="absolute bottom-3 right-3 flex items-center gap-1 rounded-full bg-card/80 backdrop-blur-sm px-2 py-1 text-xs text-muted-foreground">
          <Eye className="h-3 w-3" /> {product.views}
        </div>
      </Link>

      <div className="p-3 md:p-4 flex flex-col h-full">
        <div className="space-y-2 flex-1">
          <div>
            <p className="text-xs text-muted-foreground">{product.brand}</p>
            <h3 className="font-semibold text-sm leading-tight line-clamp-2">
              {product.name}
            </h3>
          </div>

          <div className="flex items-baseline gap-2">
            {product.originalPrice && (
              <>
                <span className="text-xs text-muted-foreground line-through">
                  R$ {product.originalPrice.toLocaleString("pt-BR")}
                </span>
                {product.promotion && (
                  <span className="text-xs font-bold text-destructive">
                    -{Math.round((1 - product.price / product.originalPrice) * 100)}%
                  </span>
                )}
              </>
            )}
            <span className={`text-lg font-bold ${product.promotion ? 'text-green-500' : ''}`}>
              R$ {product.price.toLocaleString("pt-BR")}
            </span>
          </div>
        </div>

        <div className="flex flex-row gap-2 mt-4">
          <Button asChild size="sm" variant="outline" className="flex-1 h-9" onClick={handleViewDetailsClick}>
            <Link to={`/produto/${product.id}`}>Ver detalhes</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export const PremiumCardFormat = ({ product, variantCount }: CardFormatProps) => {
  const sold = product.status === "vendido";
  const hasDiscount = product.originalPrice && product.promotion;
  const discountPercent = hasDiscount ? Math.round((1 - product.price / product.originalPrice!) * 100) : 0;

  const handleViewDetailsClick = () => {
    recordProductClick(product.id, { type: "product_card" });
  };

  return (
    <div
      className={`group rounded-2xl border-0 bg-white overflow-hidden transition-all duration-300 hover:shadow-2xl flex flex-col h-full ${
        sold ? "opacity-60" : ""
      }`}
      style={{ boxShadow: "0 1px 3px rgba(0,0,0,0.08)" }}
    >
      <Link
        to={`/produto/${product.id}`}
        className="block relative aspect-[3/4] md:aspect-video overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 flex-shrink-0 group-relative"
      >
        <img
          src={product.images[0]}
          alt={product.name}
          className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />

        <div className="absolute top-4 left-4 flex flex-col gap-2">
          {product.promotion && product.status === "disponivel" && (
            <div className="flex items-center gap-2">
              <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white font-bold text-xs rounded-full px-3 py-1">
                {discountPercent}% OFF
              </Badge>
            </div>
          )}

          <Badge className={`${statusColor(product.status)} rounded-full text-xs`}>
            {statusLabel(product.status)}
          </Badge>

          <Badge className={`${conditionColor(product.condition)} rounded-full text-xs`}>
            {conditionLabel(product.condition)}
          </Badge>
        </div>

        {variantCount > 0 && (
          <div className="absolute top-4 right-4 bg-blue-600 text-white rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1">
            <Layers className="h-3 w-3" /> {variantCount}
          </div>
        )}

        <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-sm px-3 py-1.5 text-xs font-medium text-gray-600 shadow-md">
          <Eye className="h-3 w-3" /> {product.views}
        </div>
      </Link>

      <div className="p-4 md:p-6 flex flex-col h-full">
        <div className="space-y-3 flex-1">
          <div>
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
              {product.brand}
            </p>
            <h3 className="font-bold text-base leading-tight line-clamp-2 text-gray-900 mt-1">
              {product.name}
            </h3>
          </div>

          <div className="space-y-2">
            {hasDiscount && (
              <p className="text-sm text-gray-400 line-through">
                R$ {product.originalPrice.toLocaleString("pt-BR")}
              </p>
            )}
            <p className="text-2xl font-bold text-green-600">
              R$ {product.price.toLocaleString("pt-BR")}
            </p>
            {product.isOnRequest && (
              <p className="text-xs font-semibold text-orange-600">Por Pedido</p>
            )}
          </div>
        </div>

        <Button
          asChild
          size="lg"
          className="w-full mt-4 h-11 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-lg transition-all duration-300"
          onClick={handleViewDetailsClick}
        >
          <Link to={`/produto/${product.id}`}>Ver Detalhes</Link>
        </Button>
      </div>
    </div>
  );
};
