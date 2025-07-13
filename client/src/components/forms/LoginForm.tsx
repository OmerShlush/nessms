import  { useState } from 'react';
import { TextField, Button, Paper, Typography, Container } from '@mui/material';
import { useUserContext } from '../UserContext';
import { fetchWithoutAuth } from '../../utilities/apiUtils';

function LoginForm() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { setUser } = useUserContext();

  
  const handleLogin = async () => {
    try {
      const response = await fetchWithoutAuth('/account/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
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
        setError('');
        // You can redirect to the desired page upon successful login
      } else {
        setError('Invalid credentials');
      }
    } catch (error) {
      setError('An error occurred');
    }
  };

  return (
    <Container maxWidth="xs">
      <Paper elevation={3} style={{ padding: '16px', textAlign: 'center' }}>
        <Typography variant="h5">Login</Typography>
        <TextField
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          margin="normal"
          fullWidth
        />
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          margin="normal"
          fullWidth
        />
        <Button variant="contained" color="primary" onClick={handleLogin}>
          Login
        </Button>
        {error && <Typography color="error" style={{ marginTop: '16px' }}>{error}</Typography>}
      </Paper>
    </Container>
  );
}

export default LoginForm;
