// UserContext.tsx
import { createContext, useContext, useState, ReactNode } from 'react';

interface UserDetails {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface UserContextType {
  user: UserDetails | null;
  setUser: (user: UserDetails | null) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUserContext must be used within a UserContextProvider');
  }
  return context;
};

interface UserContextProviderProps {
  children: ReactNode;
}

export const UserContextProvider: React.FC<UserContextProviderProps> = ({ children }) => {
  const [user, setUser] = useState<UserDetails | null>(null);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
