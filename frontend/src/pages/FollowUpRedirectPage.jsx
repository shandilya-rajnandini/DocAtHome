import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

const FollowUpRedirectPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  useEffect(() => {
    localStorage.clear();
    navigate(`/login?redirect=/doctors/${id}`);
  }, [navigate, id]);

  return <div>Loading...</div>;
};

export default FollowUpRedirectPage;
