import * as React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import nessmsLogo from '../../assets/nessms.png';
import { useUserContext } from '../UserContext';

const pages = ['Contacts', 'Policy Groups', 'Messages Log'];

function ResponsiveAppBar() {
  const [anchorElNav, setAnchorElNav] = React.useState<null | HTMLElement>(null);
  const { user, setUser } = useUserContext();

  const handleOpenNavMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorElNav(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };


  return (
    <div>
      <AppBar position="fixed" sx={{ width: '100%', zIndex: 1000 }}>
        <Container maxWidth="xl" disableGutters>
          <Toolbar disableGutters>
            <img src={nessmsLogo} alt="NESSMS Logo" style={{ width: '75px', height: '45px', marginRight: '15px' }} />
            <Box sx={{ flexGrow: 1, display: { xs: 'flex', md: 'none' } }}>
              <IconButton
                size="large"
                aria-label="menu"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenNavMenu}
                color="inherit"
              >
                <MenuIcon />
              </IconButton>
              <Menu
                id="menu-appbar"
                anchorEl={anchorElNav}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'left',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'left',
                }}
                open={Boolean(anchorElNav)}
                onClose={handleCloseNavMenu}
                sx={{
                  display: { xs: 'block', md: 'none' },
                }}
              >
                {pages.map((page) => (
                  <MenuItem key={page} onClick={handleCloseNavMenu}>
                    <NavLink
                      to={`/${page.replace(' ', '-').toLowerCase()}`}
                      style={{
                        textDecoration: 'none',
                        color: 'inherit',
                        display: 'block',
                        padding: '10px',
                      }}
                    >
                      {page}
                    </NavLink>
                  </MenuItem>
                ))}
                {user?.role === 'admin' && <MenuItem key={'ManualNotifications'} onClick={handleCloseNavMenu}>
                  <NavLink
                    to={'/manual-notifications'}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      padding: '10px',
                    }}
                  >
                    Manual Notifications
                  </NavLink>
                </MenuItem>}
                {user?.role === 'admin' && <MenuItem key={'Maintenance'} onClick={handleCloseNavMenu}>
                  <NavLink
                    to={'/maintenance'}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      padding: '10px',
                    }}
                  >
                    Maintenance
                  </NavLink>
                </MenuItem>}
                {user?.role === 'admin' && <MenuItem key={'Accounts'} onClick={handleCloseNavMenu}>
                  <NavLink
                    to={'/accounts'}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      padding: '10px',
                    }}
                  >
                    Accounts
                  </NavLink>
                </MenuItem>}
                <MenuItem key={'logout'} onClick={handleCloseNavMenu}>
                  <NavLink
                    onClick={handleLogout}
                    to={'/'}
                    style={{
                      textDecoration: 'none',
                      color: 'inherit',
                      display: 'block',
                      padding: '10px',
                    }}
                  >
                    Logout
                  </NavLink>
                </MenuItem>
              </Menu>
            </Box>
            <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'flex' } }}>
              {pages.map((page) => (
                <Button
                  key={page}
                  component={NavLink} // Use NavLink as the component
                  to={`/${page.replace(' ', '-').toLowerCase()}`}
                  onClick={handleCloseNavMenu}
                  sx={{ color: 'white', textTransform: 'none', margin: '0 10px' }}
                >
                  {page}
                </Button>
              ))}
              {user?.role === 'admin' &&
                <Button
                  key={'ManualNotifications'}
                  component={NavLink} // Use NavLink as the component
                  to={`/manual-notifications`}
                  onClick={handleCloseNavMenu}
                  sx={{ color: 'white', textTransform: 'none', margin: '0 10px' }}
                >
                  Manual Notifications
                </Button>}
              {user?.role === 'admin' &&
                <Button
                  key={'Maintenance'}
                  component={NavLink} // Use NavLink as the component
                  to={`/maintenance`}
                  onClick={handleCloseNavMenu}
                  sx={{ color: 'white', textTransform: 'none', margin: '0 10px' }}
                >
                  Maintenance
                </Button>}
              {user?.role === 'admin' &&
                <Button
                  key={'Accounts'}
                  component={NavLink} // Use NavLink as the component
                  to={`/accounts`}
                  onClick={handleCloseNavMenu}
                  sx={{ color: 'white', textTransform: 'none', margin: '0 10px' }}
                >
                  Accounts
                </Button>}
                <Button
                  onClick={handleLogout}
                  sx={{ color: 'white', textTransform: 'none', margin: '0 10px' }}
                >
                  Logout
                </Button>
              </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <div style={{ paddingTop: '25px', width: '80%', marginLeft: '10%', marginRight: '10%' }}> {/* Adjust the value based on your app bar's height */}
        <Outlet />
      </div>
    </div>
  );
}

export default ResponsiveAppBar;