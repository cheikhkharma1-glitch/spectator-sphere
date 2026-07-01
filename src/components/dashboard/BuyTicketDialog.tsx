import { useEffect, useState } from "react";
import { Calendar, Clock, MapPin, Ticket, CheckCircle2, CreditCard, Minus, Plus, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import type { EventRow } from "./ScheduleTab";

type Category = {
  id: string;
  label: string;
  price: number;
  tribune: string;
  description: string;
  accent: string;
};

const CATEGORIES: Category[] = [
  { id: "Populaire", label: "Populaire", price: 1000, tribune: "Nord", description: "Tribune debout, ambiance garantie", accent: "border-primary/40" },
  { id: "Tribune assise", label: "Tribune assise", price: 2500, tribune: "Est", description: "Place numérotée, tribune couverte", accent: "border-accent/40" },
  { id: "VIP", label: "VIP", price: 5000, tribune: "VIP", description: "Tribune d'honneur, accès prioritaire", accent: "border-secondary/40" },
  { id: "Enfant -12 ans", label: "Enfant -12 ans", price: 500, tribune: "Nord", description: "Tarif réduit, enfant accompagné", accent: "border-muted-foreground/40" },
];

const fmt = (n: number) => new Intl.NumberFormat("fr-FR").format(n) + " FCFA";

type Props = {
  event: EventRow | null;
  onClose: () => void;
  onPurchased: () => void;
};

type Purchased = { reference: string; qr_code: string; category: string; price_fcfa: number }[];

export const BuyTicketDialog = ({ event, onClose, onPurchased }: Props) => {
  const { user } = useAuth();
  const [category, setCategory] = useState<Category>(CATEGORIES[0]);
  const [quantity, setQuantity] = useState(1);
  const [step, setStep] = useState<"select" | "pay" | "receipt">("select");
  const [submitting, setSubmitting] = useState(false);
  const [receipt, setReceipt] = useState<Purchased>([]);

  useEffect(() => {
    if (event) { setCategory(CATEGORIES[0]); setQuantity(1); setStep("select"); setReceipt([]); }
  }, [event]);

  if (!event) return null;

  const total = category.price * quantity;

  const pay = async () => {
    if (!user) return;
    setSubmitting(true);
    // Simulation de paiement — 1,2 s de latence pour l'UX
    await new Promise((r) => setTimeout(r, 1200));
    const rows = Array.from({ length: quantity }).map(() => ({
      user_id: user.id,
      event_id: event.id,
      tribune: category.tribune,
      category: category.id,
      price_fcfa: category.price,
    }));
    const { data, error } = await supabase.from("tickets").insert(rows).select("reference, qr_code, category, price_fcfa");
    setSubmitting(false);
    if (error) {
      toast.error("Paiement refusé : " + error.message);
      return;
    }
    toast.success(quantity > 1 ? `${quantity} billets confirmés 🎟️` : "Billet confirmé 🎟️");
    setReceipt((data ?? []) as Purchased);
    setStep("receipt");
    onPurchased();
  };

  const date = new Date(event.starts_at);

  return (
    <Dialog open={!!event} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-primary" />
            {step === "select" && "Choisir votre billet"}
            {step === "pay" && "Paiement"}
            {step === "receipt" && "Reçu d'achat"}
          </DialogTitle>
        </DialogHeader>

        <div className="rounded-lg bg-muted/30 p-4 mb-2">
          <div className="font-display font-semibold">{event.teams}</div>
          <div className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-3">
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{event.venue}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{date.toLocaleDateString("fr-FR")}</span>
            <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
          </div>
        </div>

        {step === "select" && (
          <>
            <div className="grid gap-2 py-2">
              <div className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Catégorie</div>
              {CATEGORIES.map((c) => {
                const active = c.id === category.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setCategory(c)}
                    className={`text-left rounded-lg border px-4 py-3 transition-all ${active ? `bg-primary/10 ${c.accent} ring-2 ring-primary/40` : "border-border hover:border-primary/30"}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold text-sm">{c.label}</div>
                        <div className="text-xs text-muted-foreground">{c.description}</div>
                      </div>
                      <div className="font-display font-bold text-primary">{fmt(c.price)}</div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border px-4 py-3 mt-2">
              <div className="text-sm">
                <div className="font-medium">Nombre de places</div>
                <div className="text-xs text-muted-foreground">Max 6 par transaction</div>
              </div>
              <div className="flex items-center gap-3">
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQuantity((q) => Math.max(1, q - 1))} aria-label="Diminuer">
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="font-display text-lg w-6 text-center">{quantity}</span>
                <Button size="icon" variant="outline" className="h-8 w-8" onClick={() => setQuantity((q) => Math.min(6, q + 1))} aria-label="Augmenter">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between mt-3 px-1">
              <div className="text-sm text-muted-foreground">Total à payer</div>
              <div className="font-display text-2xl font-bold text-gradient">{fmt(total)}</div>
            </div>

            <DialogFooter className="mt-4">
              <Button variant="ghost" onClick={onClose}>Annuler</Button>
              <Button onClick={() => setStep("pay")} className="gap-2 glow-primary">
                <CreditCard className="h-4 w-4" /> Passer au paiement
              </Button>
            </DialogFooter>
          </>
        )}

        {step === "pay" && (
          <div className="py-2">
            <div className="rounded-lg border border-border p-4 mb-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Catégorie</span>
                <span className="font-medium">{category.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Places</span>
                <span className="font-medium">{quantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Prix unitaire</span>
                <span className="font-medium">{fmt(category.price)}</span>
              </div>
              <div className="border-t border-border pt-2 flex justify-between">
                <span className="font-semibold">Total</span>
                <span className="font-display font-bold text-primary">{fmt(total)}</span>
              </div>
            </div>

            <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground mb-4">
              💡 Mode démo : cliquez sur « Payer » pour simuler le paiement Mobile Money / carte.
            </div>

            <DialogFooter>
              <Button variant="ghost" onClick={() => setStep("select")} disabled={submitting}>Retour</Button>
              <Button onClick={pay} disabled={submitting} className="gap-2 glow-primary">
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
                {submitting ? "Paiement en cours…" : `Payer ${fmt(total)}`}
              </Button>
            </DialogFooter>
          </div>
        )}

        {step === "receipt" && (
          <div className="py-2">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="h-12 w-12 rounded-full bg-primary/15 flex items-center justify-center mb-2">
                <CheckCircle2 className="h-7 w-7 text-primary" />
              </div>
              <div className="font-display text-lg font-semibold">Paiement confirmé</div>
              <div className="text-xs text-muted-foreground">Vos billets sont disponibles immédiatement dans l'onglet « Mon billet ».</div>
            </div>

            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-1">
              {receipt.map((t) => (
                <div key={t.reference} className="rounded-lg border border-border p-3 flex items-center gap-3">
                  <div className="bg-white p-1.5 rounded">
                    <QRCodeSVG value={t.qr_code} size={72} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-mono text-xs text-muted-foreground truncate">{t.reference}</div>
                    <div className="font-semibold text-sm">{t.category}</div>
                    <div className="text-xs text-primary">{fmt(t.price_fcfa)}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-lg bg-muted/30 p-3 text-xs text-muted-foreground mt-4">
              📩 Une confirmation par e-mail avec vos QR codes vous est envoyée à l'adresse de votre compte.
            </div>

            <DialogFooter className="mt-4">
              <Button onClick={onClose} className="w-full glow-primary">Voir mes billets</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};