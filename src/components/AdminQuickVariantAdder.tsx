import { useState } from "react";
import { Plus, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { addProductVariant, CONDITIONS, STATUSES, conditionLabel, statusLabel } from "@/lib/products";
import type { ProductVariant } from "@/lib/supabase";

interface QuickVariantAdderProps {
  productId: string;
  productName: string;
  onVariantAdded: (variant: ProductVariant) => void;
}

export default function AdminQuickVariantAdder({ productId, productName, onVariantAdded }: QuickVariantAdderProps) {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    sku: "",
    color: "",
    storage: "",
    ram: "",
    condition: "seminovo" as const,
    specific_defects: "",
    price: 0,
    original_price: undefined as number | undefined,
    stock_quantity: 1,
    status: "disponivel" as const,
  });

  const handleQuickAdd = async () => {
    if (!form.sku || !form.price) {
      toast({
        title: "Preencha SKU e preço",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const newVariant = await addProductVariant(productId, {
        sku: form.sku,
        color: form.color || undefined,
        storage: form.storage || undefined,
        ram: form.ram || undefined,
        condition: form.condition,
        specific_defects: form.specific_defects || undefined,
        price: form.price,
        original_price: form.original_price,
        stock_quantity: form.stock_quantity,
        status: form.status,
        order_index: 0,
      });

      if (newVariant) {
        onVariantAdded(newVariant);
        toast({ 
          title: "✅ Variação adicionada!",
          description: `${form.color || form.storage || form.sku} - R$ ${form.price.toFixed(2)}`
        });
        
        // Reset form but keep some values for quick add
        setForm({
          sku: "",
          color: "",
          storage: "",
          ram: "",
          condition: form.condition,
          specific_defects: "",
          price: form.price, // Keep price for quick bulk add
          original_price: form.original_price,
          stock_quantity: form.stock_quantity,
          status: form.status,
        });
      }
    } catch (err) {
      console.error("Error adding variant:", err);
      toast({
        title: "Erro ao adicionar variação",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <Button 
        onClick={() => setIsOpen(true)} 
        size="sm" 
        variant="outline"
        className="gap-2"
      >
        <Zap className="h-4 w-4" />
        Adicionar variação rápido
      </Button>
    );
  }

  return (
    <div className="rounded-lg border bg-gradient-to-br from-blue-50 to-transparent p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="font-semibold text-blue-900">Adicionar Variação</h4>
          <p className="text-xs text-blue-700">Produto: <strong>{productName}</strong></p>
        </div>
        <button onClick={() => setIsOpen(false)} className="text-muted-foreground hover:text-foreground">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="space-y-3">
        {/* Identificação rápida */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="SKU (ex: SKU123)"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="text-sm"
            autoFocus
          />
          <Input
            placeholder="Cor (ex: Preto)"
            value={form.color}
            onChange={(e) => setForm({ ...form, color: e.target.value })}
            className="text-sm"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            placeholder="Storage (ex: 128GB)"
            value={form.storage}
            onChange={(e) => setForm({ ...form, storage: e.target.value })}
            className="text-sm"
          />
          <Input
            placeholder="RAM (ex: 8GB)"
            value={form.ram}
            onChange={(e) => setForm({ ...form, ram: e.target.value })}
            className="text-sm"
          />
        </div>

        {/* Preço e estoque */}
        <div className="grid grid-cols-3 gap-3">
          <Input
            type="number"
            placeholder="Preço (R$)"
            value={form.price || ""}
            onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="Preço orig. (opt)"
            value={form.original_price || ""}
            onChange={(e) => setForm({ ...form, original_price: Number(e.target.value) || undefined })}
            className="text-sm"
          />
          <Input
            type="number"
            placeholder="Estoque"
            min="1"
            value={form.stock_quantity}
            onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
            className="text-sm"
          />
        </div>

        {/* Status simples */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={form.condition} onValueChange={(v) => setForm({ ...form, condition: v as any })}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CONDITIONS.map((c) => (
                <SelectItem key={c} value={c}>{conditionLabel(c)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v as any })}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{statusLabel(s)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Preview do que vai ser criado */}
        <div className="rounded bg-blue-100 p-2 text-xs text-blue-900">
          <strong>Preview:</strong> {form.sku || "SKU?"} {form.color && `• ${form.color}`} {form.storage && `• ${form.storage}`} → R$ {form.price.toFixed(2)}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsOpen(false)}
        >
          Fechar
        </Button>
        <Button 
          onClick={handleQuickAdd} 
          disabled={isSaving}
          size="sm"
          className="gap-2"
        >
          <Plus className="h-4 w-4" />
          {isSaving ? "Salvando..." : "Adicionar"}
        </Button>
      </div>
    </div>
  );
}
