import React from 'react';
import { Container, Typography, Button, CssBaseline } from '@mui/material';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '100px' }}>
        <Typography variant="h2">404</Typography>
        <Typography variant="h4">Page Not Found</Typography>
        <Typography variant="subtitle1">The page you are looking for does not exist.</Typography>
        <Button variant="contained" color="primary" component={Link} to="/" style={{ marginTop: '20px' }}>
          Go Home
        </Button>
      </div>
    </Container>
  );
};

export default NotFoundPage;
