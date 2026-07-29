import { memo, useMemo, useState } from 'react';

import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// project imports
import NavGroup from './NavGroup';
import { useGetMenuMaster } from 'api/menu';
import { useAuth } from 'contexts/AuthContext';
import menuItems from 'menu-items';

// ==============================|| SIDEBAR MENU LIST ||============================== //

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const { isAdmin } = useAuth();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;

  const [selectedID, setSelectedID] = useState('');

  const menuList = useMemo(
    () =>
      menuItems.items.map((group) => ({
        ...group,
        children: group.children?.filter((item) => item.id !== 'users' || isAdmin)
      })),
    [isAdmin]
  );

  const navItems = menuList.map((item) => {
    switch (item.type) {
      case 'group':
        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" align="center" sx={{ color: 'error.main' }}>
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
