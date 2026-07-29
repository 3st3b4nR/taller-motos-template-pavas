import { lazy } from "react";
import Loadable from "ui-component/Loadable";
import MinimalLayout from "layout/MinimalLayout";

const LoginPage = Loadable(lazy(() => import("views/pages/authentication/Login")));

const AuthenticationRoutes = {
  path: "/",
  element: <MinimalLayout />,
  children: [{ path: "pages/login", element: <LoginPage /> }]
};

export default AuthenticationRoutes;
