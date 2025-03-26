"use client";
import { Authenticated, Refine } from "@refinedev/core";
import { ThemedLayoutV2, useNotificationProvider } from "@refinedev/antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import NextRouterProvider from "@refinedev/nextjs-router/app";
import { authProvider } from "@/providers/auth-provider";
import { SunOutlined, MoonOutlined } from "@ant-design/icons";
import { ConfigProvider, App, Layout as AntLayout, Space, Switch } from "antd";
import { theme } from "antd";
import { useTheme } from "next-themes";
import { customDataProvider } from "@providers/data-provider";
import esES from "antd/locale/es_ES";
import dynamic from "next/dynamic";
import "@refinedev/antd/dist/reset.css";
import { i18nProvider } from '@providers/i18n-refine-provider';
import { useSession } from "next-auth/react";
import React, { useEffect, useMemo, memo } from "react";
import { resources } from "@components/admin/resources";
import accessControlProvider from "@components/admin/access_control";
import CustomSider from "@components/admin/custom_sider";

const FloatButtonsGroupComponent = dynamic(
  () => import("@/components/admin/float_buttons/floatButtonGroups"),
  { ssr: false }
);

const AccountButton = dynamic(
  () => import("@/components/buttons/account-button"),
  {
    loading: () => (
      <div className="w-10 h-10 bg-default-200 rounded-full animate-pulse" />
    ),
  }
);

const { Header } = AntLayout;

const CustomHeader = memo(() => {
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <Header
      style={{
        padding: "0 16px",
        background: resolvedTheme === "dark" ? "#141414" : "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
      }}
    >
      <Switch
        size="default"
        style={{
          marginRight: "20px",
          backgroundColor: resolvedTheme === "dark" ? "#3b82f6" : "grey",
        }}
        checked={resolvedTheme === "dark"}
        onChange={() =>
          setTheme(resolvedTheme === "dark" ? "light" : "dark")
        }
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
      />
      <Space align="center">
        <AccountButton />
      </Space>
    </Header>
  );
});

function Layout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const { data: session, status } = useSession();
  const themeConfig = useMemo(() => ({
    algorithm: resolvedTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#3b82f6",
      borderRadius: 8,
      fontFamily:
        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
      fontSize: 14,
      colorBgContainer: resolvedTheme === "dark" ? "#141414" : "#ffffff",
      colorBgLayout: resolvedTheme === "dark" ? "#0f0f0f" : "#f5f7fa",
    },
    components: {
      Menu: {
        itemBg: resolvedTheme === "dark" ? "#141414" : "#ffffff",
        itemColor: resolvedTheme === "dark" ? "#f5f5f5" : "#121212",
        itemSelectedColor: "#3b82f6",
        itemSelectedBg: resolvedTheme === "dark" ? "#1f1f1f" : "#e6f7ff",
        itemHoverColor: "#3b82f6",
      },
      Card: {
        colorBgContainer: resolvedTheme === "dark" ? "#141414" : "#ffffff",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      },
      Button: {
        borderRadius: 6,
      },
      Input: {
        borderRadius: 6,
      },
      Select: {
        borderRadius: 6,
      },
      Table: {
        borderRadius: 8,
        colorBgContainer: resolvedTheme === "dark" ? "#141414" : "#ffffff",
      },
    },
  }), [resolvedTheme]);

  const memoizedAuthProvider = useMemo(() => ({
    ...authProvider,
    onError: async (error: any) => {
      if (error.response?.status === 401) {
        return { logout: true };
      }
      return { error };
    },
    getIdentity: async () => {
      return session?.user
        ? {
            name: session.user.name,
            role: session.user.role,
          }
        : null;
    },
  }), [session]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", resolvedTheme === "dark");
  }, [resolvedTheme]);



  return (
    <AntdRegistry>
      <ConfigProvider locale={esES} theme={themeConfig}> 
        <App>
          <Refine
            routerProvider={NextRouterProvider}
            dataProvider={customDataProvider}
            authProvider={memoizedAuthProvider}
            notificationProvider={useNotificationProvider}
            accessControlProvider={accessControlProvider}
            resources={resources}
            i18nProvider={i18nProvider}
            options={{
              mutationMode: "optimistic",
              warnWhenUnsavedChanges: true,
              disableTelemetry: true,
              syncWithLocation: false,
              liveMode: "off",
            }}
          >
            <Authenticated
              key="admin-auth"
              redirectOnFail={`/login?to=${encodeURIComponent("/admin")}`}
            >
              
              <ThemedLayoutV2  dashboard Header={CustomHeader} Sider={CustomSider}>
                {children}
              </ThemedLayoutV2>
              
              <FloatButtonsGroupComponent />
            </Authenticated>
          </Refine>
          </App>
      </ConfigProvider>
    </AntdRegistry>
  );
}

export default Layout;
