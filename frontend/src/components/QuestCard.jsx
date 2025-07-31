import React from 'react';

const QuestCard = ({ quest, onAccept, onLogProgress }) => {
  const { title, description, points, durationDays, status, progress, userQuestId } = quest;

  const progressPercentage = durationDays > 0 ? (progress / durationDays) * 100 : 0;

  return (
    <div className="bg-secondary-dark p-6 rounded-lg shadow-lg flex flex-col justify-between">
      <div>
        <h3 className="text-2xl font-bold text-white mb-2">{title}</h3>
        <p className="text-secondary-text mb-4">{description}</p>
        <p className="text-accent-blue font-bold mb-4">{points} Points</p>
      </div>
      <div>
        {status === 'in-progress' && (
          <div className="mb-4">
            <div className="flex justify-between text-sm text-secondary-text mb-1">
              <span>Progress</span>
              <span>{progress} / {durationDays} days</span>
            </div>
            <div className="w-full bg-primary-dark rounded-full h-2.5">
              <div className="bg-accent-blue h-2.5 rounded-full" style={{ width: `${progressPercentage}%` }}></div>
            </div>
          </div>
        )}
        {status === 'not-started' && (
          <button
            onClick={() => onAccept(quest._id)}
            className="w-full bg-accent-blue hover:bg-accent-blue-hover text-white font-bold py-2 px-4 rounded"
          >
            Accept Quest
          </button>
        )}
        {status === 'in-progress' && (
          <button
            onClick={() => onLogProgress(userQuestId)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
          >
            Log Today's Progress
          </button>
        )}
        {status === 'completed' && (
          <div className="text-center font-bold text-green-400">
            Quest Completed!
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestCard;
