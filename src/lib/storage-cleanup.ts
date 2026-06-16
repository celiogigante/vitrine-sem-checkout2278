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
    // Listar recursivamente todos os arquivos no bucket
    const allFiles: string[] = [];

    const listFilesRecursive = async (path: string): Promise<void> => {
      const { data: files, error } = await supabase.storage
        .from("products")
        .list(path, { limit: 1000 });

      if (error) {
        console.warn(`Failed to list path ${path}:`, error);
        return;
      }

      if (!files) return;

      for (const file of files) {
        if (file.id === null) {
          // É uma pasta (id é null)
          await listFilesRecursive(`${path}${path ? "/" : ""}${file.name}`);
        } else {
          // É um arquivo
          allFiles.push(`${path}${path ? "/" : ""}${file.name}`);
        }
      }
    };

    // Começar listagem do raiz
    await listFilesRecursive("");

    if (allFiles.length === 0) {
      console.log("No files found in storage");
      return 0;
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
    allFiles.forEach((filePath) => {
      if (!referencedPaths.has(filePath)) {
        orphanedPaths.push(filePath);
      }
    });

    console.log(`Found ${allFiles.length} total files, ${referencedPaths.size} referenced, ${orphanedPaths.length} orphaned`);

    // Deletar órfãos em lotes de 100
    let deletedCount = 0;
    if (orphanedPaths.length > 0) {
      for (let i = 0; i < orphanedPaths.length; i += 100) {
        const batch = orphanedPaths.slice(i, i + 100);
        await deleteStorageFiles(batch);
        deletedCount += batch.length;
      }
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
