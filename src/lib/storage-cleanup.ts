import { supabase } from "./supabase";

// Extrair caminho do arquivo de uma URL pública do Supabase
export const extractFilePathFromUrl = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    const pathMatch = urlObj.pathname.match(/\/storage\/v1\/object\/public\/products\/(.+)$/);
    return pathMatch ? pathMatch[1] : null;
  } catch {
    return null;
  }
};

// Validar se uma URL de imagem está acessível
export const validateImageUrl = async (
  url: string,
  timeout: number = 5000
): Promise<boolean> => {
  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      img.onerror = img.onload = null;
      resolve(false);
    }, timeout);

    img.onload = () => {
      clearTimeout(timer);
      resolve(true);
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };

    img.src = url;
  });
};

// Validar múltiplas URLs em paralelo
export const validateImageUrls = async (
  urls: string[],
  timeout: number = 5000
): Promise<Record<string, boolean>> => {
  const results = await Promise.allSettled(
    urls.map(async (url) => ({
      url,
      isValid: await validateImageUrl(url, timeout),
    }))
  );

  const urlStatus: Record<string, boolean> = {};
  results.forEach((result) => {
    if (result.status === "fulfilled") {
      urlStatus[result.value.url] = result.value.isValid;
    } else {
      urlStatus[Object.keys(result).join("")] = false;
    }
  });

  return urlStatus;
};

// Nota: Cleanup de imagens agora acontece APENAS quando o produto é deletado
// Via deleteProduct() em products.ts
// Nunca deletamos imagens automaticamente quando usuario remove da UI
