import React from "react";
import Field from "./Field";

const AddressInput = ({ name, label, icon = null, formData, handleChange, handleBlur, errors, required = false, disabled = false }) => (
  <Field label={label} icon={icon} error={errors[name]} required={required}>
    <textarea
      name={name}
      rows={3}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      placeholder="Street address, City, Province"
      value={formData[name] || ""}
      onChange={handleChange}
      onBlur={() => handleBlur(name)}
      disabled={disabled}
    />
  </Field>
);

export default AddressInput;
