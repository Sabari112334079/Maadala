import { useState } from "react";
import Sidebar from "./components/Sidebar";
import AssetManager from "./pages/AssetManager";
import Liabiities from "./pages/Liabilities";
import NetWorth from "./pages/Networth";
import Transactions from "./pages/Transactions";
import Reports from "./pages/Reports";

function App() {
  const [active, setActive] = useState("assets");

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar active={active} setActive={setActive} />

      <div style={{ flex: 1 }}>
        {active === "assets" && <AssetManager />}
        {active === "liabilities" && <Liabiities/>}
        {active === "networth" && <NetWorth/>}
        {active === "transactions" && <Transactions/>}
        {active === "reports" && <Reports/>}
      </div>
    </div>
  );
}

export default App;