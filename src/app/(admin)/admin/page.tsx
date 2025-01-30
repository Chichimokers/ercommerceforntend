"use client";

import { Grid, Card, Statistic, Typography } from "antd";
import { useApiUrl, useCustom } from "@refinedev/core";
import { ResponsiveLine } from '@nivo/line';
import { RecentOrders } from "../../../components/dashboard/recent-orders";
import { QuickActions } from "../../../components/dashboard/quick-actions";

interface Sales {
  date: string;      // Formato esperado: "YYYY-MM-DD"
  sales: number;
}

const { Title } = Typography;
const { useBreakpoint } = Grid;

export default function AdminDashboard() {
  const apiUrl = useApiUrl();
  const screens = useBreakpoint();
  const { data: stats } = useCustom({ url: `${apiUrl}/stats`, method: "get" });
  const { data: salesData } = useCustom({ url: `${apiUrl}/sales`, method: "get" });

  // Transformar datos al formato que espera Nivo
  const nivoData = [{
    id: "Ventas",
    data: (salesData?.data || []).map((item: Sales) => ({
      x: item.date,
      y: item.sales
    }))
  }];

  return (
    <div style={{ padding: screens.xs ? "16px" : "24px" }}>
      <Title level={2}>Panel de Administración</Title>

      {/* Estadísticas Rápidas */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", marginBottom: 24 }}>
        <Card>
          <Statistic title="Ventas Totales" value={stats?.data.totalSales} prefix="$" />
        </Card>
        <Card>
          <Statistic title="Pedidos Hoy" value={stats?.data.todayOrders} />
        </Card>
        <Card>
          <Statistic title="Productos Activos" value={stats?.data.activeProducts} />
        </Card>
        <Card>
          <Statistic title="Usuarios Registrados" value={stats?.data.totalUsers} />
        </Card>
      </div>

      {/* Gráfico de Ventas - Versión Nivo */}
      <Card title="Tendencias de Ventas" style={{ marginBottom: 24 }}>
        <div style={{ height: 300 }}>
          {(salesData?.data?.length > 0) ? (
            <ResponsiveLine
              data={nivoData}
              margin={{ top: 20, right: 20, bottom: 60, left: 50 }}
              colors={["#8884d8"]}
              enablePoints={true}
              pointSize={6}
              pointColor={{ theme: "background" }}
              pointBorderWidth={2}
              pointBorderColor={{ from: "serieColor" }}
              axisBottom={{
                format: "%b %d",
                tickValues: "every 2 days",
                legend: "Fecha",
                legendPosition: "middle",
                legendOffset: 40
              }}
              axisLeft={{
                legend: "Ventas ($)",
                legendPosition: "middle",
                legendOffset: -40
              }}
              xScale={{
                type: "time",
                format: "%Y-%m-%d",
                useUTC: false
              }}
              yScale={{
                type: "linear",
                min: "auto",
                max: "auto",
                stacked: false
              }}
              useMesh={true}
              enableSlices="x"
              xFormat="time:%Y-%m-%d"
              yFormat=" >-.2f"
              tooltip={({ point }) => (
                <div style={{
                  background: 'white',
                  padding: '8px 12px',
                  border: '1px solid #ccc',
                  borderRadius: 4,
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                }}>
                  <strong>{point.data.xFormatted}</strong>
                  <div style={{ color: point.color, marginTop: 4 }}>
                    ${point.data.yFormatted}
                  </div>
                </div>
              )}
            />
          ) : (
            <div style={{
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#666'
            }}>
              No hay datos disponibles
            </div>
          )}
        </div>
      </Card>

      <div style={{ display: "grid", gridTemplateColumns: "minmax(400px, 3fr) minmax(200px, 1fr)", gap: 24 }}>
        {/* Últimos Pedidos */}
        <Card title="Pedidos Recientes">
          <RecentOrders />
        </Card>

        {/* Acciones Rápidas */}
        <Card title="Acciones Rápidas">
          <QuickActions />
        </Card>
      </div>
    </div>
  );
}