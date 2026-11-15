import { useState } from "react";
import PaymentDialog, { PaymentSteps } from "./PaymentDialog";
import { makePayHandler } from "./payHandler";

function KlarnaModal({ total, onConfirm, onClose }) {
  const [step, setStep] = useState("review");
  const [selectedOption, setSelectedOption] = useState("now");
  const handlePay = makePayHandler(onConfirm, setStep);

  const options = [
    { value: "now", name: "Pay now", desc: "Full amount charged today" },
    { value: "30days", name: "Pay in 30 days", desc: "Interest-free, no fees" },
    { value: "installments", name: "3 interest-free payments", desc: `${Math.round(total / 3)} EUR / month` },
  ];

  return (
    <PaymentDialog logo="/icons/Klarna.png" logoAlt="Klarna" busy={step === "processing"} onClose={onClose}>
      <PaymentSteps
        step={step}
        method="with Klarna"
        total={total}
        onPay={handlePay}
        onRetry={() => setStep("review")}
        secureNote="Secured by Klarna · Demo mode"
      >
        <div role="radiogroup" aria-label="Payment plan" className="klarna-modal__options">
            {options.map((o) => (
              <label
                key={o.value}
                className={`klarna-modal__option${selectedOption === o.value ? " klarna-modal__option--active" : ""}`}
              >
                <input
                  type="radio"
                  name="klarna-plan"
                  value={o.value}
                  checked={selectedOption === o.value}
                  onChange={() => setSelectedOption(o.value)}
                  className="ac-visually-hidden"
                />
                <span className="klarna-modal__option-name">{o.name}</span>
                <span className="klarna-modal__option-desc">{o.desc}</span>
              </label>
            ))}
        </div>
      </PaymentSteps>
    </PaymentDialog>
  );
}

export default KlarnaModal;
