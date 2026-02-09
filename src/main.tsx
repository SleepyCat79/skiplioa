import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ConfigProvider, theme, App as AntApp } from "antd";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
        token: {
          colorPrimary: "#3b82f6",
          colorBgContainer: "#131720",
          colorBgElevated: "#1a1f2e",
          colorBgLayout: "#0b0e14",
          colorBorder: "#1e293b",
          colorBorderSecondary: "#151b28",
          borderRadius: 10,
          colorText: "#e2e8f0",
          colorTextSecondary: "#64748b",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        },
        components: {
          Button: {
            borderRadius: 8,
            controlHeight: 40,
          },
          Input: {
            colorBgContainer: "#0f1219",
            colorBorder: "#1e293b",
            activeBorderColor: "#3b82f6",
            controlHeight: 44,
          },
          Select: {
            colorBgContainer: "#0f1219",
            colorBorder: "#1e293b",
            controlHeight: 44,
          },
          Modal: {
            contentBg: "#131720",
            headerBg: "#131720",
          },
          Drawer: {
            colorBgElevated: "#131720",
          },
          Table: {
            colorBgContainer: "#131720",
            headerBg: "#0f1219",
            rowHoverBg: "#1a1f2e",
          },
          Card: {
            colorBgContainer: "#131720",
          },
          Menu: {
            colorBgContainer: "transparent",
            itemSelectedBg: "rgba(59,130,246,0.12)",
            itemSelectedColor: "#3b82f6",
          },
          Divider: {
            colorSplit: "#1e293b",
          },
          Form: {
            labelColor: "#94a3b8",
          },
          Tabs: {
            colorBorderSecondary: "#1e293b",
          },
        },
      }}
    >
      <AntApp>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AntApp>
    </ConfigProvider>
  </StrictMode>,
);
