import useMediaQuery from "@mui/material/useMediaQuery";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import AuthWrapper1 from "./AuthWrapper1";
import AuthCardWrapper from "./AuthCardWrapper";
import Logo from "ui-component/Logo";
import AuthLogin from "../auth-forms/AuthLogin";
import gridPattern from "assets/images/auth/img-a2-grid.svg";

export default function Login() {
  const downMD = useMediaQuery((theme) => theme.breakpoints.down("md"));
  const year = new Date().getFullYear();

  return (
    <AuthWrapper1>
      <Box
        component="img"
        src={gridPattern}
        alt=""
        className="auth-grid"
        aria-hidden="true"
        sx={{
          display: { xs: "none", sm: "block" },
          position: "absolute",
          zIndex: 0,
          top: "50%",
          left: { sm: "-320px", lg: "-240px" },
          width: { sm: 650, lg: 772 },
          height: { sm: 580, lg: 691 },
          transform: "translateY(-50%)",
          objectFit: "contain",
          opacity: 0.14,
          pointerEvents: "none"
        }}
      />
      <Box
        component="img"
        src={gridPattern}
        alt=""
        className="auth-grid"
        aria-hidden="true"
        sx={{
          display: { xs: "none", sm: "block" },
          position: "absolute",
          zIndex: 0,
          top: "50%",
          right: { sm: "-320px", lg: "-240px" },
          width: { sm: 650, lg: 772 },
          height: { sm: 580, lg: 691 },
          transform: "translateY(-50%) scaleX(-1)",
          objectFit: "contain",
          opacity: 0.14,
          pointerEvents: "none"
        }}
      />
      <Stack sx={{ minHeight: "100vh" }}>
        <Stack sx={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}>
          <Box sx={{ m: { xs: 1, sm: 3 }, width: { xs: "100%", sm: "auto" } }}>
            <AuthCardWrapper>
              <Stack sx={{ alignItems: "center", gap: 2 }}>
                <Box sx={{ mb: 2 }}><Logo /></Box>
                <Stack sx={{ alignItems: "center", gap: 1 }}>
                  <Typography variant={downMD ? "h3" : "h2"} sx={{ color: "text.primary" }}>
                    Taller de motos
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Control de alistamientos y reparaciones
                  </Typography>
                </Stack>
                <Box sx={{ width: 1 }}><AuthLogin /></Box>
              </Stack>
            </AuthCardWrapper>
          </Box>
        </Stack>
        <Box sx={{ px: 3, pb: 3, textAlign: "center" }}>
          <Typography variant="caption" color="text.secondary">
            Copyright © {year} PAVAS S.A.S. Todos los derechos reservados.
          </Typography>
        </Box>
      </Stack>
    </AuthWrapper1>
  );
}
