import type { ReactElement } from "react";
import { DashboardPage } from "./features/dashboard/DashboardPage";
import { LoginPage } from "./features/auth/LoginPage";
import { useAuthStore } from "./lib/state/authStore";

const App = (): ReactElement => {
  const token = useAuthStore((s) => s.token);

  return token ? <DashboardPage /> : <LoginPage />;
};

export default App;
