import { useEffect, useId, useRef } from "react";

const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

function PaymentDialog({ logo, logoAlt, variant, busy = false, onClose, children }) {
  const titleId = useId();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const opener = document.activeElement;
    const first = dialogRef.current?.querySelector(FOCUSABLE);
    (first ?? dialogRef.current)?.focus();
    return () => {
      if (opener && typeof opener.focus === "function" && document.contains(opener)) opener.focus();
    };
  }, []);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.contains(document.activeElement)) dialog.focus();
  });

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      if (!busy) {
        e.stopPropagation();
        onCloseRef.current?.();
      }
      return;
    }
    if (e.key !== "Tab") return;
    const items = [...dialogRef.current.querySelectorAll(FOCUSABLE)];
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    if (e.shiftKey && (document.activeElement === first || !dialogRef.current.contains(document.activeElement))) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div className="klarna-overlay" onClick={busy ? undefined : onClose}>
      <div
        ref={dialogRef}
        className={`klarna-modal${variant ? ` klarna-modal--${variant}` : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="klarna-modal__header">
          <img src={logo} alt={logoAlt} className="klarna-modal__logo" />
          <button type="button" className="klarna-modal__close" onClick={onClose} disabled={busy} aria-label="Close">
            <span aria-hidden="true">✕</span>
          </button>
        </div>
        <h2 id={titleId} className="klarna-modal__title">Confirm your payment</h2>
        {children}
      </div>
    </div>
  );
}

export function PaymentSteps({ step, method, total, onPay, onRetry, secureNote, children }) {
  if (step === "error") {
    return (
      <div className="klarna-modal__processing" role="alert">
        <p className="klarna-modal__error">Payment failed</p>
        <p className="klarna-modal__error-sub">Something went wrong. Please try again.</p>
        <button type="button" className="klarna-modal__pay-btn" onClick={onRetry}>Try again</button>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="klarna-modal__processing" role="status">
        <div className="klarna-spinner" aria-hidden="true" />
        <p>Processing payment...</p>
      </div>
    );
  }

  return (
    <>
      <p className="klarna-modal__sub">You are about to pay {method}</p>
      <div className="klarna-modal__amount">
        <span className="klarna-modal__amount-label">Total</span>
        <span className="klarna-modal__amount-value">{total} EUR</span>
      </div>
      {children}
      <button type="button" className="klarna-modal__pay-btn" onClick={onPay}>
        Pay {total} EUR
      </button>
      <p className="klarna-modal__secure"><span aria-hidden="true">🔒 </span>{secureNote}</p>
    </>
  );
}

export default PaymentDialog;
