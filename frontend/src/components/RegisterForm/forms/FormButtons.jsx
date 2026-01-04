import React from "react";
import { Loader2 } from "lucide-react";

const FormButtons = ({ handleSubmit, isSubmitting, submitted }) => {
  return (
    <div className="mt-6">
      <button
        onClick={handleSubmit}
        disabled={isSubmitting || submitted}
        className={`w-full py-3 font-medium rounded-lg transition duration-200 flex items-center justify-center ${
          isSubmitting || submitted
            ? "bg-blue-400 cursor-not-allowed"
            : "bg-blue-600 hover:bg-blue-700"
        } text-white`}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            Processing...
          </>
        ) : submitted ? (
          "Submitted ✓"
        ) : (
          "Register for Event"
        )}
      </button>
      <p className="text-gray-500 text-xs text-center mt-3">
        By registering, you agree to our terms and conditions.
      </p>
    </div>
  );
};

export default FormButtons;