import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ResponsiveAppBar from './components/layout/ResponsiveAppBar';
import ContactsPage from './pages/ContactsPage';
import PolicyGroupsPage from './pages/PolicyGroupsPage';
import MessagesLogPage from './pages/MessagesLogPage';
import LoginPage from './pages/LoginPage'; // Make sure to import your LoginPage component
import { useUserContext } from './components/UserContext';
import NotFoundPage from './pages/NotFoundPage';
import { LinearProgress } from '@mui/material';
import AccountsPage from './pages/AccountsPage';
import { fetchWithoutAuth } from './utilities/apiUtils';
import MaintenanceEventsPage from './pages/MaintenancePage';
import ManualAlertsPage from './pages/ManualAlertsPage';

function App() {
  const { user, setUser } = useUserContext();
  const [isLoading, setIsLoading] = useState(true);
  const [lastActivityTime, setLastActivityTime] = useState(Date.now());

  const handleActivity = () => {
    setLastActivityTime(Date.now());
  };

  
  const autoLogin = async (token: string) => {
      try {
        const response = await fetchWithoutAuth(`/account/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ token }),
        });

        if (response.ok) {
          const data = await response.json();
          localStorage.setItem('token', data.token);
          setUser({
            id: data.id,
            username: data.username,
            email: data.email,
            role: data.role
          })
          setIsLoading(false);
        } else {
          setIsLoading(false);
          localStorage.removeItem('token');
        }
      } catch (error) {
        setIsLoading(false);
      }
  };



  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      autoLogin(token);
    } else {
      setUser(null);
      setIsLoading(false);
    }

    // Attach the activity event listener
    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);

    return () => {
      // Remove the activity event listener when the component unmounts
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
    };
  }, []);

  useEffect(() => {
    const duration = 15 * 60 * 1000; // 15 minutes in milliseconds
    const currentTime = Date.now();
    if (user && currentTime - lastActivityTime > duration) {
      // User has been inactive for more than 15 minutes, log out and refresh
      localStorage.removeItem('token');
      window.location.reload();
    }
  }, [user, lastActivityTime]);

  return (
    <div>
      <BrowserRouter>
        {isLoading ? (
          <LinearProgress /> // Material-UI LinearProgress for loading
        ) : (
          <Routes>
            {user ? (
              <Route path='/' element={<ResponsiveAppBar />}>
                <Route path='/contacts' element={<ContactsPage />} />
                <Route path='/policy-groups' element={<PolicyGroupsPage />} />
                <Route path='/maintenance' element={<MaintenanceEventsPage />} />
                <Route path='/messages-log' element={<MessagesLogPage />} />
                {user.role === 'admin' && <Route path='/manual-notifications' element={<ManualAlertsPage />} />}
                {user.role === 'admin' && <Route path='/accounts' element={<AccountsPage />} />}
                <Route path='/' element={<Navigate to='/contacts' />} />
                <Route path='*' element={<NotFoundPage />} />
              </Route>
            ) : (
              <Route path='*' element={<LoginPage />} />
            )}
          </Routes>
        )}
      </BrowserRouter>
      
    </div>
  );
}

export default App;
