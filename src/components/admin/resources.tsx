"use client";
import { ResourceProps } from "@refinedev/core"
import { UserRole } from "../../types/types";
import dynamic from "next/dynamic";
import { DashboardOutlined, EnvironmentOutlined, FolderOpenOutlined, FolderOutlined, HomeOutlined, ProductOutlined, ShoppingCartOutlined, ToolOutlined, UserOutlined } from "@ant-design/icons";



export const resources: ResourceProps[] = [
    {
      name: "dashboard",
      list: "/admin",
      meta: { 
        label: "Panel", 
        icon: <DashboardOutlined  />    
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
        icon: <ProductOutlined  /> 
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
        icon: <ShoppingCartOutlined /> 
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
        icon: <UserOutlined  /> 
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
        icon: <FolderOutlined  /> 
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
        icon: <FolderOpenOutlined  /> 
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
        icon: <EnvironmentOutlined  />,
        requiredRole:[UserRole.DELIVERY]
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
        icon: <HomeOutlined  /> //noceque iconos ponerle 
      },
    }
    ,
    {
      name: "utils",
      list: "/admin/utils",
      meta: { 
        label: "Herramientas", 
        icon: <ToolOutlined  /> 
      },
    },
  ];
