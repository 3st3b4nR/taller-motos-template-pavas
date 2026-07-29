import { RouterProvider } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "views/workshop/workshop.css";
import router from "routes";
import NavigationScroll from "layout/NavigationScroll";
import ThemeCustomization from "themes";
import { AuthProvider } from "contexts/AuthContext";

export default function App() {
  return (
    <ThemeCustomization>
      <AuthProvider>
        <NavigationScroll>
          <RouterProvider router={router} />
          <ToastContainer position="top-right" autoClose={3000} theme="light" />
        </NavigationScroll>
      </AuthProvider>
    </ThemeCustomization>
  );
}
