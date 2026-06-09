import { useRef, useCallback, useState } from "react";
import { QRCodeSVG as QRCode } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Button } from "@/components/ui/button";
import { Download, Share2, Copy, Check, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminQRCodeManager() {
  const qrRef = useRef<any>(null);
  const [copiedUrl, setCopiedUrl] = useState(false);
  const { toast } = useToast();

  const qrValue = typeof window !== "undefined" 
    ? `${window.location.origin}/links` 
    : "https://example.com/links";

  const handleDownloadQR = useCallback(async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });
      const url = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = url;
      link.download = "master-cell-qrcode.png";
      link.click();
      toast({ title: "QR Code baixado com sucesso!" });
    } catch (err) {
      console.error("Error downloading QR:", err);
      toast({
        title: "Erro ao baixar QR Code",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleDownloadPDF = useCallback(async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      const imgWidth = 100;
      const imgHeight = 100;
      const x = (pdf.internal.pageSize.getWidth() - imgWidth) / 2;
      const y = 50;

      pdf.addImage(imgData, "PNG", x, y, imgWidth, imgHeight);

      // Add text
      pdf.setFontSize(16);
      pdf.text("Master Cell", x + imgWidth / 2, 30, { align: "center" });
      
      pdf.setFontSize(12);
      pdf.text("Escaneie o QR Code para acessar nossos links", x + imgWidth / 2, 160, {
        align: "center",
      });

      pdf.setFontSize(10);
      pdf.text(qrValue, x + imgWidth / 2, 170, { align: "center" });

      pdf.save("master-cell-qrcode.pdf");
      toast({ title: "PDF gerado com sucesso!" });
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast({
        title: "Erro ao gerar PDF",
        variant: "destructive",
      });
    }
  }, [qrValue, toast]);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(qrValue);
    setCopiedUrl(true);
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleShare = useCallback(async () => {
    if (!qrRef.current) return;

    try {
      const canvas = await html2canvas(qrRef.current, {
        scale: 2,
        backgroundColor: "#ffffff",
      });

      canvas.toBlob((blob) => {
        if (!blob) return;

        const file = new File([blob], "master-cell-qrcode.png", {
          type: "image/png",
        });

        if (navigator.share) {
          navigator.share({
            title: "Master Cell QR Code",
            text: "Escaneie o QR Code para acessar nossos links",
            files: [file],
          });
        } else {
          toast({
            title: "Compartilhamento não suportado neste navegador",
            variant: "destructive",
          });
        }
      });
    } catch (err) {
      console.error("Error sharing:", err);
      toast({
        title: "Erro ao compartilhar",
        variant: "destructive",
      });
    }
  }, [toast]);

  return (
    <div className="space-y-6">
      <div className="rounded-lg border bg-card p-6">
        <h2 className="text-2xl font-bold mb-6">Gerenciador de QR Code</h2>

        {/* QR Code Display */}
        <div className="flex flex-col items-center gap-6">
          <div
            ref={qrRef}
            className="p-6 bg-white rounded-lg border-2 border-primary/20"
          >
            <QRCode
              value={qrValue}
              size={256}
              level="H"
              includeMargin={true}
              fgColor="#000000"
              bgColor="#ffffff"
            />
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              URL do QR Code:
            </p>
            <div className="flex items-center gap-2 justify-center">
              <code className="text-xs bg-secondary px-3 py-2 rounded border">
                {qrValue}
              </code>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleCopyLink}
                className="text-primary hover:text-primary/80"
              >
                {copiedUrl ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-1" />
                    Copiar
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Opções de Compartilhamento</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Button
            onClick={handleDownloadQR}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Download className="w-4 h-4" />
            Baixar como PNG
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="gap-2 bg-blue-600 hover:bg-blue-700"
          >
            <Download className="w-4 h-4" />
            Baixar como PDF
          </Button>
          <Button
            onClick={handleShare}
            variant="outline"
            className="gap-2"
          >
            <Share2 className="w-4 h-4" />
            Compartilhar
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800 p-4">
        <h3 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-2">
          💡 Como usar
        </h3>
        <ul className="text-sm text-yellow-800 dark:text-yellow-200 space-y-1 list-disc list-inside">
          <li>Copie o link e compartilhe no Instagram bio</li>
          <li>Baixe a imagem PNG para postar em fotos</li>
          <li>Gere o PDF para imprimir em flyers ou adesivos</li>
          <li>Use o compartilhamento direto para enviar em redes sociais</li>
        </ul>
      </div>

      {/* What's included in /links */}
      <div className="rounded-lg border bg-card p-6">
        <h3 className="text-lg font-semibold mb-4">Links incluídos no QR Code</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-2 p-3 bg-secondary/50 rounded">
            <p className="font-medium text-sm">🌐 Website</p>
            <p className="text-xs text-muted-foreground">
              https://www.mastercellbg.com/
            </p>
          </div>
          <div className="space-y-2 p-3 bg-secondary/50 rounded">
            <p className="font-medium text-sm">📱 Instagram</p>
            <p className="text-xs text-muted-foreground">
              @mastercellbg
            </p>
          </div>
          <div className="space-y-2 p-3 bg-secondary/50 rounded">
            <p className="font-medium text-sm">💬 WhatsApp</p>
            <p className="text-xs text-muted-foreground">
              Contato direto
            </p>
          </div>
          <div className="space-y-2 p-3 bg-secondary/50 rounded">
            <p className="font-medium text-sm">📍 Localização</p>
            <p className="text-xs text-muted-foreground">
              Barra do Garças - MT
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
