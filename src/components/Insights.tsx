import { useState, useEffect, useRef } from "react";
import { supabase, Product, Order, Customer } from "@/lib/supabase";
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Loader2, TrendingUp, ShoppingCart, Users, Eye, Package, DollarSign, MessageCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type PeriodKey = "7" | "15" | "30" | "month" | "2months" | "6months" | "year" | "custom";

interface DateRange {
  start: Date;
  end: Date;
}

interface ModelRecord {
  id: string;
  name: string;
}

interface ProductEvent {
  product_id: string;
  created_at: string;
}

interface WhatsAppEvent {
  product_id: string | null;
  model_id: string | null;
  created_at: string;
}

interface InsightsData {
  totalProducts: number;
  totalViews: number;
  whatsappClicks: number;
  featuredProducts: number;
  promotionProducts: number;
  totalCustomers: number;
  totalOrders: number;
  totalRevenue: number;
  topProducts: Array<Product & { event_views: number }>;
  topProductsByClicks: Array<{ product_id: string; product_name: string; total_clicks: number }>;
  modelViewsAndClicks: Array<{ modelId: string; modelName: string; views: number; whatsappClicks: number; conversionRate: number }>;
  conditionDistribution: Array<{ name: string; value: number }>;
  brandDistribution: Array<{ name: string; value: number }>;
  orderStatus: Array<{ status: string; count: number }>;
  averageProductPrice: number;
}

const PERIOD_OPTIONS: Array<{ value: PeriodKey; label: string }> = [
  { value: "7", label: "Últimos 7 dias" },
  { value: "15", label: "Últimos 15 dias" },
  { value: "30", label: "Últimos 30 dias" },
  { value: "month", label: "Último mês" },
  { value: "2months", label: "Últimos 2 meses" },
  { value: "6months", label: "Últimos 6 meses" },
  { value: "year", label: "Último ano" },
  { value: "custom", label: "Personalizado" },
];

function getPeriodRange(period: PeriodKey, customStartDate: string, customEndDate: string): DateRange | null {
  const end = new Date();
  let start = new Date(end);

  if (period === "custom") {
    if (!customStartDate || !customEndDate) return null;
    start = new Date(`${customStartDate}T00:00:00`);
    const customEnd = new Date(`${customEndDate}T00:00:00`);
    if (Number.isNaN(start.getTime()) || Number.isNaN(customEnd.getTime()) || start > customEnd) return null;
    customEnd.setDate(customEnd.getDate() + 1);
    return { start, end: customEnd };
  }

  if (period === "month") start.setMonth(start.getMonth() - 1);
  else if (period === "2months") start.setMonth(start.getMonth() - 2);
  else if (period === "6months") start.setMonth(start.getMonth() - 6);
  else if (period === "year") start.setFullYear(start.getFullYear() - 1);
  else start.setDate(start.getDate() - Number(period));

  return { start, end };
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("pt-BR");
}

