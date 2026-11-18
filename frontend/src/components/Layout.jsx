import { Layout as AntLayout, Menu, Button } from "antd";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../AuthContext";

const { Header, Sider, Content } = AntLayout;

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const items = [
    { key: "/", label: "Dashboard" },
    { key: "/vendors", label: "Vendors" },
    // more modules get added here as we build them
  ];

  return (
    <AntLayout style={{ minHeight: "100vh" }}>
      <Sider>
        <div style={{ color: "#fff", padding: 16, fontWeight: 600 }}>AP Automation</div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={items}
          onClick={(e) => navigate(e.key)}
        />
      </Sider>
      <AntLayout>
        <Header style={{ background: "#fff", display: "flex", justifyContent: "flex-end", alignItems: "center", gap: 16 }}>
          <span>{user?.username} ({user?.role})</span>
          <Button onClick={() => { logout(); navigate("/login"); }}>Logout</Button>
        </Header>
        <Content style={{ margin: 24 }}>
          <Outlet />
        </Content>
      </AntLayout>
    </AntLayout>
  );
}