import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, Trash2, RefreshCw, Download, Loader2 } from "lucide-react";

interface ErrorLog {
  id: string;
  error_type: string;
  message: string;
  stack?: string;
  url: string;
  created_at: string;
  user_agent?: string;
  severity: "low" | "medium" | "high" | "critical";
  context?: Record<string, any>;
}

export const AdminErrorMonitor = () => {
  const [errors, setErrors] = useState<ErrorLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterSeverity, setFilterSeverity] = useState<string>("all");
  const [filterType, setFilterType] = useState<string>("all");
  const [searchMessage, setSearchMessage] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadErrors = async () => {
    setIsLoading(true);
    try {
      let query = supabase.from("error_logs").select("*").order("created_at", { ascending: false }).limit(1000);

      if (filterSeverity !== "all") {
        query = query.eq("severity", filterSeverity);
      }

      if (filterType !== "all") {
        query = query.eq("error_type", filterType);
      }

      const { data, error } = await query;

      if (error) throw error;

      setErrors(data || []);
    } catch (error) {
      console.error("Failed to load errors:", error);
      toast({
        title: "Erro ao carregar logs",
        description: error instanceof Error ? error.message : "Falha ao conectar",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadErrors();
  }, [filterSeverity, filterType]);

  const handleDeleteAll = async () => {
    if (!confirm("Tem certeza? Isso vai deletar TODOS os logs de erro!")) return;

    try {
      const { error } = await supabase.from("error_logs").delete().gt("created_at", "1970-01-01");

      if (error) throw error;

      setErrors([]);
      toast({ title: "Todos os logs foram deletados" });
    } catch (error) {
      console.error("Failed to delete logs:", error);
      toast({
        title: "Erro ao deletar logs",
        variant: "destructive",
      });
    }
  };

  const handleExportCSV = () => {
    const csv = [
      ["Data", "Tipo", "Severidade", "Mensagem", "URL"],
      ...errors.map((e) => [
        new Date(e.created_at).toLocaleString(),
        e.error_type,
        e.severity,
        e.message,
        e.url,
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `error-logs-${new Date().toISOString()}.csv`;
    a.click();
  };

  const filteredErrors = errors.filter((e) =>
    e.message.toLowerCase().includes(searchMessage.toLowerCase())
  );

  const severityColor = {
    low: "bg-blue-100 text-blue-800",
    medium: "bg-yellow-100 text-yellow-800",
    high: "bg-orange-100 text-orange-800",
    critical: "bg-red-100 text-red-800",
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Monitoramento de Erros</h2>
        <div className="flex gap-2">
          <Button onClick={loadErrors} disabled={isLoading} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            Atualizar
          </Button>
          <Button onClick={handleExportCSV} disabled={errors.length === 0} variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-xs text-muted-foreground">Total</p>
          <p className="text-2xl font-bold">{errors.length}</p>
        </div>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-xs text-muted-foreground">Críticos</p>
          <p className="text-2xl font-bold text-red-600">{errors.filter((e) => e.severity === "critical").length}</p>
        </div>
        <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
          <p className="text-xs text-muted-foreground">Altos</p>
          <p className="text-2xl font-bold text-orange-600">{errors.filter((e) => e.severity === "high").length}</p>
        </div>
        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs text-muted-foreground">Médios</p>
          <p className="text-2xl font-bold text-yellow-600">{errors.filter((e) => e.severity === "medium").length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-2">
        <Input
          placeholder="Buscar mensagem de erro..."
          value={searchMessage}
          onChange={(e) => setSearchMessage(e.target.value)}
          className="flex-1"
        />
        <Select value={filterSeverity} onValueChange={setFilterSeverity}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Severidade" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas severidades</SelectItem>
            <SelectItem value="critical">Crítico</SelectItem>
            <SelectItem value="high">Alto</SelectItem>
            <SelectItem value="medium">Médio</SelectItem>
            <SelectItem value="low">Baixo</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-full md:w-40">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos tipos</SelectItem>
            <SelectItem value="javascript">JavaScript</SelectItem>
            <SelectItem value="network">Network</SelectItem>
            <SelectItem value="unhandled_rejection">Promise</SelectItem>
            <SelectItem value="custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Error List */}
      <div className="border rounded-lg divide-y max-h-[600px] overflow-y-auto">
        {isLoading ? (
          <div className="p-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          </div>
        ) : filteredErrors.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Nenhum erro encontrado</p>
          </div>
        ) : (
          filteredErrors.map((error) => (
            <div key={error.id} className="p-4 hover:bg-slate-50">
              <div
                className="flex items-start justify-between cursor-pointer"
                onClick={() => setExpandedId(expandedId === error.id ? null : error.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge className={severityColor[error.severity]}>
                      {error.severity.toUpperCase()}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{error.error_type}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(error.created_at).toLocaleString()}
                    </span>
                  </div>
                  <p className="font-medium text-sm">{error.message}</p>
                  <p className="text-xs text-muted-foreground mt-1">{error.url}</p>
                </div>
              </div>

              {expandedId === error.id && (
                <div className="mt-3 p-3 bg-slate-100 rounded text-xs font-mono space-y-2">
                  {error.stack && (
                    <div>
                      <p className="font-bold text-slate-700">Stack:</p>
                      <pre className="whitespace-pre-wrap break-words text-slate-600 max-h-32 overflow-y-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}
                  {error.context && Object.keys(error.context).length > 0 && (
                    <div>
                      <p className="font-bold text-slate-700">Context:</p>
                      <pre className="whitespace-pre-wrap break-words text-slate-600">
                        {JSON.stringify(error.context, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Delete Button */}
      {errors.length > 0 && (
        <Button
          onClick={handleDeleteAll}
          variant="destructive"
          size="sm"
          className="w-full"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Deletar Todos os Logs
        </Button>
      )}
    </div>
  );
};
