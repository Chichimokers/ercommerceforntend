import { ClearOutlined } from "@ant-design/icons";
import { useCustom, useNotification } from "@refinedev/core";

import { FloatButton, Popconfirm } from "antd/lib";

const FloatButtonClearCache = () => {
  const { refetch, isLoading } = useCustom({
    url: "/admin/clear-public",
    method: "get"
  });

  const {open} = useNotification()
  const handleClearCache = async () => {
    try {
      await refetch();
      
open?.({
  type: "success",
  description: "Operación realizada con exito",
  message: "Caché del módulo público limpiada exitosamente",
  key: "12",
});
    
    } catch (error) {
      open?.({
        type:"error",
        description:"Error al realizar la acción",
        message:"Error al limpiar la caché",
        key:"13 "
      })

    }
  };
  const popconfirmTitle = (
    <>
      ¿Estás seguro de que deseas limpiar la caché?
      <div style={{ marginTop: "8px" }}>
        Al realizar esto garantizas que la información mostrada en la parte pública 
        se actualice con los cambios más recientes.
      </div>
    </>
  );

  return (
    <Popconfirm
    title={popconfirmTitle}

    onConfirm={handleClearCache}
    okButtonProps={{ style: { backgroundColor: '#3b82f6' } }}
    okText="Sí"
    cancelText="No"
      placement="topLeft"
      
    >
      <FloatButton 
        type="primary"  
        icon={<ClearOutlined />} 
           tooltip="Limpiar Cache"
      />
    </Popconfirm>
  );
};


export default FloatButtonClearCache;