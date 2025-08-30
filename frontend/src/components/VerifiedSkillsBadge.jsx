import React from "react";

const VerifiedSkillsBadge = ({ skills }) => {
  if (!skills || skills.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {skills.map((skill, idx) => (
        <span key={idx} className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-semibold shadow">
          {skill}
        </span>
      ))}
    </div>
  );
};

export default VerifiedSkillsBadge;