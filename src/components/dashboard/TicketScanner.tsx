import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CheckCircle2, XCircle, Loader2, ScanLine, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

type ScanResult =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "valid"; ticket: any }
  | { state: "invalid"; reason: string };

const REGION_ID = "fan360-qr-region";

export function TicketScanner() {
  const { user } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScanResult>({ state: "idle" });

  const stopScanner = async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      if (s.isScanning) await s.stop();
      await s.clear();
    } catch {
      /* ignore */
    }
    scannerRef.current = null;
    setScanning(false);
  };

  const verifyTicket = async (code: string) => {
    if (!user) return;
    setResult({ state: "checking" });
    const { data, error } = await supabase
      .from("tickets")
      .select("id, reference, tribune, row_number, seat, status, event:events(teams, starts_at, venue)")
      .eq("user_id", user.id)
      .eq("qr_code", code)
      .maybeSingle();

    if (error || !data) {
      setResult({ state: "invalid", reason: "Billet introuvable dans votre compte." });
      return;
    }
    if (data.status !== "valid") {
      setResult({ state: "invalid", reason: `Billet ${data.status}.` });
      return;
    }
    setResult({ state: "valid", ticket: data });
  };

  const startScanner = async () => {
    setError(null);
    setResult({ state: "idle" });
    try {
      const scanner = new Html5Qrcode(REGION_ID, { verbose: false });
      scannerRef.current = scanner;
      setScanning(true);
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          await stopScanner();
          verifyTicket(decodedText.trim());
        },
        () => {},
      );
    } catch (e: any) {
      setScanning(false);
      scannerRef.current = null;
      setError(
        e?.message?.includes("Permission")
          ? "Accès caméra refusé. Autorisez la caméra dans les paramètres."
          : "Impossible de démarrer la caméra.",
      );
    }
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const reset = async () => {
    await stopScanner();
    setResult({ state: "idle" });
    setError(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="space-y-4"
    >
      <div>
        <h2 className="font-display text-xl font-bold">Scanner un billet</h2>
        <p className="text-xs text-muted-foreground mt-1">
          Pointez la caméra vers votre QR code dynamique pour vérifier sa validité.
        </p>
      </div>

      <div className="glass-card rounded-2xl p-4">
        <div className="relative aspect-square w-full max-w-sm mx-auto overflow-hidden rounded-xl bg-black">
          <div id={REGION_ID} className="absolute inset-0 [&_video]:!w-full [&_video]:!h-full [&_video]:object-cover" />

          {!scanning && result.state === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
              <Camera className="h-12 w-12 mb-3 opacity-60" />
              <p className="text-xs">Caméra inactive</p>
            </div>
          )}

          {scanning && (
            <>
              <div className="pointer-events-none absolute inset-8 rounded-2xl border-2 border-primary/80 shadow-[0_0_30px_hsl(var(--primary)/0.5)]" />
              <motion.div
                aria-hidden
                initial={{ y: "0%" }}
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute left-8 right-8 top-8 h-0.5 bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
              />
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-[11px] font-medium backdrop-blur">
                  <ScanLine className="h-3 w-3 text-primary" /> Recherche d'un QR code…
                </span>
              </div>
            </>
          )}

          <AnimatePresence>
            {result.state === "checking" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur"
              >
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-sm">Vérification…</p>
              </motion.div>
            )}
            {result.state === "valid" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-success/15 backdrop-blur p-4 text-center"
              >
                <CheckCircle2 className="h-14 w-14 text-success mb-2" />
                <p className="font-display text-lg font-bold text-success">Billet valide</p>
                <p className="text-xs text-muted-foreground mt-1">#{result.ticket.reference}</p>
                <p className="text-sm font-medium mt-2">{result.ticket.event?.teams}</p>
                <p className="text-xs text-muted-foreground">
                  {[result.ticket.tribune, result.ticket.row_number && `Rang ${result.ticket.row_number}`, result.ticket.seat && `Siège ${result.ticket.seat}`]
                    .filter(Boolean)
                    .join(" — ")}
                </p>
              </motion.div>
            )}
            {result.state === "invalid" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/15 backdrop-blur p-4 text-center"
              >
                <XCircle className="h-14 w-14 text-destructive mb-2" />
                <p className="font-display text-lg font-bold text-destructive">Billet invalide</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[220px]">{result.reason}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && (
          <p className="mt-3 text-xs text-destructive text-center">{error}</p>
        )}

        <div className="mt-4 flex justify-center gap-2">
          {!scanning && result.state === "idle" && (
            <Button onClick={startScanner} className="gap-2">
              <Camera className="h-4 w-4" /> Démarrer la caméra
            </Button>
          )}
          {scanning && (
            <Button variant="secondary" onClick={stopScanner} className="gap-2">
              Arrêter
            </Button>
          )}
          {(result.state === "valid" || result.state === "invalid") && (
            <Button onClick={reset} variant="secondary" className="gap-2">
              <RotateCcw className="h-4 w-4" /> Scanner à nouveau
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}