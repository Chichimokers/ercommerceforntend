"use client";

import React from "react";
import { useCustom } from "@refinedev/core";
import { Button, Popconfirm, message, Card, Typography, Row, Col } from "antd";
import { ClearOutlined, SettingOutlined, SyncOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

// Tarjeta para la funcionalidad de limpiar caché
const ClearCacheCard: React.FC = () => {
  // Configuramos useCustom para realizar la petición GET a "/admin/clear-public"
  // Con enabled: false evitamos la ejecución automática y la disparamos manualmente.
  const { refetch, isFetching } = useCustom(
    {
      url: "/admin/clear-public",
      method: "get",
    }
  );

  // Función que se ejecuta al confirmar la acción.
  const handleClearCache = async () => {
    try {
      await refetch();
      message.success("Caché del módulo público limpiada exitosamente");
    } catch (error) {
      message.error("Error al limpiar la caché");
    }
  };

  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <ClearOutlined style={{ fontSize: 24, marginRight: 8, color: "#3b82f6" }} />
          <span>Limpiar Caché</span>
        </div>
      }
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        background: "linear-gradient(135deg, #fff, #f7faff)",
      }}
    >
      <Text style={{ display: "block", marginBottom: 16, color: "#555" }}>
        Esta acción elimina la caché del módulo público, asegurando que la información
        mostrada en la parte pública se actualice con los cambios más recientes.
      </Text>
      <Popconfirm
        title="¿Estás seguro de que deseas limpiar la caché?"
        onConfirm={handleClearCache}
        okText="Sí"
        cancelText="No"
      >
        <Button type="primary" loading={isFetching} block>
          Ejecutar
        </Button>
      </Popconfirm>
    </Card>
  );
};

// Tarjeta genérica de placeholder para otras utilidades
const PlaceholderCard: React.FC<{ title: string; description: string; icon: React.ReactNode; }> = ({ title, description, icon }) => {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          {icon}
          <span style={{ marginLeft: 8 }}>{title}</span>
        </div>
      }
      style={{
        borderRadius: 12,
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        background: "linear-gradient(135deg, #fff, #f7faff)",
      }}
    >
      <Text style={{ display: "block", marginBottom: 16, color: "#555" }}>
        {description}
      </Text>
      <Button type="primary" block disabled>
        En Construcción
      </Button>
    </Card>
  );
};

// Layout que organiza las tarjetas en 3 columnas
const UtilsLayout: React.FC = () => {
  return (
    <div style={{ padding: "40px" }}>
      <Row gutter={[24, 24]}>
        <Col xs={24} sm={12} md={8}>
          <ClearCacheCard />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <PlaceholderCard
            title="Utilidad 2"
            description="Descripción de la utilidad 2."
            icon={<SettingOutlined style={{ fontSize: 24, color: "#3b82f6" }} />}
          />
        </Col>
        <Col xs={24} sm={12} md={8}>
          <PlaceholderCard
            title="Utilidad 3"
            description="Descripción de la utilidad 3."
            icon={<SyncOutlined style={{ fontSize: 24, color: "#3b82f6" }} />}
          />
        </Col>
      </Row>
    </div>
  );
};

export default UtilsLayout;
