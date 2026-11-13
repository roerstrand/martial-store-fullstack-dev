import React, { useState } from "react";

function useInput(initialValue = "") {
  const [value, setValue] = useState(initialValue);

  const onChange = (e) => setValue(e.target.value);

  return {
    value,
    onChange,
    reset: () => setValue(initialValue),
    inputProps: { value, onChange },
  };

//   Value (useState) lagrar värdet
//   Onchange som uppdaterar värdet när användaren skriver
//   Reset återställer till start värdet
}

export default useInput;
