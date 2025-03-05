"use client";

import { Authenticated, Refine } from "@refinedev/core";
import { ThemedLayoutV2, useNotificationProvider } from "@refinedev/antd";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import NextRouterProvider from "@refinedev/nextjs-router/app";
import { authProvider } from "@/providers/auth-provider";
import {
	GoogleOutlined,
	ProductOutlined,
	ShoppingOutlined,
	UserOutlined,
} from "@ant-design/icons";
import { ConfigProvider, App } from "antd";
import { theme } from "antd";
import { useTheme } from "next-themes";
import { customDataProvider } from "@providers/data-provider";
import { RefineContext } from "@app/_refine_context";
import React from "react";
import { Spinner } from "@heroui/react";

function Layout({ children }: { children: React.ReactNode }) {
	const { resolvedTheme } = useTheme();

	return (
		<RefineContext>
			<AntdRegistry>
				<ConfigProvider
					theme={{
						algorithm:
							resolvedTheme === "dark"
								? theme.darkAlgorithm
								: theme.defaultAlgorithm,
						token: {
							colorPrimary: "#3b82f6",
						},
					}}
				>
					<Refine
						routerProvider={NextRouterProvider}
						dataProvider={customDataProvider}
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
								meta: { label: "Productos", icon: <ProductOutlined /> },
							},
							{
								name: "orders",
								list: "/admin/orders",
								show: "/admin/orders/show/:id",
								meta: { label: "Pedidos", icon: <ShoppingOutlined /> },
							},
							{
								name: "user",
								list: "/admin/user",
								meta: { label: "Usuarios", icon: <UserOutlined /> },
							},
							{
								name: "dashboard",
								list: "/admin",
								meta: { label: "Panel", icon: <GoogleOutlined /> },
							},

							{
								name: "orders",
								list: "/admin/orders",
								show: "/admin/orders/show/:id",
								meta: { label: "Pedidos", icon: <ShoppingOutlined /> },
							},


							{
								name: "category",
								list: "/admin/category",
								create: "/admin/category/create",
								edit: "/admin/category/edit/:id",
								show: "/admin/category/show/:id",
								meta: { label: "Categorías" },
							},
							{
								name: "sub_category",
								list: "/admin/sub_category",
								create: "/admin/sub_category/create",
								edit: "/admin/sub_category/edit/:id",
								show: "/admin/sub_category/show/:id",
								meta: { label: "Sub Categorías" },
							},
							{
								name: "payments",
								list: "/admin/payments",
								meta: { label: "Pagos" },
							},
							{
								name: "discounts",
								list: "/admin/discounts",
								create: "/admin/discounts/create",
								edit: "/admin/discounts/edit/:id",
								meta: { label: "Descuentos" },
							},
							{
								name: "ratings",
								list: "/admin/ratings",
								meta: { label: "Ratings" },
							},
						]}
						options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
					>
						<Authenticated
							key="admin-auth"
							redirectOnFail="/login"
							loading={
								<div className="h-screen flex flex-col justify-center items-center">
									<Spinner />
								</div>
							}
						>
							<App>
								<ThemedLayoutV2>{children}</ThemedLayoutV2>
							</App>
						</Authenticated>
					</Refine>
				</ConfigProvider>
			</AntdRegistry>
		</RefineContext>
	);
}

export default Layout;
