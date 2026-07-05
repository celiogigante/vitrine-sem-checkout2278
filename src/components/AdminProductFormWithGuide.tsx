import { useState } from "react";
import { AlertCircle, CheckCircle2, Plus, ArrowRight, Lightbulb } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

interface AdminProductFormWithGuideProps {
  children: React.ReactNode; // O formulário original
  productName?: string;
  isEditing?: boolean;
}

export default function AdminProductFormWithGuide({ 
  children, 
  productName, 
  isEditing = false 
}: AdminProductFormWithGuideProps) {
  const [collapsed, setCollapsed] = useState(isEditing); // Auto-colapsa se editando

  return (
    <div className="mb-8 space-y-4">
      {/* ALERTA PRINCIPAL COM INSTRUÇÕES */}
      {!isEditing && !collapsed && (
        <Alert className="border-2 border-blue-300 bg-blue-50">
          <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
          <AlertDescription className="ml-0">
            <div className="space-y-4">
              <div>
                <div className="font-bold text-blue-900 mb-2">
                  📱 Quer adicionar MÚLTIPLOS celulares iguais?
                </div>
                <p className="text-sm text-blue-800 mb-3">
                  Se você quer adicionar 2, 3 ou mais celulares do <strong>mesmo modelo</strong> (ex: 3 Moto E7 Plus com cores diferentes), não preencha este formulário.
                </p>
              </div>

              <div className="space-y-2 bg-white rounded-lg p-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-blue-900 text-sm">Encontre o produto na lista</div>
                    <div className="text-xs text-blue-700">Procure "Moto E7 Plus 64GB" na tabela de produtos</div>
                  </div>
                </div>

                <div className="flex items-center justify-center py-1">
                  <div className="h-6 w-0.5 bg-blue-300"></div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-green-900 text-sm">Clique para abrir/editar</div>
                    <div className="text-xs text-green-700">Na coluna "Ações", clique no ícone de editar (lápis)</div>
                  </div>
                </div>

                <div className="flex items-center justify-center py-1">
                  <div className="h-6 w-0.5 bg-green-300"></div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white text-xs font-bold mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-purple-900 text-sm">Rolar até "Variações de Produtos"</div>
                    <div className="text-xs text-purple-700">Clique "+ Adicionar Variação" para cada celular diferente</div>
                  </div>
                </div>

                <div className="flex items-center justify-center py-1">
                  <div className="h-6 w-0.5 bg-purple-300"></div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-600 text-white text-xs font-bold mt-0.5">
                    ✓
                  </div>
                  <div>
                    <div className="font-semibold text-orange-900 text-sm">Pronto! Múltiplos celulares cadastrados</div>
                    <div className="text-xs text-orange-700">Cada um com cor, preço ou estado diferentes</div>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-blue-200 rounded-lg p-3">
                <div className="font-semibold text-blue-900 text-sm mb-2">💡 Exemplo:</div>
                <div className="text-xs text-blue-700 space-y-1">
                  <div><strong>Produto Base:</strong> Moto E7 Plus 64GB (criado UMA VEZ)</div>
                  <div><strong>Variação 1:</strong> Preto - 64GB - R$ 800</div>
                  <div><strong>Variação 2:</strong> Azul - 64GB - R$ 800</div>
                  <div><strong>Variação 3:</strong> Verde - 64GB - R$ 750 (desconto)</div>
                </div>
              </div>

              <button
                onClick={() => setCollapsed(true)}
                className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
              >
                Ok, entendi! Fechar instruções →
              </button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Botão para expandir novamente */}
      {collapsed && !isEditing && (
        <button
          onClick={() => setCollapsed(false)}
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium flex items-center gap-1"
        >
          <Lightbulb className="h-3 w-3" />
          Ver instruções novamente
        </button>
      )}

      {/* FORMULÁRIO ORIGINAL */}
      <div className="rounded-xl border bg-card p-6 space-y-6">
        {children}
      </div>
    </div>
  );
}
