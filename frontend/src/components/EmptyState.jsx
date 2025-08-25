import React from "react";

export default function EmptyState({ icon: Icon, title, message }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-6">
      {Icon && <Icon className="w-16 h-16 text-gray-400 mb-4" />}
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-gray-500">{message}</p>
    </div>
  );
}
