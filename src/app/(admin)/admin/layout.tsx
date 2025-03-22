"use client";

import { Authenticated, Refine } from "@refinedev/core";
import { ThemedLayoutV2, useNotificationProvider } from "@refinedev/antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import NextRouterProvider from "@refinedev/nextjs-router/app";
import { authProvider } from "@/providers/auth-provider";
import {
  DashboardOutlined,
  ShoppingCartOutlined,
  ProductOutlined,
  UserOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  AppstoreOutlined,
  SunOutlined,
  MoonOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  ToolOutlined
} from "@ant-design/icons";
import { ConfigProvider, App, Layout as AntLayout, Button, Space, Typography, Switch } from "antd";
import { theme } from "antd";
import { useTheme } from "next-themes";
import { customDataProvider } from "@providers/data-provider";
import esES from "antd/locale/es_ES";
import dynamic from "next/dynamic";
import "@refinedev/antd/dist/reset.css";
import { i18nProvider } from '@providers/i18n-refine-provider';
import { SessionProvider } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import Image from 'next/image';

const AccountButton = dynamic(
  () => import("@/components/buttons/account-button"), {
  loading: () => (
    <div className="w-10 h-10 bg-default-200 rounded-full animate-pulse" />
  )
});
const { Header } = AntLayout;
const { Title, Text } = Typography;

const CustomHeader = () => {
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

      <Switch size="default" style={{ marginRight: '20px' }}
        checked={resolvedTheme === "dark"}
        onChange={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
        checkedChildren={<MoonOutlined />}
        unCheckedChildren={<SunOutlined />}
      />
      <Space align="center">

        <AccountButton />

      </Space>
    </Header>
  );
};


function Layout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const { data: session } = useSession();

  const themeConfig = {
    algorithm: resolvedTheme === "dark" ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: "#3b82f6",
      borderRadius: 8,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
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
      }
    },
  };


  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
  }, [resolvedTheme]);

  const getIconStyle = () => ({
    fontSize: '18px',
    color: resolvedTheme === "dark" ? "#f5f5f5" : "#555",
  });
  const resources = [
    {
      name: "dashboard",
      list: "/admin",
      meta: {
        label: "Panel",
        icon: <DashboardOutlined style={getIconStyle()} />
      },
    },
    {
      name: "products",
      list: "/admin/products",
      create: "/admin/products/create",
      edit: "/admin/products/edit/:id",
      show: "/admin/products/show/:id",
      meta: {
        label: "Productos",
        icon: <ProductOutlined style={getIconStyle()} />
      },
    },
    {
      name: "orders",
      list: "/admin/orders",
      create: "/admin/orders/create",
      edit: "/admin/orders/edit/:id",
      show: "/admin/orders/show/:id",
      meta: {
        label: "Pedidos",
        icon: <ShoppingCartOutlined style={getIconStyle()} />
      },
    },
    {
      name: "user",
      list: "/admin/user",
      create: "/admin/user/create",
      edit: "/admin/user/edit/:id",
      show: "/admin/user/show/:id",
      meta: {
        label: "Usuarios",
        icon: <UserOutlined style={getIconStyle()} />
      },
    },
    {
      name: "category",
      list: "/admin/category",
      create: "/admin/category/create",
      edit: "/admin/category/edit/:id",
      show: "/admin/category/show/:id",
      meta: {
        label: "Categorías",
        icon: <FolderOutlined style={getIconStyle()} />
      },
    },
    {
      name: "sub_category",
      list: "/admin/sub_category",
      create: "/admin/sub_category/create",
      edit: "/admin/sub_category/edit/:id",
      show: "/admin/sub_category/show/:id",
      meta: {
        label: "Sub Categorías",
        icon: <FolderOpenOutlined style={getIconStyle()} />
      },
    },



    {
      name: "province",
      list: "/admin/province",
      create: "/admin/province/create",
      edit: "/admin/province/edit/:id",
      show: "/admin/province/show/:id",
      meta: {
        label: "Provincias",
        icon: <EnvironmentOutlined style={getIconStyle()} />
      },
    },
    {
      name: "municipality",
      list: "/admin/municipality",
      create: "/admin/municipality/create",
      edit: "/admin/municipality/edit/:id",
      show: "/admin/municipality/show/:id",
      meta: {
        label: "Municipios",
        icon: <HomeOutlined style={getIconStyle()} /> //noceque iconos ponerle 
      },
    }
    ,
    {
      name: "utils",
      list: "/admin/utils",
      meta: {
        label: "Herramientas",
        icon: <ToolOutlined style={getIconStyle()} />
      },
    },
  ];

  return (
    <SessionProvider>
      <AntdRegistry>
        <ConfigProvider
          locale={esES}
          theme={themeConfig}
        >
          <App className="ant-app">
            <Refine
              routerProvider={NextRouterProvider}
              dataProvider={customDataProvider}
              authProvider={{
                ...authProvider,
                onError: async (error) => {
                  if (error.response?.status === 401) {
                    return {
                      logout: true,
                    };
                  }
                  return {
                    error,
                  };
                },
                getIdentity: async () => {
                  if (session?.user) {
                    return {
                      name: session.user.name,
                    };
                  }
                  return null;
                },
              }}
              notificationProvider={useNotificationProvider}
              resources={resources}
              i18nProvider={i18nProvider}
              options={{
                syncWithLocation: true,
                warnWhenUnsavedChanges: true,
                disableTelemetry: true,
              }}
            >
              <Authenticated
                key="admin-auth"
                redirectOnFail={`/login?to=${encodeURIComponent('/admin')}`}
              >
                <ThemedLayoutV2
                  initialSiderCollapsed
                  dashboard
                  Header={() => <CustomHeader />}
                  Title={({ collapsed }) => (
                    <div style={{ display: 'flex', alignItems: 'center', padding: collapsed ? '0 12px' : '0 16px' }}>
                      {collapsed ? (
                        <AppstoreOutlined style={{ fontSize: '24px', color: '#3b82f6' }} />
                      ) : (
                        <Image
                          alt="Company Logo"
                          loading="lazy"
                          width={160}
                          height={60}
                          quality={50}
                          src="/logonav.png"
                          className="w-auto object-contain flex-shrink-0"
                        />
                      )}
                    </div>
                  )}
                >
                  {children}
                </ThemedLayoutV2>
              </Authenticated>
            </Refine>
          </App>
        </ConfigProvider>
      </AntdRegistry>
    </SessionProvider>
  );
}

export default Layout;