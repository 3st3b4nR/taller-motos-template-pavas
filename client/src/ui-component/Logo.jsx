import Box from '@mui/material/Box';

import logoPavas from 'assets/images/logo-pavas.png';

// ==============================|| PAVAS LOGO ||============================== //

export default function Logo() {
  return (
    <Box
      component="img"
      src={logoPavas}
      alt="PAVAS Stay Connected"
      sx={{
        display: 'block',
        width: { xs: 142, sm: 164 },
        maxWidth: '100%',
        height: 'auto',
        objectFit: 'contain'
      }}
    />
  );
}
