"use client";

import { useState, useEffect } from "react";
import { requestBillAndPay, getTableBill, payGuestShare } from "@/actions/comensal";
import { CreditCard, Banknote, ArrowRightLeft } from "lucide-react";

interface BillItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface GuestBill {
  sessionId: string;
  guestName: string;
  items: BillItem[];
  subtotal: number;
}

type PaymentMethod = "CASH" | "CARD" | "TRANSFER" | "OTHER";
type SplitMode = "FULL" | "EQUAL";
type WaiterPaymentMode = "TABLE" | "GUEST";

export default function WaiterPayment({
  tableCode,
  onPaymentComplete,
}: {
  tableCode: string;
  onPaymentComplete: () => void;
}) {
  const [billItems, setBillItems] = useState<BillItem[]>([]);
  const [guestBills, setGuestBills] = useState<GuestBill[]>([]);
  const [billTotal, setBillTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Payment form state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  const [splitMode, setSplitMode] = useState<SplitMode>("FULL");
  const [splitCount, setSplitCount] = useState(1);
  const [tipPercentage, setTipPercentage] = useState(0);
  const [paymentMode, setPaymentMode] = useState<WaiterPaymentMode>("TABLE");
  const [selectedGuest, setSelectedGuest] = useState<string>("");

  const loadBill = async () => {
    try {
      setLoading(true);
      const bill = await getTableBill(tableCode);
      const multiGuest = bill.guests.length > 1;
      const items: BillItem[] = bill.guests.flatMap((g) =>
        g.items.map((i) => ({
          id: i.key,
          name: multiGuest ? `${i.name} (${g.guestName})` : i.name,
          qty: i.qty,
          price: i.price,
        }))
      );

      setBillItems(items);
      setBillTotal(bill.total);
      setGuestBills(
        bill.guests.map((g) => ({
          sessionId: g.sessionId,
          guestName: g.guestName,
          items: g.items,
          subtotal: g.subtotal,
        }))
      );

      if (!selectedGuest && bill.guests.length > 0) {
        setSelectedGuest(bill.guests[0].guestName);
      } else if (selectedGuest && !bill.guests.some((g) => g.guestName === selectedGuest)) {
        setSelectedGuest(bill.guests[0]?.guestName ?? "");
      }
    } catch (error) {
      console.error("Error loading bill:", error);
      alert("Error cargando la cuenta");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBill();
  }, [tableCode]);

  const calculateTip = () => {
    return Math.round((billTotal * tipPercentage) / 100);
  };

  const calculateTotal = () => {
    if (splitMode === "EQUAL") {
      const individualTotal = (billTotal + calculateTip()) / splitCount;
      return Math.ceil(individualTotal);
    }
    return billTotal + calculateTip();
  };

  const selectedGuestData = guestBills.find((g) => g.guestName === selectedGuest) ?? null;
  const selectedGuestSubtotal = selectedGuestData?.subtotal ?? 0;
  const selectedGuestTip = Math.round((selectedGuestSubtotal * tipPercentage) / 100);
  const selectedGuestTotal = selectedGuestSubtotal + selectedGuestTip;

  const handleTablePayment = async () => {
    try {
      setSubmitting(true);
      const tip = calculateTip();
      const total = calculateTotal();

      await requestBillAndPay({
        tableCode,
        splitMode,
        splitCount,
        tipRate: tipPercentage,
        tipAmount: tip,
        totalAmount: splitMode === "EQUAL" ? (billTotal + tip) : total,
        amountPaid: total,
        paymentMethod,
      });

      onPaymentComplete();
    } catch (error) {
      alert("Error procesando pago: " + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuestPayment = async () => {
    if (!selectedGuestData) {
      alert("Selecciona un comensal");
      return;
    }

    try {
      setSubmitting(true);
      await payGuestShare({
        tableCode,
        guestName: selectedGuestData.guestName,
        amountPaid: selectedGuestTotal,
        tipRate: tipPercentage,
        paymentMethod,
      });

      await loadBill();
      alert(`Pago registrado para ${selectedGuestData.guestName}`);
    } catch (error) {
      alert("Error procesando pago parcial: " + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8 text-dim">Cargando cuenta...</div>;
  }

  const tip = calculateTip();
  const total = calculateTotal();

  return (
    <div className="space-y-4">
      {/* Bill Items */}
      <div className="border border-wire/50 rounded-lg bg-canvas/50 p-4 space-y-2 max-h-64 overflow-y-auto">
        {billItems.length === 0 ? (
          <p className="text-sm text-dim text-center py-4">Sin items en la cuenta</p>
        ) : (
          <>
            {billItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <div>
                  <p className="text-light">{item.qty}x {item.name}</p>
                </div>
                <p className="text-light font-mono">${(item.price * item.qty).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t border-wire/30 pt-2 mt-2">
              <div className="flex justify-between">
                <span className="text-light font-semibold">Subtotal:</span>
                <span className="text-light font-mono">${billTotal.toFixed(2)}</span>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-light uppercase tracking-wider">Tipo de Cobro</label>
        <div className="flex gap-2">
          <button
            onClick={() => setPaymentMode("TABLE")}
            className={`flex-1 p-2 rounded border text-sm font-bold transition-all ${
              paymentMode === "TABLE"
                ? "border-glow bg-glow/10 text-glow"
                : "border-wire text-light hover:border-glow/50"
            }`}
          >
            Mesa Completa
          </button>
          <button
            onClick={() => setPaymentMode("GUEST")}
            className={`flex-1 p-2 rounded border text-sm font-bold transition-all ${
              paymentMode === "GUEST"
                ? "border-glow bg-glow/10 text-glow"
                : "border-wire text-light hover:border-glow/50"
            }`}
            disabled={guestBills.length === 0}
          >
            Por Comensal
          </button>
        </div>
      </div>

      {/* Payment Method */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-light uppercase tracking-wider">Método de Pago</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => setPaymentMethod("CARD")}
            className={`p-3 rounded border transition-all ${
              paymentMethod === "CARD"
                ? "border-glow bg-glow/10 text-glow"
                : "border-wire text-light hover:border-glow/50"
            }`}
          >
            <CreditCard className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs font-bold">Tarjeta</span>
          </button>
          <button
            onClick={() => setPaymentMethod("CASH")}
            className={`p-3 rounded border transition-all ${
              paymentMethod === "CASH"
                ? "border-glow bg-glow/10 text-glow"
                : "border-wire text-light hover:border-glow/50"
            }`}
          >
            <Banknote className="h-5 w-5 mx-auto mb-1" />
            <span className="text-xs font-bold">Efectivo</span>
          </button>
        </div>
      </div>

      {/* Tip Selection */}
      <div className="space-y-2">
        <label className="text-sm font-bold text-light uppercase tracking-wider">Propina</label>
        <div className="grid grid-cols-3 gap-2">
          {[0, 15, 20].map((pct) => (
            <button
              key={pct}
              onClick={() => setTipPercentage(pct)}
              className={`p-2 rounded border text-sm font-bold transition-all ${
                tipPercentage === pct
                  ? "border-glow bg-glow/10 text-glow"
                  : "border-wire text-light hover:border-glow/50"
              }`}
            >
              {pct}%
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Otro %"
            value={tipPercentage > 20 ? tipPercentage : ""}
            onChange={(e) => setTipPercentage(Number(e.target.value) || 0)}
            className="flex-1 px-3 py-2 bg-canvas border border-wire/30 rounded text-light text-sm focus:outline-none focus:border-glow/50"
          />
          <span className="px-3 py-2 bg-canvas/50 border border-wire/30 rounded text-glow font-mono">
            ${tip.toFixed(2)}
          </span>
        </div>
      </div>

      {/* Split Mode */}
      {paymentMode === "TABLE" && <div className="space-y-2">
        <label className="text-sm font-bold text-light uppercase tracking-wider">Forma de Pago</label>
        <div className="flex gap-2">
          <button
            onClick={() => setSplitMode("FULL")}
            className={`flex-1 p-2 rounded border text-sm font-bold transition-all ${
              splitMode === "FULL"
                ? "border-glow bg-glow/10 text-glow"
                : "border-wire text-light hover:border-glow/50"
            }`}
          >
            Una Cuenta
          </button>
          <button
            onClick={() => setSplitMode("EQUAL")}
            className={`flex-1 p-2 rounded border text-sm font-bold transition-all flex items-center justify-center gap-1 ${
              splitMode === "EQUAL"
                ? "border-glow bg-glow/10 text-glow"
                : "border-wire text-light hover:border-glow/50"
            }`}
          >
            <ArrowRightLeft className="h-4 w-4" /> Dividir
          </button>
        </div>

        {splitMode === "EQUAL" && (
          <div className="flex gap-2 items-center">
            <label className="text-xs text-dim uppercase tracking-wider flex-1">
              Número de personas:
            </label>
            <div className="flex gap-1">
              <button
                onClick={() => setSplitCount(Math.max(1, splitCount - 1))}
                className="text-dim hover:text-light px-2 py-1"
              >
                −
              </button>
              <span className="w-8 text-center font-mono text-light">{splitCount}</span>
              <button
                onClick={() => setSplitCount(Math.min(20, splitCount + 1))}
                className="text-dim hover:text-light px-2 py-1"
              >
                +
              </button>
            </div>
          </div>
        )}
      </div>}

      {paymentMode === "GUEST" && (
        <div className="space-y-2">
          <label className="text-sm font-bold text-light uppercase tracking-wider">Comensal a Cobrar</label>
          <div className="space-y-2">
            {guestBills.map((guest) => (
              <button
                key={guest.sessionId}
                onClick={() => setSelectedGuest(guest.guestName)}
                className={`w-full flex items-center justify-between rounded border px-3 py-2 text-sm transition-all ${
                  selectedGuest === guest.guestName
                    ? "border-glow bg-glow/10 text-glow"
                    : "border-wire text-light hover:border-glow/50"
                }`}
              >
                <span className="font-semibold">{guest.guestName}</span>
                <span className="font-mono">${guest.subtotal.toFixed(2)}</span>
              </button>
            ))}
            {guestBills.length === 0 && (
              <p className="text-sm text-dim">No hay comensales activos por cobrar.</p>
            )}
          </div>
        </div>
      )}

      {/* Total Summary */}
      <div className="bg-glow/10 border border-glow/30 rounded-lg p-4 space-y-2">
        {paymentMode === "TABLE" ? (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-dim">Subtotal:</span>
              <span className="text-light font-mono">${billTotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dim">Propina ({tipPercentage}%):</span>
              <span className="text-light font-mono">${tip.toFixed(2)}</span>
            </div>
            <div className="border-t border-glow/20 pt-2 flex justify-between">
              <span className="text-light font-bold">
                {splitMode === "EQUAL" ? `Por Persona (${splitCount}):` : "Total:"}
              </span>
              <span className="text-2xl font-mono text-glow">${total.toFixed(2)}</span>
            </div>
          </>
        ) : (
          <>
            <div className="flex justify-between text-sm">
              <span className="text-dim">Comensal:</span>
              <span className="text-light">{selectedGuest || "-"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dim">Subtotal:</span>
              <span className="text-light font-mono">${selectedGuestSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-dim">Propina ({tipPercentage}%):</span>
              <span className="text-light font-mono">${selectedGuestTip.toFixed(2)}</span>
            </div>
            <div className="border-t border-glow/20 pt-2 flex justify-between">
              <span className="text-light font-bold">Total Comensal:</span>
              <span className="text-2xl font-mono text-glow">${selectedGuestTotal.toFixed(2)}</span>
            </div>
          </>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={paymentMode === "TABLE" ? handleTablePayment : handleGuestPayment}
        disabled={
          submitting ||
          (paymentMode === "TABLE" ? billTotal === 0 : !selectedGuestData || selectedGuestSubtotal === 0)
        }
        className="w-full bg-glow hover:bg-glow/90 disabled:opacity-50 disabled:cursor-not-allowed text-canvas px-4 py-3 rounded font-bold uppercase transition-colors"
      >
        {submitting
          ? "Procesando..."
          : paymentMode === "TABLE"
            ? "Confirmar Pago Mesa"
            : "Cobrar Comensal"}
      </button>
    </div>
  );
}
