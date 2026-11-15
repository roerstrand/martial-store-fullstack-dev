import { useState } from "react";
import PaymentDialog, { PaymentSteps } from "./PaymentDialog";
import { makePayHandler } from "./payHandler";

function CardModal({ total, onConfirm, onClose }) {
  const [step, setStep] = useState("review");
  const handlePay = makePayHandler(onConfirm, setStep);

  return (
    <PaymentDialog logo="/icons/Card payments.png" logoAlt="Card" variant="card" busy={step === "processing"} onClose={onClose}>
      <PaymentSteps
        step={step}
        method="by card"
        total={total}
        onPay={handlePay}
        onRetry={() => setStep("review")}
        secureNote="Secured by Stripe · Demo mode"
      />
    </PaymentDialog>
  );
}

export default CardModal;
