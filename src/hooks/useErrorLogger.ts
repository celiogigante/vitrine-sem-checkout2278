import { useEffect } from "react";
import { supabase } from "@/lib/supabase";

export interface ErrorLog {
  id?: string;
  error_type: "javascript" | "network" | "unhandled_rejection" | "custom";
  message: string;
  stack?: string;
  url: string;
  timestamp?: string;
  user_agent?: string;
  severity: "low" | "medium" | "high" | "critical";
  context?: Record<string, any>;
}

// Log erro no banco (não interfere com app)
const logErrorToDatabase = async (errorLog: ErrorLog): Promise<void> => {
  try {
    // Timeout para não bloquear
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Log timeout")), 2000)
    );

    const insertPromise = supabase.from("error_logs").insert([
      {
        error_type: errorLog.error_type,
        message: errorLog.message,
        stack: errorLog.stack,
        url: errorLog.url,
        user_agent: navigator.userAgent,
        severity: errorLog.severity,
        context: errorLog.context,
      },
    ]);

    await Promise.race([insertPromise, timeoutPromise]);
  } catch (error) {
    // Silenciosamente falha - nunca afetar a aplicação
    console.debug("Error logging failed (não afeta app):", error);
  }
};

export const useErrorLogger = () => {
  useEffect(() => {
    // Capturar JavaScript errors
    const handleError = (event: ErrorEvent) => {
      logErrorToDatabase({
        error_type: "javascript",
        message: event.message,
        stack: event.error?.stack,
        url: window.location.href,
        severity: "high",
      });
    };

    // Capturar unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const message = event.reason?.message || String(event.reason);
      logErrorToDatabase({
        error_type: "unhandled_rejection",
        message: message,
        stack: event.reason?.stack,
        url: window.location.href,
        severity: "high",
      });
    };

    // Listeners (nunca removidos durante app lifetime)
    window.addEventListener("error", handleError);
    window.addEventListener("unhandledrejection", handleUnhandledRejection);

    // Cleanup (bom prática, mas não é crítico)
    return () => {
      window.removeEventListener("error", handleError);
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
    };
  }, []);

  // Função manual para logs customizados
  return {
    logCustomError: async (
      message: string,
      severity: "low" | "medium" | "high" | "critical" = "medium",
      context?: Record<string, any>
    ) => {
      await logErrorToDatabase({
        error_type: "custom",
        message,
        url: window.location.href,
        severity,
        context,
      });
    },
  };
};
