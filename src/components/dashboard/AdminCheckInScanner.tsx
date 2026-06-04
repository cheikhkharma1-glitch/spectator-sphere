import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion, AnimatePresence } from "framer-motion";
import {
  Camera, CheckCircle2, XCircle, Loader2, ScanLine, RotateCcw,
  ShieldCheck, AlertTriangle, Clock, User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

type Ticket = {
  id: string;
  reference: string;
  tribune: string | null;
  row_number: string | null;
  seat: string | null;
  status: string;
  user_id: string;
  checked_in_at: string | null;
  checked_in_by: string | null;
  event: { teams: string; starts_at: string; venue: string } | null;
  holder?: { first_name: string | null; last_name: string | null } | null;
};

type State =
  | { kind: "idle" }
  | { kind: "checking" }
  | { kind: "granted"; ticket: Ticket }
  | { kind: "already_used"; ticket: Ticket }
  | { kind: "denied"; reason: string };

const REGION_ID = "admin-qr-region";

export function AdminCheckInScanner() {
  const { user } = useAuth();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [scanning, setScanning] = useState(false);
  const [state, setState] = useState<State>({ kind: "idle" });
  const [error, setError] = useState<string | null>(null);
  const [count, setCount] = useState(0);

  const stop = async () => {
    const s = scannerRef.current;
    if (!s) return;
    try {
      if (s.isScanning) await s.stop();
      await s.clear();
    } catch { /* ignore */ }
    scannerRef.current = null;
    setScanning(false);
  };

  const verify = async (code: string) => {
    if (!user) return;
    setState({ kind: "checking" });

    const { data, error } = await supabase
      .from("tickets")
      .select("id, reference, tribune, row_number, seat, status, user_id, checked_in_at, checked_in_by, event:events(teams, starts_at, venue)")
      .eq("qr_code", code)
      .maybeSingle() as { data: Ticket | null; error: any };

    if (error || !data) {
      setState({ kind: "denied", reason: "Billet inconnu ou QR invalide." });
      return;
    }
    if (data.status === "cancelled") {
      setState({ kind: "denied", reason: "Billet annulé." });
      return;
    }
    if (data.status === "used" || data.checked_in_at) {
      const holder = await supabase.from("profiles").select("first_name, last_name").eq("id", data.user_id).maybeSingle();
      setState({ kind: "already_used", ticket: { ...data, holder: holder.data } });
      return;
    }

    const { data: updated, error: upErr } = await supabase
      .from("tickets")
      .update({ status: "used", checked_in_at: new Date().toISOString(), checked_in_by: user.id } as any)
      .eq("id", data.id)
      .eq("status", "valid")
      .select("id")
      .maybeSingle();

    if (upErr || !updated) {
      setState({ kind: "denied", reason: "Impossible de valider l'entrée. Réessayez." });
      return;
    }

    setCount((c) => c + 1);
    const holder = await supabase.from("profiles").select("first_name, last_name").eq("id", data.user_id).maybeSingle();
    setState({ kind: "granted", ticket: { ...data, status: "used", checked_in_at: new Date().toISOString(), holder: holder.data } });
    toast.success("Entrée validée", { description: `#${data.reference}` });
  };

  const start = async () => {
    setError(null);
    setState({ kind: "idle" });
    try {
      const s = new Html5Qrcode(REGION_ID, { verbose: false });
      scannerRef.current = s;
      setScanning(true);
      await s.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 260, height: 260 } },
        async (text) => {
          await stop();
          verify(text.trim());
        },
        () => {},
      );
    } catch (e: any) {
      setScanning(false);
      scannerRef.current = null;
      setError(e?.message?.includes("Permission")
        ? "Accès caméra refusé. Autorisez la caméra dans les paramètres."
        : "Impossible de démarrer la caméra.");
    }
  };

  const reset = async () => {
    await stop();
    setState({ kind: "idle" });
    setError(null);
  };

  const scanNext = async () => {
    await reset();
    start();
  };

  useEffect(() => () => { stop(); /* eslint-disable-next-line */ }, []);

  const fullName = (t: Ticket) =>
    [t.holder?.first_name, t.holder?.last_name].filter(Boolean).join(" ") || "Spectateur";

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto space-y-4"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Contrôle à l'entrée
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            Scannez le QR de chaque spectateur. Les billets validés sont automatiquement marqués utilisés.
          </p>
        </div>
        <div className="rounded-full bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5">
          {count} validé{count > 1 ? "s" : ""}
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card p-4">
        <div className="relative aspect-square w-full max-w-md mx-auto overflow-hidden rounded-xl bg-black">
          <div id={REGION_ID} className="absolute inset-0 [&_video]:!w-full [&_video]:!h-full [&_video]:object-cover" />

          {!scanning && state.kind === "idle" && (
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
                animate={{ y: ["0%", "100%", "0%"] }}
                transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
                className="pointer-events-none absolute left-8 right-8 top-8 h-0.5 bg-primary shadow-[0_0_12px_hsl(var(--primary))]"
              />
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-background/70 px-3 py-1 text-[11px] font-medium backdrop-blur">
                  <ScanLine className="h-3 w-3 text-primary" /> Mode contrôle
                </span>
              </div>
            </>
          )}

          <AnimatePresence>
            {state.kind === "checking" && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-background/80 backdrop-blur">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-3" />
                <p className="text-sm">Vérification…</p>
              </motion.div>
            )}
            {state.kind === "granted" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-success/15 backdrop-blur p-5 text-center">
                <CheckCircle2 className="h-16 w-16 text-success mb-2" />
                <p className="font-display text-xl font-bold text-success">Entrée autorisée</p>
                <p className="text-xs text-muted-foreground mt-1">#{state.ticket.reference}</p>
                <p className="text-sm font-semibold mt-2 flex items-center gap-1.5"><User className="h-3.5 w-3.5" />{fullName(state.ticket)}</p>
                <p className="text-xs text-muted-foreground mt-1">{state.ticket.event?.teams}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {[state.ticket.tribune, state.ticket.row_number && `Rang ${state.ticket.row_number}`, state.ticket.seat && `Siège ${state.ticket.seat}`].filter(Boolean).join(" — ")}
                </p>
              </motion.div>
            )}
            {state.kind === "already_used" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-amber-500/15 backdrop-blur p-5 text-center">
                <AlertTriangle className="h-16 w-16 text-amber-500 mb-2" />
                <p className="font-display text-xl font-bold text-amber-500">Déjà utilisé</p>
                <p className="text-xs text-muted-foreground mt-1">#{state.ticket.reference}</p>
                {state.ticket.checked_in_at && (
                  <p className="text-[11px] text-muted-foreground mt-2 flex items-center gap-1.5">
                    <Clock className="h-3 w-3" />
                    Entré le {new Date(state.ticket.checked_in_at).toLocaleString("fr-FR")}
                  </p>
                )}
              </motion.div>
            )}
            {state.kind === "denied" && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-destructive/15 backdrop-blur p-5 text-center">
                <XCircle className="h-16 w-16 text-destructive mb-2" />
                <p className="font-display text-xl font-bold text-destructive">Refusé</p>
                <p className="text-xs text-muted-foreground mt-1 max-w-[240px]">{state.reason}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {error && <p className="mt-3 text-xs text-destructive text-center">{error}</p>}

        <div className="mt-4 flex justify-center gap-2">
          {!scanning && state.kind === "idle" && (
            <Button onClick={start} className="gap-2">
              <Camera className="h-4 w-4" /> Démarrer le contrôle
            </Button>
          )}
          {scanning && (
            <Button variant="secondary" onClick={stop}>Arrêter</Button>
          )}
          {(state.kind === "granted" || state.kind === "already_used" || state.kind === "denied") && (
            <Button onClick={scanNext} className="gap-2">
              <RotateCcw className="h-4 w-4" /> Spectateur suivant
            </Button>
          )}
        </div>
      </div>
    </motion.section>
  );
}