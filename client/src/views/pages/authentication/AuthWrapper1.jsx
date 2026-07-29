// material-ui
import { styled } from '@mui/material/styles';

import authPatternDark from 'assets/images/auth/auth-pattern-dark.svg';
import authPattern from 'assets/images/auth/auth-pattern.svg';

// ==============================|| AUTHENTICATION 1 WRAPPER ||============================== //

const AuthWrapper1 = styled('div')(({ theme }) => ({
  position: 'relative',
  isolation: 'isolate',
  overflow: 'hidden',
  backgroundColor: theme.vars.palette.grey[100],
  backgroundImage: `linear-gradient(rgba(238, 242, 246, 0.86), rgba(238, 242, 246, 0.94)), url(${
    theme.palette.mode === 'dark' ? authPatternDark : authPattern
  })`,
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
  minHeight: '100vh',
  '& > :not(.auth-grid)': {
    position: 'relative',
    zIndex: 1
  }
}));

export default AuthWrapper1;
