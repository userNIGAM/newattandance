import React from "react";

const Field = ({ label, icon, error, required = false, children }) => (
  <div className="space-y-2">
    <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
      {icon}
      <span>{label}</span>
      {required && <span className="text-red-500">*</span>}
    </label>

    <div className="relative">
      {children}
      {error && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 text-xs font-bold">!</span>
          </div>
        </div>
      )}
    </div>

    {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
  </div>
);

export default Field;
