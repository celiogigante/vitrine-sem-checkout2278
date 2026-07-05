import { AlertCircle, CheckCircle2, ArrowRight } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

export default function AdminProductFlowGuide() {
  return (
    <Alert className="mb-6 border-blue-200 bg-blue-50">
      <AlertCircle className="h-4 w-4 text-blue-600" />
      <AlertDescription className="ml-0">
        <div className="space-y-3">
          <div className="font-semibold text-blue-900">
            Como adicionar múltiplos celulares do mesmo modelo:
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Step 1 */}
            <div className="flex gap-3 rounded-lg bg-white p-3 border border-blue-100">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white text-sm font-bold">
                1
              </div>
              <div className="flex-1">
                <div className="font-medium text-blue-900">Criar o MODELO</div>
                <div className="text-sm text-blue-700">
                  Vá na aba <Badge variant="outline" className="text-xs">Modelos</Badge> e clique "Novo Modelo". Ex: iPhone 15 Pro
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-3 rounded-lg bg-white p-3 border border-blue-100">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white text-sm font-bold">
                2
              </div>
              <div className="flex-1">
                <div className="font-medium text-green-900">Adicionar VARIAÇÕES</div>
                <div className="text-sm text-green-700">
                  Na aba <Badge variant="outline" className="text-xs">Produtos</Badge>, selecione o modelo e clique "+ Adicionar Variação"
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-lg bg-white p-3 border border-blue-100">
            <div className="font-medium text-blue-900 mb-2">💡 Exemplo prático:</div>
            <div className="text-sm text-blue-700 space-y-1">
              <div>
                <strong>MODELO:</strong> iPhone 15 Pro (criado 1x apenas)
              </div>
              <div>
                <strong>VARIAÇÕES:</strong> Você pode ter 3 unidades diferentes:
              </div>
              <div className="ml-4 space-y-1 mt-1">
                <div>• iPhone 15 Pro 256GB Preto - R$ 5.000</div>
                <div>• iPhone 15 Pro 128GB Branco - R$ 4.500</div>
                <div>• iPhone 15 Pro 512GB Titânio - R$ 6.000</div>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="font-medium text-yellow-900 text-sm">⚠️ NÃO FAÇA ISSO:</div>
            <div className="text-sm text-yellow-700 mt-1">
              ❌ Não crie o mesmo produto "iPhone 15 Pro" 3 vezes na aba Produtos. Use as VARIAÇÕES dentro do mesmo produto!
            </div>
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
}
