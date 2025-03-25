"use client";

import { useCustom } from "@refinedev/core";
import { Grid, Card, Typography, Row, Col, Statistic, Space, Divider, Spin } from "antd";
import Link from "next/link";
import {
  ShoppingCartOutlined,
  ProductOutlined,
  UserOutlined,
  FolderOutlined,
  FolderOpenOutlined,
  CreditCardOutlined, 
  ArrowRightOutlined,
  EnvironmentOutlined,
  HomeOutlined,
  SettingOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { UserRole } from "../../../types/types";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

interface ResourceCard {
  path: string;
  label: string;
  icon: React.ReactNode;
  color: string;
  role:UserRole[]
}

const resources: ResourceCard[] = [
  {
    path: "/admin/products",
    label: "Productos",
    icon: <ProductOutlined />,
    color: "#1677ff",
    role:[2]
  },
  {
    path: "/admin/orders",
    label: "Pedidos",
    icon: <ShoppingCartOutlined />,
    color: "#52c41a",
    role:[2,3]
  },
  {
    path: "/admin/user",
    label: "Usuarios",
    icon: <UserOutlined />,
    color: "#722ed1",
    role:[2]
  },
  {
    path: "/admin/category",
    label: "Categorías",
    icon: <FolderOutlined />,
    color: "#faad14",
    role:[2]
  },
  {
    path: "/admin/sub_category",
    label: "Sub Categorías",
    icon: <FolderOpenOutlined />,
    color: "#fa8c16",
    role:[2]
  },
  {
    path: "/admin/payments",
    label: "Pagos",
    icon: <CreditCardOutlined />,
    color: "#13c2c2",
    role:[2]
  },
  {
    path: "/admin/province",
    label: "Provincias",
    icon: <EnvironmentOutlined />,
    color: "#1DA57A",
    role:[2]
  },
  {
    path: "/admin/municipality",
    label: "Municipios",
    icon: <HomeOutlined />,
    color: "#1890FF",
    role:[2]
  },
  {
    path: "/admin/utils",
    label: "Herramientas",
    icon: <ToolOutlined />,
    color: "#FF6666",
    role:[2]
  },
];

export default function AdminDashboard() {
  const screens = useBreakpoint();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const userRole = Number(session?.user?.role) as UserRole || 1; 

  const { data, isLoading: dataLoading, refetch } = useCustom({
    url: "/public/main",
    method: "get",
  });

  useEffect(() => {
    if (data) {
      setStats(data.data || {});
      setIsLoading(false);
    } else if (!dataLoading) {
      setIsLoading(false);
    }
  }, [data, dataLoading]);

  
  const filteredResources = resources.filter(resource => 
    resource.role.includes(userRole)
  );

  return (
    <div style={{ padding: screens.xs ? "16px" : "24px" }}>
      
      <Row gutter={[0, 24]}>
        <Col span={24} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2} style={{ margin: 0 }}>
            Panel de Administración
          </Title>
          {error && <Text type="danger">{error}</Text>}
        </Col>
        <Col span={24}>
          <Divider style={{ margin: "12px 0 24px" }} />
        </Col>
      </Row>

      
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Provincias"
              value={isLoading ? "Cargando..." : stats.provinces || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Productos"
              value={isLoading ? "Cargando..." : stats.products || 0}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card>
            <Statistic
              title="Categorías"
              value={isLoading ? "Cargando..." : stats.category || 0}
            />
          </Card>
        </Col>
      </Row>

      {/* Sección de recursos */}
      <Row gutter={[24, 24]}>
        {filteredResources.map((resource) => (
          <Col 
            key={resource.path} 
            xs={24} 
            sm={12} 
            md={8} 
            lg={6}
          >
            <Link href={resource.path} legacyBehavior>
              <Card
                hoverable
                styles={{
                  body: { 
                    padding: "20px",
                    height: "100%",
                  },
                }}
                style={{
                  borderRadius: "8px",
                  overflow: "hidden",
                  height: "100%",
                  borderLeft: `4px solid ${resource.color}`,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                  transition: "all 0.3s ease",
                }}
              >
                <Space direction="vertical" size={16} style={{ width: "100%" }}>
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    alignItems: "center" 
                  }}>
                    <div 
                      style={{ 
                        backgroundColor: `${resource.color}15`, 
                        borderRadius: "50%",
                        width: "48px",
                        height: "48px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <span style={{ 
                        fontSize: "24px", 
                        color: resource.color 
                      }}>
                        {resource.icon}
                      </span>
                    </div>
                    <ArrowRightOutlined style={{ color: "#8c8c8c" }} />
                  </div>
                  <Title level={4} style={{ 
                    margin: 0, 
                    fontSize: "18px", 
                    fontWeight: 500 
                  }}>
                    {resource.label}
                  </Title>
                </Space>
              </Card>
            </Link>
          </Col>
        ))}
      </Row>
    </div>
  );
}
