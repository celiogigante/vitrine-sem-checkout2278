import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Loader2, Video, Image as ImageIcon, AlertCircle } from "lucide-react";

interface MediaUploadProps {
  onImagesUrls: (urls: string[]) => void;
  onVideoUrl: (url: string) => void;
  productId?: string;
  currentImages?: string[];
  currentVideo?: string;
}

const MAX_IMAGES = 5;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1s
const URL_VALIDATION_TIMEOUT = 5000; // 5s

export const ImageUpload = ({
  onImagesUrls,
  onVideoUrl,
  productId,
  currentImages = [],
  currentVideo = ""
}: MediaUploadProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [images, setImages] = useState<string[]>(currentImages);
  const [video, setVideo] = useState<string>(currentVideo);
  const [videoInputValue, setVideoInputValue] = useState<string>(currentVideo);
  const [uploadingFiles, setUploadingFiles] = useState<Set<string>>(new Set());
  const imageInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  // Validar se a URL da imagem está acessível
  const validateImageUrl = async (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
      const img = new Image();
      const timeout = setTimeout(() => {
        img.onerror = img.onload = null;
        resolve(false);
      }, URL_VALIDATION_TIMEOUT);

      img.onload = () => {
        clearTimeout(timeout);
        resolve(true);
      };
      img.onerror = () => {
        clearTimeout(timeout);
        resolve(false);
      };
      img.src = url;
    });
  };

  const uploadImage = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Arquivo inválido",
        description: "Selecione uma imagem válida (PNG, JPG, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (file.size > MAX_IMAGE_SIZE) {
      toast({
        title: "Arquivo muito grande",
        description: "Máximo 5MB por imagem",
        variant: "destructive",
      });
      return;
    }

    const fileKey = `${Date.now()}_${file.name}`;
    setUploadingFiles((prev) => new Set(prev).add(fileKey));
    setIsUploading(true);

    let uploadedUrl: string | null = null;

    try {
      const fileName = fileKey;
      const filePath = productId
        ? `products/${productId}/images/${fileName}`
        : `products/images/${fileName}`;

      let lastError: Error | null = null;

      // Retry com exponential backoff
      for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        try {
          const { error: uploadError } = await supabase.storage
            .from("products")
            .upload(filePath, file, { upsert: true });

          if (uploadError) throw uploadError;

          // Gerar URL pública
          const { data } = supabase.storage
            .from("products")
            .getPublicUrl(filePath);

          uploadedUrl = data?.publicUrl || null;

          if (!uploadedUrl) throw new Error("Falha ao gerar URL pública");

          // Validar se a URL está realmente acessível
          const isAccessible = await validateImageUrl(uploadedUrl);

          if (!isAccessible) {
            throw new Error("Imagem não está acessível após upload");
          }

          // Sucesso!
          const newImages = [...images, uploadedUrl];
          setImages(newImages);
          onImagesUrls(newImages);
          toast({ title: "Imagem adicionada com sucesso!" });
          break;
        } catch (err) {
          lastError = err instanceof Error ? err : new Error("Erro desconhecido");
          console.warn(`Upload attempt ${attempt}/${MAX_RETRIES} failed:`, lastError.message);

          if (attempt < MAX_RETRIES) {
            // Aguardar antes de retry (exponential backoff)
            await new Promise((resolve) =>
              setTimeout(resolve, RETRY_DELAY * attempt)
            );
          }
        }
      }

      // Se todas as tentativas falharam
      if (!uploadedUrl && lastError) {
        throw lastError;
      }
    } catch (err) {
      console.error("Upload failed after retries:", err);

      // Tentar limpar o arquivo se foi parcialmente uploadado
      if (uploadedUrl) {
        await deleteImageFromStorage(uploadedUrl);
      }

      toast({
        title: "Erro ao enviar imagem",
        description:
          err instanceof Error
            ? err.message
            : "Falha após múltiplas tentativas. Verifique sua conexão.",
        variant: "destructive",
      });
    } finally {
      setUploadingFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(fileKey);
        return newSet;
      });
      setIsUploading(false);
    }
  };

  const handleAddVideoUrl = () => {
    if (!videoInputValue.trim()) {
      toast({
        title: "URL vazia",
        description: "Insira a URL do vídeo",
        variant: "destructive",
      });
      return;
    }

    // Validar URL básica
    try {
      new URL(videoInputValue);
    } catch {
      toast({
        title: "URL inválida",
        description: "Insira uma URL válida",
        variant: "destructive",
      });
      return;
    }

    setVideo(videoInputValue);
    onVideoUrl(videoInputValue);
    toast({ title: "Vídeo adicionado com sucesso!" });
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesUrls(newImages);
    // Nota: Arquivo não é deletado do storage aqui
    // Será deletado apenas quando o produto for deletado completamente
  };

  const removeVideo = () => {
    setVideo("");
    setVideoInputValue("");
    onVideoUrl("");
  };

  return (
    <div className="space-y-4">
      {/* Imagens */}
      <div>
        <label className="text-sm font-medium mb-2 block">Imagens do Produto ({images.length}/{MAX_IMAGES})</label>

        <input
          type="file"
          ref={imageInputRef}
          onChange={(e) => e.target.files?.[0] && uploadImage(e.target.files[0])}
          accept="image/*"
          className="hidden"
          disabled={isUploading || images.length >= MAX_IMAGES}
        />

        <Button
          type="button"
          variant="outline"
          onClick={() => imageInputRef.current?.click()}
          disabled={isUploading || images.length >= MAX_IMAGES}
          className="w-full"
        >
          {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {!isUploading && <ImageIcon className="mr-2 h-4 w-4" />}
          {isUploading ? "Enviando..." : images.length >= MAX_IMAGES ? "Máximo atingido" : "Adicionar imagem"}
        </Button>

        {uploadingFiles.size > 0 && (
          <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
            <AlertCircle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              Enviando {uploadingFiles.size} imagem(ns)... Tentativas automáticas em caso de falha.
            </p>
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden border">
                <img src={url} alt={`Preview ${i + 1}`} className="w-full h-24 object-cover" />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 p-1 bg-destructive rounded-full text-destructive-foreground hover:opacity-80"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
          <p className="text-xs font-semibold text-blue-900 mb-2">💡 Dica: Tamanho ideal de imagem</p>
          <ul className="text-xs text-blue-800 space-y-1">
            <li>• <strong>Quadrados (1:1):</strong> 800x800px - 1200x1200px</li>
            <li>• <strong>Retratos (9:16):</strong> 600x1000px - 900x1600px (RECOMENDADO)</li>
            <li>• <strong>Paisagens (16:9):</strong> 1200x675px - 1600x900px</li>
            <li>• <strong>Geral:</strong> Mínimo 600px de largura para boa qualidade</li>
            <li>• Comprimir para reduzir tamanho antes de enviar</li>
            <li>• <strong>Após upload:</strong> Marque a imagem principal no formulário do produto</li>
          </ul>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          Máximo 5 imagens • 5MB cada • PNG, JPG ou WebP
        </p>
      </div>

      {/* Vídeo por URL */}
      <div>
        <label className="text-sm font-medium mb-2 block">Vídeo do Produto (Opcional)</label>

        {!video ? (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                placeholder="Cole a URL do vídeo (YouTube, Vimeo, etc)"
                value={videoInputValue}
                onChange={(e) => setVideoInputValue(e.target.value)}
                type="url"
                disabled={isUploading}
              />
              <Button
                type="button"
                variant="default"
                onClick={handleAddVideoUrl}
                disabled={isUploading || !videoInputValue.trim()}
              >
                <Video className="mr-2 h-4 w-4" />
                Adicionar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Cole a URL do vídeo do YouTube, Vimeo, TikTok ou outra plataforma
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative rounded-lg overflow-hidden border bg-black">
              <iframe
                src={video}
                title="Product video"
                className="w-full h-64"
                allowFullScreen
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              />
              <button
                onClick={removeVideo}
                className="absolute top-2 right-2 p-1 bg-destructive rounded-full text-destructive-foreground hover:opacity-80 z-10"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              URL: {video}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
