"use client";

import { Typography } from "antd";
import { useShow } from "@refinedev/core";
import { Show } from "@refinedev/antd";
import { BaseType } from "../../../../../../types/types";

const { Title, Text } = Typography;

interface Municipality extends BaseType {
  name: string;
  basePrice: string;
  minHours: number;
  maxHours: number;
  province: string;
}

export default function MunicipalityShow() {
  const { queryResult } = useShow<Municipality>({
    resource: "municipality",
  });
  
  const { data, isLoading } = queryResult;
  const record = data?.data;

  return (
    <Show 
      title="Detalles del Municipio"
      isLoading={isLoading}
    >
      <Title level={5}>Nombre</Title>
      <Text>{record?.name}</Text>

      <Title level={5}>Precio Base</Title>
      <Text>${record?.basePrice}</Text>

      <Title level={5}>Horas Mínimas</Title>
      <Text>{record?.minHours}h</Text>

      <Title level={5}>Horas Máximas</Title>
      <Text>{record?.maxHours}h</Text>

      <Title level={5}>Provincia</Title>
      <Text>{record?.province}</Text>
    </Show>
  );
} 