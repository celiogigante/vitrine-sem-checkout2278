import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Lightbulb, ArrowRight, X } from "lucide-react";

interface AdminProductWizardProps {
  onCreateNew: () => void;
  onViewExisting: () => void;
  onClose: () => void;
}

export default function AdminProductWizard({
  onCreateNew,
  onViewExisting,
  onClose,
}: AdminProductWizardProps) {
  const [step, setStep] = useState<"choice" | "new" | "existing">("choice");

  const renderChoice = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-bold text-blue-900">
          Como você quer adicionar celulares?
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Escolha a opção que melhor se aplica ao seu caso
        </p>
      </div>

      {/* Option 1: Novo produto */}
      <Card className="p-4 cursor-pointer border-2 border-transparent hover:border-blue-400 hover:bg-blue-50 transition-all"
        onClick={() => setStep("new")}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white font-bold text-sm mt-1">
            +
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-blue-900">
              Criar um NOVO modelo
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              Você quer adicionar um celular que <strong>NÃO existe</strong> no sistema ainda (ex: Samsung S25)
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs">
                Novo modelo
              </Badge>
              <Badge variant="outline" className="text-xs">
                Primeira unidade
              </Badge>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-blue-600 shrink-0 mt-2" />
        </div>
      </Card>

      {/* Option 2: Adicionar variação */}
      <Card
        className="p-4 cursor-pointer border-2 border-green-200 bg-green-50 hover:border-green-400 transition-all"
        onClick={() => setStep("existing")}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-white font-bold text-sm mt-1">
            2+
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-green-900">
              Adicionar mais unidades de um modelo EXISTENTE
            </h4>
            <p className="text-xs text-muted-foreground mt-1">
              O celular já está no sistema (ex: "Moto E7 Plus 64GB"), mas você quer adicionar <strong>outra cor ou especificação</strong>
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                Variação
              </Badge>
              <Badge variant="outline" className="text-xs bg-green-100 text-green-800 border-green-300">
                Múltiplas cores
              </Badge>
            </div>
          </div>
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-2" />
        </div>
      </Card>

      <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
        <div className="flex gap-2">
          <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-900">
            <strong>Dúvida?</strong> Se o celular JÁ foi cadastrado antes, escolha a <strong>opção 2</strong> para adicionar variação. Isso evita duplicação!
          </div>
        </div>
      </div>
    </div>
  );

  const renderNew = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-blue-900">Criar novo modelo</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Preencha os dados básicos do celular
        </p>
      </div>

      <div className="space-y-3">
        <div className="flex items-start gap-2 text-sm">
          <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
          <p className="text-muted-foreground">
            Preencha o formulário abaixo com o <strong>nome, marca e descrição</strong>
          </p>
        </div>

        <div className="flex items-start gap-2 text-sm">
          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-xs font-bold shrink-0 mt-0">
            2
          </div>
          <p className="text-muted-foreground">
            Após salvar, você pode adicionar <strong>múltiplas variações</strong> (cores, storage)
          </p>
        </div>

        <div className="rounded-lg bg-blue-50 border border-blue-200 p-3">
          <div className="text-xs text-blue-900 space-y-1">
            <p className="font-semibold">Exemplo:</p>
            <p>• Nome: <strong>iPhone 15 Pro</strong></p>
            <p>• Marca: <strong>Apple</strong></p>
            <p>• Descrição: <strong>Tela 6.1", Chip A17 Pro, etc.</strong></p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 pt-4 justify-end">
        <Button variant="outline" onClick={() => setStep("choice")}>
          Voltar
        </Button>
        <Button
          onClick={() => {
            onCreateNew();
            onClose();
          }}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Preencher formulário →
        </Button>
      </div>
    </div>
  );

  const renderExisting = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <h3 className="text-lg font-bold text-green-900">
          Adicionar variação de modelo existente
        </h3>
        <p className="text-xs text-muted-foreground mt-1">
          Guia passo a passo
        </p>
      </div>

      <div className="space-y-3">
        {/* Step 1 */}
        <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
              1
            </div>
            <p className="font-semibold text-green-900">
              Encontre o produto na lista
            </p>
          </div>
          <p className="text-xs text-green-800 ml-8">
            Procure pelo nome (ex: "Moto E7 Plus 64GB") na tabela de produtos abaixo
          </p>
        </div>

        {/* Step 2 */}
        <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
              2
            </div>
            <p className="font-semibold text-green-900">
              Clique em EDITAR (ícone de lápis)
            </p>
          </div>
          <p className="text-xs text-green-800 ml-8">
            Na coluna "Ações", clique no ícone de editar para abrir os detalhes
          </p>
        </div>

        {/* Step 3 */}
        <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
              3
            </div>
            <p className="font-semibold text-green-900">
              Role até "Variações de Produtos"
            </p>
          </div>
          <p className="text-xs text-green-800 ml-8">
            Você verá a seção com as cores/versões já cadastradas
          </p>
        </div>

        {/* Step 4 */}
        <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-600 text-white text-xs font-bold">
              4
            </div>
            <p className="font-semibold text-green-900">
              Clique "+ Adicionar Variação"
            </p>
          </div>
          <p className="text-xs text-green-800 ml-8">
            Preencha: SKU, Cor, Storage, Preço e Estoque. Clique Salvar!
          </p>
        </div>

        {/* Result */}
        <div className="rounded-lg bg-purple-100 border border-purple-300 p-3">
          <p className="text-xs text-purple-900">
            ✓ <strong>Pronto!</strong> Você agora tem 2 unidades do mesmo celular com especificações diferentes
          </p>
        </div>
      </div>

      <div className="flex gap-2 pt-4 justify-end">
        <Button variant="outline" onClick={() => setStep("choice")}>
          Voltar
        </Button>
        <Button
          onClick={() => {
            onViewExisting();
            onClose();
          }}
          className="bg-green-600 hover:bg-green-700"
        >
          Ir para a tabela de produtos →
        </Button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-6">
          {step === "choice" && renderChoice()}
          {step === "new" && renderNew()}
          {step === "existing" && renderExisting()}
        </div>
      </Card>
    </div>
  );
}
