import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Plus, Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Product } from "@/lib/products";

interface AdminProductTableWithTooltipsProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (id: string) => void;
  onAddVariant?: (product: Product) => void;
}

export default function AdminProductTableWithTooltips({
  products,
  onEdit,
  onDelete,
  onAddVariant,
}: AdminProductTableWithTooltipsProps) {
  const [hoveredProductId, setHoveredProductId] = useState<string | null>(null);

  return (
    <TooltipProvider>
      <div className="rounded-xl border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-secondary sticky top-0">
              <tr>
                <th className="text-left p-3 font-medium">Produto</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Marca</th>
                <th className="text-right p-3 font-medium w-28">Preço</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Status</th>
                <th className="text-center p-3 font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr
                  key={product.id}
                  className="border-b last:border-0 hover:bg-secondary/50 transition-colors"
                  onMouseEnter={() => setHoveredProductId(product.id)}
                  onMouseLeave={() => setHoveredProductId(null)}
                >
                  <td className="p-3 font-medium">
                    <div className="flex items-center gap-2">
                      <span>{product.name}</span>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="h-4 w-4 text-blue-500 cursor-help" />
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-1 text-xs">
                            <p>
                              <strong>ID:</strong> {product.id.slice(0, 8)}...
                            </p>
                            <p>
                              <strong>Criado:</strong> {product.createdAt}
                            </p>
                            <p className="text-blue-200">
                              Clique em EDITAR para adicionar variações!
                            </p>
                          </div>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell text-muted-foreground">
                    {product.brand}
                  </td>
                  <td className="p-3 font-semibold text-right">
                    R$ {product.price.toLocaleString("pt-BR")}
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <Badge
                      variant={
                        product.status === "disponivel"
                          ? "default"
                          : product.status === "vendido"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {product.status === "disponivel"
                        ? "✓ Disponível"
                        : product.status === "vendido"
                          ? "✗ Vendido"
                          : "⏳ Reservado"}
                    </Badge>
                  </td>
                  <td className="p-3 text-center">
                    <div className="flex justify-center gap-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onEdit(product)}
                            className="relative"
                          >
                            <Pencil className="h-4 w-4" />
                            {hoveredProductId === product.id && (
                              <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-blue-600 text-white text-xs px-2 py-1 rounded pointer-events-none">
                                Clique aqui! ↓
                              </span>
                            )}
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent className="max-w-xs">
                          <div className="space-y-2 text-xs">
                            <p className="font-semibold">Para adicionar múltiplos:</p>
                            <div className="space-y-1">
                              <p>1. Clique no ícone de EDITAR (lápis)</p>
                              <p>2. Role até "Variações de Produtos"</p>
                              <p>3. Clique "+ Adicionar Variação"</p>
                              <p>4. Preencha cor, preço, etc. e salve</p>
                            </div>
                          </div>
                        </TooltipContent>
                      </Tooltip>

                      {onAddVariant && (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => onAddVariant(product)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            Adicionar variação rápido
                          </TooltipContent>
                        </Tooltip>
                      )}

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => onDelete(product.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          Deletar produto
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TooltipProvider>
  );
}
