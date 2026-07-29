import Grid from '@mui/material/Grid';

import CardGrid from 'ui-component/cards/CardGrid';
import { gridSpacing } from 'store/constant';

import {
    IconUsers,
    IconShoppingCart,
    IconCurrencyDollar,
    IconPackage,
    IconBox,
    IconReportAnalytics,
} from '@tabler/icons-react';

const testCards = [
    {
        titulo: 'Usuarios',
        icono: <IconUsers size={22} />,
        backgroundColor: '#eef2ff',
        backgroundColorIcon: '#4f46e5',
        contador: 150,
    },
    {
        titulo: 'Ventas',
        icono: <IconShoppingCart size={22} />,
        backgroundColor: '#f0fdf4',
        backgroundColorIcon: '#16a34a',
        contador: 342,
    },
    {
        titulo: 'Ingresos',
        icono: <IconCurrencyDollar size={22} />,
        backgroundColor: '#fffbeb',
        backgroundColorIcon: '#d97706',
        contador: 12500,
    },
    {
        titulo: 'Pedidos',
        icono: <IconPackage size={22} />,
        backgroundColor: '#fef2f2',
        backgroundColorIcon: '#dc2626',
        contador: 89,
    },
    {
        titulo: 'Productos',
        icono: <IconBox size={22} />,
        backgroundColor: '#faf5ff',
        backgroundColorIcon: '#9333ea',
        contador: 210,
    },
    {
        titulo: 'Reportes',
        icono: <IconReportAnalytics size={22} />,
        backgroundColor: '#f0fdfa',
        backgroundColorIcon: '#0d9488',
        contador: 45,
    },
];

export default function Dashboard() {
    return (
        <Grid container spacing={gridSpacing}>
            {testCards.map((card, index) => (
                <Grid key={index} size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
                    <CardGrid {...card} />
                </Grid>
            ))}
        </Grid>
    );
}
