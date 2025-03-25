"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, Typography, Button, Spin, Result } from "antd";
import { QrcodeOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useCustom, useNotification } from "@refinedev/core";
import { Order } from "../../../../../types/types";

const { Title, Text } = Typography;

const QrReader = dynamic(
  () => import('react-qr-reader').then(mod => ({ default: mod.QrReader })),
  { ssr: false }
);

// Define component states interface for better type safety
interface ScannerState {
  scanning: boolean;
  error: string | null;
  cameraPermission: boolean | null;
  isLoading: boolean;
  currentOrderId: string | null;
}

const QRScanPage: React.FC = () => {
  const router = useRouter();
  const { open } = useNotification();
  
  // Group related states into one state object
  const [state, setState] = useState<ScannerState>({
    scanning: false,
    error: null,
    cameraPermission: null,
    isLoading: false,
    currentOrderId: null
  });

  // Destructure state for easier access
  const { scanning, error, cameraPermission, isLoading, currentOrderId } = state;

  // API requests using useCustom hook
  const { refetch: updateOrder } = useCustom({
    url: currentOrderId ? `/orders/${currentOrderId}` : "",
    method: "patch",
    config: {
      query: {
        status: "completed",
      }
    },
    queryOptions: {
      enabled: false,
    },
  });
 
  const { refetch: getOrderInfo } = useCustom<Order>({
    url: currentOrderId ? `/orders/${currentOrderId}` : "",
    method: "get",
    queryOptions: {
      enabled: false,
    },
  });

  
  const updateState = (newState: Partial<ScannerState>) => {
    setState(prevState => ({ ...prevState, ...newState }));
  };


  const stopMediaStream = useCallback(() => {
    const videoElement = document.getElementById('qr-video') as HTMLVideoElement;
    if (videoElement?.srcObject) {
      const stream = videoElement.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
    }
  }, []);

  const updateOrderStatus = useCallback(async (orderId: string) => {
    try {
      updateState({ isLoading: true, currentOrderId: orderId });
      
      const { data: orderData } = await getOrderInfo();
      
      if (!orderData || orderData.data.status !== "paid") {
        open?.({
          type: "error",
          message: "Error al procesar la orden",
          description: `La orden ${orderId} no se puede actualizar debido a que su estado es ${orderData?.data.status || "desconocido"}`,
        });
        updateState({ isLoading: false });
        return;
      }

      const { data, error: apiError } = await updateOrder();
      
      if (apiError) {
        throw new Error(`Error updating order status: ${apiError}`);
      }
      
      open?.({
        type: "success",
        message: "Estado actualizado",
        description: `La orden #${orderId} se actualizó a ${data?.data.status}`,
      });
      
      router.push(`/admin/orders/show/${orderId}`);
    } catch (err) {
      console.error("Error updating order status:", err);
      open?.({
        type: "error",
        message: "Error al actualizar",
        description: `No se pudo actualizar el estado de la orden. Por favor, intente nuevamente.`,
      });
    } finally {
      updateState({ isLoading: false });
    }
  }, [getOrderInfo, updateOrder, open, router]);

  useEffect(() => {
    if (typeof navigator !== "undefined" && navigator.mediaDevices) {
      navigator.mediaDevices
        .getUserMedia({ video: { facingMode: "environment" } })
        .then(() => {
          updateState({ cameraPermission: true });
        })
        .catch((err) => {
          console.error("Camera permission error:", err);
          updateState({ 
            cameraPermission: false, 
            error: "No se pudo acceder a la cámara. Por favor, conceda permisos de cámara." 
          });
        });
    }
  }, []);

  useEffect(() => {
    return () => {
      if (scanning) {
        stopMediaStream();
      }
    };
  }, [scanning, stopMediaStream]);

  
  const handleResult = useCallback((result?: { getText(): string } | null, error?: Error | null) => {
    if (isLoading) {
      updateState({ isLoading: false });
    }
    
    if (result) {
      try {
        const data = result.getText();
        console.log("QR data detected:", data);

        
        const orderIdMatch = data.match(/\/orders\/([a-zA-Z0-9-]+)/);
        const orderId = orderIdMatch ? orderIdMatch[1] : data;
        
        updateState({ scanning: false });
        open?.({
          type: "success",
          message: "QR escaneado",
          description: `Código detectado: ${orderId}`,
        });
        
        updateOrderStatus(orderId);
      } catch (err) {
        console.error("Error processing QR data:", err);
        open?.({
          type: "error",
          message: "QR inválido",
          description: "El código escaneado no es válido. Por favor, intente nuevamente.",
        });
      }
    } else if (error) {
      
      const errorMessages = ["getUserMedia", "permission", "hardware", "NotAllowedError"];
      if (error.message && errorMessages.some(msg => error.message?.includes(msg))) {
        updateState({ 
          error: `Error al escanear el código QR: ${error.message}`,
          scanning: false 
        });
      }
    }
  }, [isLoading, open, updateOrderStatus]);

  
  const startScanning = () => {
    updateState({ scanning: true, error: null, isLoading: true });
  };

  const stopScanning = () => {
    stopMediaStream();
    updateState({ scanning: false });
  };

  // CSS Styles as constants for better readability
  const styles = {
    scannerContainer: { 
      width: "100%", 
      display: "flex", 
      flexDirection: "column" as const, 
      alignItems: "center",
      height: "calc(100vh - 150px)" 
    },
    videoContainer: { 
      width: "100%", 
      maxWidth: "800px",  
      height: "100vh",    
      position: "relative" as const,
      overflow: "hidden",
      borderRadius: "8px",
    },
    loadingOverlay: {
      position: "absolute" as const,
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      display: "flex",
      flexDirection: "column" as const,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(255,255,255,0.7)",
      zIndex: 10
    },
    qrPositioningGuide: {
      position: "absolute" as const,
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "70%",
      height: "70%",
      border: "2px dashed #1677ff",
      borderRadius: "20px",
      zIndex: 5,
      boxShadow: "0 0 0 1000px rgba(0, 0, 0, 0.1)",  
      pointerEvents: "none" as const
    },
    cornerIndicator: (position: string) => {
      const baseStyle = {
        position: "absolute" as const,
        width: "40px",
        height: "40px",
        zIndex: 6,
        pointerEvents: "none" as const
      };
      
      switch (position) {
        case "topLeft":
          return {
            ...baseStyle,
            top: "calc(50% - 35%)",
            left: "calc(50% - 35%)",
            borderTop: "4px solid #1677ff",
            borderLeft: "4px solid #1677ff"
          };
        case "topRight":
          return {
            ...baseStyle,
            top: "calc(50% - 35%)",
            right: "calc(50% - 35%)",
            borderTop: "4px solid #1677ff",
            borderRight: "4px solid #1677ff"
          };
        case "bottomLeft":
          return {
            ...baseStyle,
            bottom: "calc(50% - 35%)",
            left: "calc(50% - 35%)",
            borderBottom: "4px solid #1677ff",
            borderLeft: "4px solid #1677ff"
          };
        case "bottomRight":
          return {
            ...baseStyle,
            bottom: "calc(50% - 35%)",
            right: "calc(50% - 35%)",
            borderBottom: "4px solid #1677ff",
            borderRight: "4px solid #1677ff"
          };
        default:
          return baseStyle;
      }
    },
    scanLine: {
      position: "absolute" as const,
      top: "0",
      left: "15%",
      width: "70%",
      height: "2px",
      backgroundColor: "#1677ff",
      animation: "scan 2s infinite",
      zIndex: 5,
      boxShadow: "0 0 8px 2px rgba(22, 119, 255, 0.8)",
      pointerEvents: "none" as const
    },
    scanHint: {
      marginTop: "16px", 
      padding: "8px 16px",
      fontWeight: "bold"
    },
    cancelButton: { 
      marginTop: "16px", 
      backgroundColor: "#3b82f6", 
      height: "80px", 
      width: "150px"
    },
    starterContainer: { 
      textAlign: "center" as const, 
      padding: "24px" 
    },
    pageContainer: { 
      padding: scanning ? "0" : "24px",  
      height: scanning ? "100vh" : "auto",
      backgroundColor: "transparent"  
    },
    mainIcon: { 
      fontSize: "64px", 
      color: "#1677ff", 
      marginBottom: "16px" 
    },
    startButton: {
      backgroundColor: "#3b82f6"
    },
    backButton: { 
      marginBottom: "16px" 
    }
  };

  // Component JSX sections
  const renderCornerIndicators = () => (
    <>
      <div style={styles.cornerIndicator("topLeft")} />
      <div style={styles.cornerIndicator("topRight")} />
      <div style={styles.cornerIndicator("bottomLeft")} />
      <div style={styles.cornerIndicator("bottomRight")} />
    </>
  );

  const renderLoadingOverlay = () => (
    isLoading && (
      <div style={styles.loadingOverlay}>
        <Spin size="large" />
        <div style={{ marginTop: 16 }}>Iniciando cámara...</div>
      </div>
    )
  );

  const renderQrReader = () => (
    <QrReader
      constraints={{ 
        facingMode: "environment",
        width: { ideal: 1920 },
        height: { ideal: 1080 }
      }}
      onResult={handleResult}
      scanDelay={500}
      videoId="qr-video"
      videoContainerStyle={{ 
        width: "100%", 
        height: "100%",
        position: "absolute",
        top: 0,
        left: 0
      }}
      videoStyle={{
        width: "100%",
        height: "100%",
        objectFit: "cover"
      }}
    />
  );

  const renderActiveScanner = () => (
    <div className="qr-scanner-container" style={styles.scannerContainer}>
      <div style={styles.videoContainer}>
        {renderLoadingOverlay()}
        <div style={styles.qrPositioningGuide} />
        {renderCornerIndicators()}
        {renderQrReader()}
        <div style={styles.scanLine} />
        
        <style jsx>{`
          @keyframes scan {
            0% { top: 15%; }
            50% { top: 85%; }
            100% { top: 15%; }
          }
        `}</style>
      </div>
      
      <Text style={styles.scanHint}>
        Alinee el código QR con el marco para escanear
      </Text>
      
      <Button 
        onClick={stopScanning} 
        style={styles.cancelButton}
        type="primary"
        size="middle"
      >
        Cancelar escaneo
      </Button>
    </div>
  );

  const renderErrorState = () => (
    <Result
      status="warning"
      title="Error al escanear"
      subTitle={error}
      extra={
        <Button type="primary" onClick={() => updateState({ error: null })}>
          Intentar nuevamente
        </Button>
      }
    />
  );

  const renderPermissionDenied = () => (
    <Result
      status="error"
      title="Sin acceso a la cámara"
      subTitle="Por favor, conceda permisos de cámara para utilizar el escáner de QR."
      extra={
        <Button type="primary" onClick={() => window.location.reload()}>
          Reintentar
        </Button>
      }
    />
  );

  const renderStarterState = () => (
    <div style={styles.starterContainer}>
      <QrcodeOutlined style={styles.mainIcon} />
      <Title level={4}>Escáner de QR para Actualizar Órdenes</Title>
      <Text style={{ display: "block", marginBottom: "24px" }}>
        Escanee el código QR de una orden para actualizar su estado a entregado.
      </Text>
      <Button 
        type="primary" 
        size="large" 
        style={styles.startButton} 
        onClick={startScanning} 
        icon={<QrcodeOutlined />}
      >
        Iniciar Escaneo
      </Button>
    </div>
  );

  const renderScanner = () => {
    if (error) {
      return renderErrorState();
    }

    if (!cameraPermission && cameraPermission !== null) {
      return renderPermissionDenied();
    }

    if (scanning) {
      return renderActiveScanner();
    }

    return renderStarterState();
  };

  return (
    <div style={styles.pageContainer}>
      {!scanning && (
        <Button 
          icon={<ArrowLeftOutlined />} 
          onClick={() => router.push("/admin/utils")}
          style={styles.backButton}
        >
          Volver a Utilidades
        </Button>
      )}
      
      {!scanning ? (
        <Card>
          {renderScanner()}
        </Card>
      ) : (
        renderScanner()
      )}
    </div>
  );
};

export default QRScanPage;