import { Button, Card, Space } from "antd";
import { PlusOutlined, SyncOutlined, UploadOutlined } from "@ant-design/icons";
import { useNavigation } from "@refinedev/core";

export const QuickActions = () => {
  const { list, create } = useNavigation();

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        block
        onClick={() => create("products")}
      >
        Nuevo Producto
      </Button>
      
      <Button
        icon={<SyncOutlined />}
        block
        onClick={() => list("orders")}
      >
        Actualizar Pedidos
      </Button>
      
      <Button
        icon={<UploadOutlined />}
        block
        onClick={() => console.log("Exportar datos")}
      >
        Exportar CSV
      </Button>
      
      <Button
        type="dashed"
        block
        onClick={() => window.open("/api/backup", "_blank")}
      >
        Generar Backup
      </Button>
    </Space>
  );
};