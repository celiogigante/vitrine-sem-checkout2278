import { useState, useEffect } from "react";
import { supabase, Product } from "@/lib/supabase";

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, error: err } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;
      setProducts((data || []) as Product[]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao carregar produtos";
      setError(message);
      console.error("Error loading products:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getFeaturedProducts = () => {
    return products.filter((p) => p.featured).slice(0, 6);
  };

  const getProductById = (id: string) => {
    return products.find((p) => p.id === id);
  };

  return {
    products,
    isLoading,
    error,
    loadProducts,
    getFeaturedProducts,
    getProductById,
  };
};
