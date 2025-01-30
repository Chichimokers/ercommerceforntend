"use client";

import { Authenticated, Refine } from "@refinedev/core";
import { ThemedLayoutV2, useNotificationProvider } from "@refinedev/antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import NextRouterProvider from "@refinedev/nextjs-router/app";
import dataProvider from "@refinedev/simple-rest";
import { authProvider } from "@/providers/auth-provider";
import { GoogleOutlined, ShoppingOutlined, UserOutlined } from "@ant-design/icons";
import { ConfigProvider, App } from "antd";
import { theme } from "antd";
import { useTheme } from "next-themes";

export default function Layout({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <AntdRegistry>
      <ConfigProvider
        theme={{
          algorithm: resolvedTheme === "dark"
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
          token: {
            colorPrimary: "#3b82f6",
          },
        }}
      >
        <Refine
          routerProvider={NextRouterProvider}
          dataProvider={dataProvider(process.env.NEXT_PUBLIC_API_URL)}
          authProvider={authProvider}
          notificationProvider={useNotificationProvider}
          resources={[
            {
              name: "dashboard",
              list: "/admin",
              meta: { label: "Panel", icon: <GoogleOutlined /> },
            },
            {
              name: "products",
              list: "/admin/products",
              create: "/admin/products/create",
              edit: "/admin/products/edit/:id",
              show: "/admin/products/show/:id",
              meta: { label: "Productos", icon: <ShoppingOutlined /> },
            },
            {
              name: "orders",
              list: "/admin/orders",
              show: "/admin/orders/show/:id",
              meta: { label: "Pedidos", icon: <ShoppingOutlined /> },
            },
            {
              name: "users",
              list: "/admin/users",
              meta: { label: "Usuarios", icon: <UserOutlined /> },
            },
          ]}
          options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
        >
          {/*<Authenticated
              key="admin-auth"
              redirectOnFail="/api/auth/signin?callbackUrl=/admin"
              loading={<div>Verificando acceso...</div>}
            >*/}
          <App>
            <ThemedLayoutV2>
              {children}
            </ThemedLayoutV2>
          </App>
          {/*</Authenticated>*/}
        </Refine>
      </ConfigProvider>
    </AntdRegistry>
  );
}