import { useState, useEffect, useCallback } from "react";

export function useProtocol() {
  const [protocol, setProtocol] = useState<string>("Ładowanie protokołu...");
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    window.api.readProtocol()
      .then(setProtocol)
      .catch(() => setProtocol("# Błąd ładowania"));
  }, []);

  const save = useCallback(async (content: string) => {
    setIsSaving(true);
    try {
      await window.api.saveProtocol(content);
      setProtocol(content); // Ensure local state matches saved state
      setLastSaved(new Date());
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSaving(false);
    }
  }, []);

  return { protocol, setProtocol, save, isSaving, lastSaved };
}