export function Insights() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTemporalLoading, setIsTemporalLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [period, setPeriod] = useState<PeriodKey>("30");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");
  const [showConversionModal, setShowConversionModal] = useState(false);
  const temporalRequestRef = useRef(0);

  const loadStaticInsights = async (): Promise<Product[]> => {
    const [productsResult, customersResult, ordersResult] = await Promise.all([
      supabase.from("products").select("*"),
      supabase.from("customers").select("*"),
      supabase.from("orders").select("*"),
    ]);

    if (productsResult.error) throw productsResult.error;
    if (customersResult.error) throw customersResult.error;
    if (ordersResult.error) throw ordersResult.error;

    const productList = (productsResult.data || []) as Product[];
    const customerList = (customersResult.data || []) as Customer[];
    const orderList = (ordersResult.data || []) as Order[];
    const totalProducts = productList.length;
    const conditionMap: Record<string, number> = {};
    const brandMap: Record<string, number> = {};
    const statusMap: Record<string, number> = {};

    productList.forEach((product) => {
      conditionMap[product.condition] = (conditionMap[product.condition] || 0) + 1;
      brandMap[product.brand] = (brandMap[product.brand] || 0) + 1;
    });
    orderList.forEach((order) => {
      statusMap[order.status] = (statusMap[order.status] || 0) + 1;
    });

    setProducts(productList);
    setData((current) => ({
      totalProducts,
      totalViews: current?.totalViews || 0,
      whatsappClicks: current?.whatsappClicks || 0,
      featuredProducts: productList.filter((product) => product.featured).length,
      promotionProducts: productList.filter((product) => product.promotion).length,
      totalCustomers: customerList.length,
      totalOrders: orderList.length,
      totalRevenue: orderList.reduce((sum, order) => sum + order.total_price, 0),
      topProducts: current?.topProducts || [],
      topProductsByClicks: current?.topProductsByClicks || [],
      modelViewsAndClicks: current?.modelViewsAndClicks || [],
      conditionDistribution: Object.entries(conditionMap).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
      })),
      brandDistribution: Object.entries(brandMap)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8),
      orderStatus: Object.entries(statusMap).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
      })),
      averageProductPrice: totalProducts > 0
        ? productList.reduce((sum, product) => sum + product.price, 0) / totalProducts
        : 0,
    }));

    return productList;
  };

  const loadTemporalInsights = async (range: DateRange, productList: Product[]) => {
    const requestId = ++temporalRequestRef.current;
    try {
      setIsTemporalLoading(true);
      const start = range.start.toISOString();
      const end = range.end.toISOString();
      const [viewsResult, productClicksResult, whatsappResult, modelsResult] = await Promise.all([
        supabase.from("product_views").select("product_id, created_at").gte("created_at", start).lt("created_at", end),
        supabase.from("product_clicks").select("product_id, created_at").gte("created_at", start).lt("created_at", end),
        supabase.from("whatsapp_clicks").select("product_id, model_id, created_at").gte("created_at", start).lt("created_at", end),
        supabase.from("models").select("id, name"),
      ]);

      if (viewsResult.error) throw viewsResult.error;
      if (productClicksResult.error) throw productClicksResult.error;
      if (whatsappResult.error) throw whatsappResult.error;
      if (modelsResult.error) throw modelsResult.error;

      const viewEvents = (viewsResult.data || []) as ProductEvent[];
      const productClickEvents = (productClicksResult.data || []) as ProductEvent[];
      const whatsappEvents = (whatsappResult.data || []) as WhatsAppEvent[];
      const modelMap = new Map((modelsResult.data as ModelRecord[] || []).map((model) => [model.id, model.name]));
      const productMap = new Map(productList.map((product) => [product.id, product]));
      const viewsByProduct = new Map<string, number>();
      const clicksByProduct = new Map<string, number>();
      const viewsByModel = new Map<string, number>();
      const clicksByModel = new Map<string, number>();

      viewEvents.forEach((event) => {
        viewsByProduct.set(event.product_id, (viewsByProduct.get(event.product_id) || 0) + 1);
        const modelId = productMap.get(event.product_id)?.model_id;
        if (modelId) viewsByModel.set(modelId, (viewsByModel.get(modelId) || 0) + 1);
      });
      productClickEvents.forEach((event) => {
        clicksByProduct.set(event.product_id, (clicksByProduct.get(event.product_id) || 0) + 1);
      });
      whatsappEvents.forEach((event) => {
        const modelId = event.model_id || (event.product_id ? productMap.get(event.product_id)?.model_id : undefined);
        if (modelId) clicksByModel.set(modelId, (clicksByModel.get(modelId) || 0) + 1);
      });

      const topProducts = Array.from(viewsByProduct.entries())
        .map(([productId, event_views]) => ({ ...productMap.get(productId), event_views }))
        .filter((product): product is Product & { event_views: number } => Boolean(product.id))
        .sort((a, b) => b.event_views - a.event_views)
        .slice(0, 5);
      const topProductsByClicks = Array.from(clicksByProduct.entries())
        .map(([productId, total_clicks]) => ({
          product_id: productId,
          product_name: productMap.get(productId)?.name || "Produto desconhecido",
          total_clicks,
        }))
        .sort((a, b) => b.total_clicks - a.total_clicks)
        .slice(0, 5);
      const modelViewsAndClicks = Array.from(modelMap.entries())
        .map(([modelId, modelName]) => {
          const views = viewsByModel.get(modelId) || 0;
          const whatsappClicks = clicksByModel.get(modelId) || 0;
          return {
            modelId,
            modelName,
            views,
            whatsappClicks,
            conversionRate: views > 0 ? Math.round((whatsappClicks / views) * 1000) / 10 : 0,
          };
        })
        .filter((model) => model.views > 0 || model.whatsappClicks > 0)
        .sort((a, b) => b.views - a.views || b.whatsappClicks - a.whatsappClicks);

      if (requestId !== temporalRequestRef.current) return;
      setData((current) => current ? {
        ...current,
        totalViews: viewEvents.length,
        whatsappClicks: whatsappEvents.length,
        topProducts,
        topProductsByClicks,
        modelViewsAndClicks,
      } : current);
      setLastRefresh(new Date());
    } catch (err) {
      if (requestId !== temporalRequestRef.current) return;
      console.error("Error loading temporal insights:", err);
      alert(`Erro ao carregar métricas do período: ${err instanceof Error ? err.message : "erro desconhecido"}`);
    } finally {
      if (requestId === temporalRequestRef.current) setIsTemporalLoading(false);
    }
  };

  const loadInsights = async () => {
    try {
      setIsLoading(true);
      const productList = await loadStaticInsights();
      const range = getPeriodRange(period, customStartDate, customEndDate);
      if (range) await loadTemporalInsights(range, productList);
    } catch (err) {
      console.error("Error loading insights:", err);
      const errorMsg = err instanceof Error ? err.message : "Erro ao carregar insights";
      alert(`Erro ao carregar insights: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, []);

  useEffect(() => {
    const range = getPeriodRange(period, customStartDate, customEndDate);
    if (range && products.length > 0) loadTemporalInsights(range, products);
  }, [period, customStartDate, customEndDate]);

  const handleGenerateReport = () => {
    if (!data) return;
    const range = getPeriodRange(period, customStartDate, customEndDate);
    if (!range) return;

    const modelRows = data.modelViewsAndClicks;
    const viewsRanking = [...modelRows].sort((a, b) => b.views - a.views);
    const clicksRanking = [...modelRows].sort((a, b) => b.whatsappClicks - a.whatsappClicks);
    const rows = modelRows.map((model) => [
      viewsRanking.findIndex((item) => item.modelId === model.modelId) + 1,
      model.modelName,
      model.views,
      clicksRanking.findIndex((item) => item.modelId === model.modelId) + 1,
      model.whatsappClicks,
      model.conversionRate,
      data.totalViews,
      data.whatsappClicks,
      formatDate(range.start),
      formatDate(new Date(range.end.getTime() - 1)),
    ]);
    const headers = [
      "Posição no ranking de acessos",
      "Modelo",
      "Acessos do modelo",
      "Posição no ranking de cliques",
      "Cliques no WhatsApp do modelo",
      "Taxa de conversão (%)",
      "Total de acessos do período",
      "Total de cliques do período",
      "Data inicial",
      "Data final",
    ];
    const csvValue = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
    const csv = [headers, ...rows].map((row) => row.map(csvValue).join(";")).join("\n");
    const blob = new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `relatorio-insights-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-muted-foreground mb-4">Erro ao carregar os insights</p>
        <button
          onClick={() => {
            setIsLoading(true);
            loadInsights();
          }}
          className="text-primary hover:underline cursor-pointer"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  const COLORS = [
    "#3b82f6",
    "#10b981",
    "#f59e0b",
    "#ef4444",
    "#8b5cf6",
    "#06b6d4",
    "#ec4899",
    "#6366f1",
  ];

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="w-full sm:w-56">
              <label htmlFor="insights-period" className="mb-1 block text-sm font-medium">
                Período das métricas
              </label>
              <Select value={period} onValueChange={(value) => setPeriod(value as PeriodKey)}>
                <SelectTrigger id="insights-period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PERIOD_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {period === "custom" && (
              <>
                <div>
                  <label htmlFor="insights-start-date" className="mb-1 block text-sm font-medium">
                    Data inicial
                  </label>
                  <Input
                    id="insights-start-date"
                    type="date"
                    value={customStartDate}
                    onChange={(event) => setCustomStartDate(event.target.value)}
                    className="w-full sm:w-40"
                  />
                </div>
                <div>
                  <label htmlFor="insights-end-date" className="mb-1 block text-sm font-medium">
                    Data final
                  </label>
                  <Input
                    id="insights-end-date"
                    type="date"
                    value={customEndDate}
                    min={customStartDate || undefined}
                    onChange={(event) => setCustomEndDate(event.target.value)}
                    className="w-full sm:w-40"
                  />
                </div>
              </>
            )}
          </div>
          <Button
            onClick={handleGenerateReport}
            disabled={isTemporalLoading || !getPeriodRange(period, customStartDate, customEndDate)}
            variant="outline"
          >
            <Download className="mr-2 h-4 w-4" />
            Gerar relatório
          </Button>
        </div>
        {period === "custom" && !getPeriodRange(period, customStartDate, customEndDate) && (
          <p className="mt-2 text-sm text-muted-foreground">Informe um intervalo de datas válido para carregar as métricas.</p>
        )}
        {isTemporalLoading && (
          <p className="mt-2 text-sm text-muted-foreground">Atualizando métricas do período...</p>
        )}
      </div>

      {/* Refresh Info */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <p>Última atualização: {lastRefresh.toLocaleTimeString("pt-BR")}</p>
        <button
          onClick={() => {
            setIsLoading(true);
            loadInsights();
          }}
          disabled={isLoading}
          className="text-primary hover:underline cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? "Carregando..." : "↻ Atualizar agora"}
        </button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Produtos</p>
              <p className="text-2xl font-bold mt-1">{data.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Visualizações</p>
              <p className="text-2xl font-bold mt-1">{data.totalViews.toLocaleString("pt-BR")}</p>
            </div>
            <Eye className="h-8 w-8 text-purple-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Cliques no WhatsApp</p>
              <p className="text-2xl font-bold mt-1">{data.whatsappClicks.toLocaleString("pt-BR")}</p>
            </div>
            <MessageCircle className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Clientes</p>
              <p className="text-2xl font-bold mt-1">{data.totalCustomers}</p>
            </div>
            <Users className="h-8 w-8 text-green-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Total de Pedidos</p>
              <p className="text-2xl font-bold mt-1">{data.totalOrders}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-orange-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Faturamento Total</p>
              <p className="text-2xl font-bold mt-1">
                R$ {data.totalRevenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <DollarSign className="h-8 w-8 text-yellow-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Preço Médio</p>
              <p className="text-2xl font-bold mt-1">
                R$ {data.averageProductPrice.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}
              </p>
            </div>
            <TrendingUp className="h-8 w-8 text-red-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Destaque</p>
              <p className="text-2xl font-bold mt-1">{data.featuredProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-indigo-500 opacity-20" />
          </div>
        </div>

        <div className="rounded-lg border bg-card p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">Em Promoção</p>
              <p className="text-2xl font-bold mt-1">{data.promotionProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-pink-500 opacity-20" />
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products by Views */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold mb-4">Top 5 Produtos Mais Vistos</h3>
          <div className="space-y-3">
            {data.topProducts.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">#{index + 1}</span>
                  <span className="truncate">{product.name}</span>
                </div>
                <span className="font-bold">{product.event_views}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Products by Clicks */}
        <div className="rounded-lg border bg-card p-4">
          <h3 className="font-semibold mb-4">Top 5 Produtos Mais Clicados</h3>
          <div className="space-y-3">
            {data.topProductsByClicks.length > 0 ? (
              data.topProductsByClicks.map((item, index) => (
                <div key={item.product_id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground font-medium">#{index + 1}</span>
                    <span className="truncate">{item.product_name}</span>
                  </div>
                  <span className="font-bold">{item.total_clicks}</span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhum clique registrado ainda</p>
            )}
          </div>
        </div>

        {/* Model Conversion Rate Analysis */}
        {data.modelViewsAndClicks && data.modelViewsAndClicks.length > 0 && (
          <>
            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Taxa de Conversão por Modelo</h3>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowConversionModal(true)}
                >
                  Ver Detalhes
                </Button>
              </div>

              {/* Bar Chart */}
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.modelViewsAndClicks}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="modelName"
                    angle={-45}
                    textAnchor="end"
                    height={80}
                    interval={0}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value) => typeof value === 'number' ? value.toFixed(2) : value}
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', border: 'none', borderRadius: '8px', color: '#fff' }}
                  />
                  <Legend />
                  <Bar dataKey="views" name="Visualizações" fill="#3b82f6" />
                  <Bar dataKey="whatsappClicks" name="Cliques WhatsApp" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Conversion Rate Modal */}
            <Dialog open={showConversionModal} onOpenChange={setShowConversionModal}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Taxa de Conversão por Modelo</DialogTitle>
                </DialogHeader>
                <div className="max-h-96 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-muted">
                      <tr>
                        <th className="text-left p-2 font-semibold">Posição</th>
                        <th className="text-left p-2 font-semibold">Modelo</th>
                        <th className="text-center p-2 font-semibold">Visualizações</th>
                        <th className="text-center p-2 font-semibold">Cliques</th>
                        <th className="text-center p-2 font-semibold">Taxa %</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.modelViewsAndClicks.map((model, index) => (
                        <tr key={model.modelId} className="border-b hover:bg-muted/50">
                          <td className="p-2 font-semibold text-muted-foreground">#{index + 1}</td>
                          <td className="p-2 font-medium">{model.modelName}</td>
                          <td className="p-2 text-center">{model.views}</td>
                          <td className="p-2 text-center font-semibold text-green-600">{model.whatsappClicks}</td>
                          <td className="p-2 text-center font-bold text-lg">{model.conversionRate}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </DialogContent>
            </Dialog>
          </>
        )}

        {/* Condition Distribution */}
        {data.conditionDistribution.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-4">Distribuição por Condição</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={data.conditionDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={true}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {data.conditionDistribution.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Brand Distribution */}
        {data.brandDistribution.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-4">Top Marcas</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.brandDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Order Status */}
        {data.orderStatus.length > 0 && (
          <div className="rounded-lg border bg-card p-4">
            <h3 className="font-semibold mb-4">Status dos Pedidos</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.orderStatus}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}
