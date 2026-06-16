import { supabase } from "./supabase";

interface FileMetadata {
  path: string;
  uploadedAt: string;
  size: number;
}

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

// Deletar arquivo individual
export const deleteStorageFile = async (filePath: string): Promise<void> => {
  try {
    await supabase.storage.from("products").remove([filePath]);
  } catch (error) {
    console.error("Failed to delete storage file:", filePath, error);
    throw error;
  }
};

// Deletar múltiplos arquivos
export const deleteStorageFiles = async (filePaths: string[]): Promise<void> => {
  if (filePaths.length === 0) return;

  try {
    await supabase.storage.from("products").remove(filePaths);
  } catch (error) {
    console.error("Failed to delete storage files:", error);
    throw error;
  }
};

// Limpar imagens órfãs (não referenciadas em nenhum produto)
export const cleanupOrphanedImages = async (): Promise<number> => {
  try {
    // Listar todos os arquivos no bucket
    const { data: allFiles, error: listError } = await supabase.storage
      .from("products")
      .list("", { limit: 1000, offset: 0 });

    if (listError || !allFiles) {
      throw listError || new Error("Failed to list files");
    }

    // Buscar todas as URLs de imagens referenciadas
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("images");

    if (productsError) throw productsError;

    const { data: heroConfig, error: heroError } = await supabase
      .from("hero_config")
      .select("hero_image_url, hero_logo_url");

    if (heroError) throw heroError;

    // Coletar todos os caminhos referenciados
    const referencedPaths = new Set<string>();

    if (products && Array.isArray(products)) {
      products.forEach((product: any) => {
        if (Array.isArray(product.images)) {
          product.images.forEach((url: string) => {
            const path = extractFilePathFromUrl(url);
            if (path) referencedPaths.add(path);
          });
        }
      });
    }

    if (heroConfig && Array.isArray(heroConfig)) {
      heroConfig.forEach((config: any) => {
        [config.hero_image_url, config.hero_logo_url].forEach((url: string) => {
          if (url) {
            const path = extractFilePathFromUrl(url);
            if (path) referencedPaths.add(path);
          }
        });
      });
    }

    // Encontrar arquivos órfãos
    const orphanedPaths: string[] = [];
    allFiles.forEach((file) => {
      const fullPath = file.name;
      if (!referencedPaths.has(fullPath)) {
        orphanedPaths.push(fullPath);
      }
    });

    // Deletar órfãos em lotes de 100
    let deletedCount = 0;
    for (let i = 0; i < orphanedPaths.length; i += 100) {
      const batch = orphanedPaths.slice(i, i + 100);
      await deleteStorageFiles(batch);
      deletedCount += batch.length;
    }

    console.log(`Cleanup completed: ${deletedCount} orphaned files deleted`);
    return deletedCount;
  } catch (error) {
    console.error("Cleanup operation failed:", error);
    throw error;
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
