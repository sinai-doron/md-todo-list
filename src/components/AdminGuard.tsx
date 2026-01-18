import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../firebase';
import { useUserProfileStore } from '../stores/userProfileStore';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
`;

const LoadingContent = styled.div`
  text-align: center;
  color: #666;

  .material-symbols-outlined {
    font-size: 48px;
    margin-bottom: 16px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

interface AdminGuardProps {
  children: React.ReactNode;
}

export function AdminGuard({ children }: AdminGuardProps) {
  const { user, loading: authLoading } = useAuth();
  const { profile, isLoading: profileLoading, initializeProfile } = useUserProfileStore();
  const [initialized, setInitialized] = useState(false);

  // Initialize profile when user is authenticated
  useEffect(() => {
    if (user && !initialized) {
      initializeProfile().then(() => setInitialized(true));
    }
  }, [user, initialized, initializeProfile]);

  // Still loading auth or profile
  if (authLoading || profileLoading || (user && !initialized)) {
    return (
      <LoadingContainer>
        <LoadingContent>
          <span className="material-symbols-outlined">hourglass_empty</span>
          <div>Loading...</div>
        </LoadingContent>
      </LoadingContainer>
    );
  }

  // Not logged in
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Not admin
  if (!profile?.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
