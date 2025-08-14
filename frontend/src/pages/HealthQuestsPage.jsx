import React, { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { getQuests, acceptQuest, logQuestProgress } from '../api';
import QuestCard from '../components/QuestCard';

const HealthQuestsPage = () => {
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchQuests = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await getQuests();
      setQuests(data.data || []);
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error("Could not fetch quests.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchQuests();
  }, [fetchQuests]);

  const handleAcceptQuest = async (questId) => {
    try {
      await acceptQuest(questId);
      toast.success('Quest accepted! Good luck!');
      fetchQuests(); // Refresh the quest list
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to accept quest.');
    }
  };

  const handleLogProgress = async (userQuestId) => {
    try {
      await logQuestProgress(userQuestId);
      toast.success('Progress logged for today!');
      fetchQuests(); // Refresh the quest list
    } catch (error) {
      toast.error(error.response?.data?.msg || 'Failed to log progress.');
    }
  };

  return (
    <div className="bg-primary-dark min-h-screen text-white">
      <div className="container mx-auto p-8">
        <h1 className="text-4xl font-bold mb-2">Health Quests</h1>
        <p className="text-secondary-text mb-8">Complete quests to earn points and build healthy habits!</p>

        {loading ? (
          <p>Loading quests...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quests.length > 0 ? (
              quests.map(quest => (
                <QuestCard
                  key={quest._id}
                  quest={quest}
                  onAccept={handleAcceptQuest}
                  onLogProgress={handleLogProgress}
                />
              ))
            ) : (
              <p>No quests available at the moment. Check back soon!</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default HealthQuestsPage;
