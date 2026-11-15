import { useState } from "react";
import PaymentDialog, { PaymentSteps } from "./PaymentDialog";
import { makePayHandler } from "./payHandler";

function SwishModal({ total, onConfirm, onClose }) {
  const [step, setStep] = useState("review");
  const handlePay = makePayHandler(onConfirm, setStep);

  return (
    <PaymentDialog logo="/icons/Swish.png" logoAlt="Swish" variant="swish" busy={step === "processing"} onClose={onClose}>
      <PaymentSteps
        step={step}
        method="with Swish"
        total={total}
        onPay={handlePay}
        onRetry={() => setStep("review")}
        secureNote="Secured by Swish · Demo mode"
      />
    </PaymentDialog>
  );
}

export default SwishModal;
