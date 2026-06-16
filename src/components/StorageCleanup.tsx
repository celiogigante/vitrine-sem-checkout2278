import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { analyzeOrphanedImages, cleanupOrphanedImages } from "@/lib/storage-cleanup";
import { AlertCircle, Loader2, Trash2, CheckCircle, Eye, AlertTriangle } from "lucide-react";

export const StorageCleanup = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [lastResult, setLastResult] = useState<{
    count: number;
    timestamp: Date;
    analysis: {
      totalFiles: number;
      referencedFiles: number;
      orphanedFiles: number;
    } | null;
  } | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    setIsRunning(true);
    try {
      const result = await analyzeOrphanedImages();
      setLastResult({
        count: result.orphanedCount,
        timestamp: new Date(),
        analysis: result
      });
      toast({
        title: "Análise concluída",
        description: `Total: ${result.totalFiles} | Usadas: ${result.referencedFiles} | Órfãs: ${result.orphanedCount}`,
      });
    } catch (error) {
      console.error("Analysis failed:", error);
      toast({
        title: "Erro na análise",
        description: error instanceof Error ? error.message : "Falha ao analisar",
        variant: "destructive",
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="p-4 border border-red-200 rounded-lg bg-red-50">
        <div className="flex items-start gap-2">
          <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-sm text-red-900">⚠️ LIMPEZA DESABILITADA</h4>
            <p className="text-xs text-red-800 mt-1">
              Deletou 95 imagens ativas. Funcionalidade será reimplementada com segurança.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border rounded-lg bg-slate-50">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-sm">Análise de Storage</h3>
            <p className="text-xs text-muted-foreground mt-1">
              Veja quantas imagens estão órfãs antes de deletar (SEGURO)
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {lastResult && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg space-y-2">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-blue-800">
                  <p className="font-medium">Análise: {lastResult.timestamp.toLocaleString()}</p>
                </div>
              </div>
              {lastResult.analysis && (
                <div className="grid grid-cols-3 gap-2 text-xs mt-2">
                  <div className="p-2 bg-white rounded border border-blue-100">
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-bold text-lg">{lastResult.analysis.totalFiles}</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-blue-100">
                    <p className="text-muted-foreground">Usadas</p>
                    <p className="font-bold text-lg text-green-600">{lastResult.analysis.referencedFiles}</p>
                  </div>
                  <div className="p-2 bg-white rounded border border-blue-100">
                    <p className="text-muted-foreground">Órfãs</p>
                    <p className="font-bold text-lg text-orange-600">{lastResult.analysis.orphanedCount}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            ✅ Análise é segura, apenas visualiza sem deletar. Confirme antes de qualquer limpeza.
          </p>

          <Button
            onClick={handleAnalyze}
            disabled={isRunning}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isRunning && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {!isRunning && <Eye className="mr-2 h-4 w-4" />}
            {isRunning ? "Analisando..." : "Analisar Storage"}
          </Button>
        </div>
      </div>
    </div>
  );
};
