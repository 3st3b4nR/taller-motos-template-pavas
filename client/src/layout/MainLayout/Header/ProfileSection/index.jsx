import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';
import { useAuth } from 'contexts/AuthContext';
import { AccountSettings } from 'views/security/users/components/AccountSettings';

import userAvatar from 'assets/images/users/user-round.svg';
import { IconChevronDown, IconLogout, IconSettings } from '@tabler/icons-react';

// ==============================|| PROFILE MENU ||============================== //

export default function ProfileSection() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    state: { borderRadius }
  } = useConfig();

  const [open, setOpen] = useState(false);
  const [accountVisible, setAccountVisible] = useState(false);
  const anchorRef = useRef(null);

  const displayName = user?.name || user?.fullName || user?.email || 'Administrador';
  const displayRole = user?.role || 'ADMIN';

  const handleToggle = () => setOpen((previous) => !previous);

  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      navigate('/pages/login', { replace: true });
    }
  };

  const previousOpen = useRef(open);
  useEffect(() => {
    if (previousOpen.current && !open) anchorRef.current?.focus();
    previousOpen.current = open;
  }, [open]);

  return (
    <>
      <Stack direction="row" spacing={1} alignItems="center">
        <ButtonBase
          ref={anchorRef}
          aria-controls={open ? 'profile-menu' : undefined}
          aria-haspopup="true"
          aria-expanded={open ? 'true' : undefined}
          onClick={handleToggle}
          sx={{
            borderRadius: 3,
            px: { xs: 0.5, sm: 1 },
            py: 0.5,
            '&:hover': { bgcolor: 'secondary.light' }
          }}
        >
          <Avatar src={userAvatar} alt={displayName} sx={{ width: 42, height: 42, bgcolor: 'secondary.light' }} />
          <Box sx={{ display: { xs: 'none', sm: 'block' }, textAlign: 'left', mx: 1.25, minWidth: 96 }}>
            <Typography variant="subtitle2" noWrap sx={{ maxWidth: 180, color: 'text.primary' }}>
              {displayName}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {displayRole}
            </Typography>
          </Box>
          <IconChevronDown size={18} stroke={1.6} />
        </ButtonBase>

        <IconButton
          color="primary"
          aria-label="Configuración de cuenta"
          onClick={() => setAccountVisible(true)}
          sx={{ bgcolor: 'primary.light', '&:hover': { bgcolor: 'secondary.light' } }}
        >
          <IconSettings size={22} stroke={1.6} />
        </IconButton>
      </Stack>

      <Popper
        placement="bottom-end"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 12] } }]}
        sx={{ zIndex: 1300 }}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                <MainCard border={false} elevation={16} content={false} boxShadow shadow={theme.shadows[16]}>
                  <Box sx={{ p: 2, minWidth: 280 }}>
                    <Box sx={{ px: 1, pb: 1.5 }}>
                      <Typography variant="subtitle1">{displayName}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {user?.email || displayRole}
                      </Typography>
                    </Box>
                    <Divider />
                    <List
                      component="nav"
                      id="profile-menu"
                      sx={{
                        pt: 1,
                        borderRadius: `${borderRadius}px`,
                        '& .MuiListItemButton-root': { mt: 0.5 }
                      }}
                    >
                      <ListItemButton
                        sx={{ borderRadius: `${borderRadius}px` }}
                        onClick={() => {
                          setOpen(false);
                          setAccountVisible(true);
                        }}
                      >
                        <ListItemIcon>
                          <IconSettings stroke={1.5} size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Configuración de cuenta" />
                      </ListItemButton>
                      <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleLogout}>
                        <ListItemIcon>
                          <IconLogout stroke={1.5} size={20} />
                        </ListItemIcon>
                        <ListItemText primary="Cerrar sesión" />
                      </ListItemButton>
                    </List>
                  </Box>
                </MainCard>
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>

      <AccountSettings visible={accountVisible} setVisible={setAccountVisible} />
    </>
  );
}
