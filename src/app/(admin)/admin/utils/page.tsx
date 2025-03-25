"use client";

import React from "react";
import { useCustom } from "@refinedev/core";
import { Button, Popconfirm, message, Card, Typography, Row, Col } from "antd";
import { ClearOutlined, QrcodeOutlined } from "@ant-design/icons";
import Link from "next/link";
import { useSession } from "next-auth/react";

const { Title, Text } = Typography;


const ClearCacheCard: React.FC = () => {

  const { refetch, isFetching } = useCustom(
    {
      url: "/admin/clear-public",
      method: "get",
    }
  );


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
      style={{ height: "100%", display: "flex", flexDirection: "column" }}

    >
      <Text style={{ display: "block", marginBottom: 16, color: "#555", flex: 1 }}>
        Esta acción elimina la caché del módulo público, asegurando que la información
        mostrada en la parte pública se actualice con los cambios más recientes.
      </Text>
      <div style={{ marginTop: "auto" }}>
        <Popconfirm
          title="¿Estás seguro de que deseas limpiar la caché?"
          onConfirm={handleClearCache}
          okText="Sí"
          cancelText="No"
          okButtonProps={{ style: { backgroundColor: '#3b82f6' } }}
        >
          <Button type="primary" style={{ backgroundColor: "#3b82f6" }} loading={isFetching} block>
            Ejecutar
          </Button>
        </Popconfirm>
      </div>
    </Card>
  );
};


const QrScannerCard: React.FC = () => {
  return (
    <Card
      title={
        <div style={{ display: "flex", alignItems: "center" }}>
          <QrcodeOutlined style={{ fontSize: 24, marginRight: 8, color: "#722ed1" }} />
          <span>Escáner de QR</span>
        </div>
      }

      styles={{body:{ flex: 1,height:"100%" , display: "flex", flexDirection: "column" }}}
      
    >
      <Text style={{ display: "block", marginBottom: 16, color: "#555", flex: 1 }}>
        Escanee códigos QR de órdenes para acceder rápidamente a sus detalles y cambiar el estado de la misma.
        Útil para personal de entrega y administradores.
      </Text>
      <div style={{ marginTop: "auto" }}>
        <Link href="/admin/utils/qr_scan" passHref>
          <Button type="primary" block style={{ backgroundColor: "#722ed1" }}>
            Abrir Escáner
          </Button>
        </Link>
      </div>
    </Card>
  );
};

const UtilsLayout: React.FC = () => {
  const { data: session } = useSession();


  return (
    <div style={{ padding: "40px" }}>
      <Row gutter={[24, 24]}>
        {(Number(session?.user.role) === 2)
          &&
          (
            <Col xs={24} sm={12} md={8}>
              <ClearCacheCard />
            </Col>
          )
        }
        <Col xs={24} sm={12} md={8}>
          <QrScannerCard />
        </Col>
      </Row>
    </div>
  );
};

export default UtilsLayout;
