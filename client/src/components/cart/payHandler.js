export function makePayHandler(onConfirm, setStep) {
  return () => {
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
}
