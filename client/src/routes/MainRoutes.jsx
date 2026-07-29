import { lazy } from "react";
import { Navigate } from "react-router";
import MainLayout from "layout/MainLayout";
import Loadable from "ui-component/Loadable";
import PrivateRoute from "./PrivateRoute";

const OrdersListPage = Loadable(lazy(() => import("views/workshop/pages/OrdersListPage")));
const OrderDetailPage = Loadable(lazy(() => import("views/workshop/pages/OrderDetailPage")));
const NewOrderPage = Loadable(lazy(() => import("views/workshop/pages/NewOrderPage")));
const UsersPage = Loadable(lazy(() => import("views/workshop/pages/UsersPage")));

const MainRoutes = {
  path: "/",
  element: <PrivateRoute />,
  children: [{
    element: <MainLayout />,
    children: [
      { index: true, element: <OrdersListPage /> },
      { path: "orders", element: <Navigate to="/" replace /> },
      { path: "orders/new", element: <NewOrderPage /> },
      { path: "orders/:id", element: <OrderDetailPage /> },
      { path: "security/users", element: <UsersPage /> }
    ]
  }]
};

export default MainRoutes;
