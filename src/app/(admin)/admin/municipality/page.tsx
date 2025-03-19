"use client";

import { ColumnType } from "antd/es/table";
import { BaseType } from "../../../../types/types";
import GenericList from "@components/admin/generic_admin_pages/genericListPage";

interface Municipality extends BaseType {
  name: string;
  basePrice: string;
  minHours: number;
  maxHours: number;
  province: string;
}

export default function MunicipalityList() {
  return <MunicipalityContent />;
}

const MunicipalityContent: React.FC = () => {
  const columns: ColumnType<Municipality>[] = [
    {
      title: "Nombre",
      dataIndex: "name",
    },
    {
      title: "Precio Base del envio ",
      dataIndex: "basePrice",
      render: (price: string) => `$${price}`,
    },
    {
      title: "Horas Mínimas de Entrega" ,
      dataIndex: "minHours",
      render: (hours: number) => `${hours}h`,
    },
    {
      title: "Horas Máximas de Entrega",
      dataIndex: "maxHours",
      render: (hours: number) => `${hours}h`,
    },
    {
      title: "Provincia",
      dataIndex: "province",
    },
  
  ];

  return (
    <GenericList<Municipality>
      resource="municipality"
      title="Municipios"
      columns={columns}
      pageSize={10}
    />
  );
}; 