"use client";

import { useCustom } from "@refinedev/core";
import { Grid, Card, Typography, Row, Col, Statistic, Space, Divider } from "antd";
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
} from "@ant-design/icons";

const { Title } = Typography;
const { useBreakpoint } = Grid;

interface ResourceCard {
  path: string;
  label: string;
  icon: React.ReactNode;
  color: string;
}

const resources: ResourceCard[] = [
  {
    path: "/admin/products",
    label: "Productos",
    icon: <ProductOutlined />,
    color: "#1677ff",
  },
  {
    path: "/admin/orders",
    label: "Pedidos",
    icon: <ShoppingCartOutlined />,
    color: "#52c41a",
  },
  {
    path: "/admin/user",
    label: "Usuarios",
    icon: <UserOutlined />,
    color: "#722ed1",
  },
  {
    path: "/admin/category",
    label: "Categorías",
    icon: <FolderOutlined />,
    color: "#faad14",
  },
  {
    path: "/admin/sub_category",
    label: "Sub Categorías",
    icon: <FolderOpenOutlined />,
    color: "#fa8c16",
  },
  {
    path: "/admin/payments",
    label: "Pagos",
    icon: <CreditCardOutlined />,
    color: "#13c2c2",
  },
  {
    path: "/admin/province",
    label: "Provincias",
    icon: <EnvironmentOutlined />,
    color: "#1DA57A",
  },
  {
    path: "/admin/municipality",
    label: "Municipios",
    icon: <HomeOutlined />,
    color: "#1890FF",
  },
];

export default function AdminDashboard() {
  const screens = useBreakpoint();

  // Obtenemos las estadísticas desde /public/main
  const { data, isLoading, error } = useCustom({
    url: "/public/main",
    method: "get",
  });

  // Extraemos los datos. Se espera que el endpoint retorne un objeto con keys: provinces, products y category.
  const stats = data?.data || {};

  return (
    <div style={{ padding: screens.xs ? "16px" : "24px" }}>
      <Row gutter={[0, 24]}>
        <Col span={24}>
          <Title level={2} style={{ margin: 0 }}>
            Panel de Administración
          </Title>
        </Col>
        <Col span={24}>
          <Divider style={{ margin: "12px 0 24px" }} />
        </Col>
      </Row>

      {/* Sección de estadísticas (tarjetas en 3 columnas) */}
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
        {resources.map((resource) => (
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
