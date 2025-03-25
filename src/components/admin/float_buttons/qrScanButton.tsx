import { QrcodeOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { FloatButton } from "antd/lib";

const FloatButtonQrScan = () => {
  const router = useRouter();

  const handleQrScan = () => {
    router.push("/admin/utils/qr_scan");
  };

  return (
    <FloatButton 
      type="primary"
      icon={<QrcodeOutlined />} 
      onClick={handleQrScan}
      tooltip="Escanear QR"
    />
  );
};

export default FloatButtonQrScan;