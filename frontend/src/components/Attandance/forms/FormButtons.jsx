import React from "react";
import { Loader2, CheckCircle } from "lucide-react";

const FormButtons = ({ handleSubmit, isSubmitting, submitted }) => (
  <button
    type="button"
    onClick={handleSubmit}
    disabled={submitted || isSubmitting}
    className={`w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors ${
      submitted || isSubmitting ? "opacity-50 cursor-not-allowed" : ""
    }`}
  >
    {isSubmitting ? (
      <span className="flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin" />
        Processing...
      </span>
    ) : submitted ? (
      <span className="flex items-center justify-center gap-2">
        <CheckCircle className="w-5 h-5" />
        Registered Successfully
      </span>
    ) : (
      "Register & Get QR Code"
    )}
  </button>
);

export default FormButtons;
