import { useState } from "react";

function CardModal({ total, onConfirm, onClose }) {
  const [step, setStep] = useState("review");

  const handlePay = () => {
    setStep("processing");
    setTimeout(async () => {
      try {
        const timeout = new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 10000)
        );
        await Promise.race([onConfirm(), timeout]);
      } catch {
        setStep("error");
      }
    }, 1800);
  };

  return (
    <div className="klarna-overlay" onClick={onClose}>
      <div className="klarna-modal klarna-modal--card" onClick={(e) => e.stopPropagation()}>
        <div className="klarna-modal__header">
          <img src="/icons/Card payments.png" alt="Card" className="klarna-modal__logo" />
          <button className="klarna-modal__close" onClick={onClose} disabled={step === "processing"}>✕</button>
        </div>

        {step === "error" ? (
          <div className="klarna-modal__processing">
            <p style={{ color: "#d62839", fontWeight: 600 }}>Payment failed</p>
            <p style={{ fontSize: "0.8rem", color: "#888" }}>Something went wrong. Please try again.</p>
            <button className="klarna-modal__pay-btn" onClick={() => setStep("review")}>Try again</button>
          </div>
        ) : step === "review" ? (
          <>
            <p className="klarna-modal__title">Confirm your payment</p>
            <p className="klarna-modal__sub">You are about to pay by card</p>
            <div className="klarna-modal__amount">
              <span className="klarna-modal__amount-label">Total</span>
              <span className="klarna-modal__amount-value">{total} EUR</span>
            </div>
            <button className="klarna-modal__pay-btn" onClick={handlePay}>
              Pay {total} EUR
            </button>
            <p className="klarna-modal__secure">🔒 Secured by Stripe · Demo mode</p>
          </>
        ) : (
          <div className="klarna-modal__processing">
            <div className="klarna-spinner" />
            <p>Processing payment...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default CardModal;
