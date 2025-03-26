import { CommentOutlined, CustomerServiceOutlined, ToolOutlined } from "@ant-design/icons";
import { FloatButton } from "antd";
import FloatButtonClearCache from "./cacheButton";
import { useSession } from "next-auth/react";
import FloatButtonQrScan from "./qrScanButton";
import { useTheme } from "next-themes";


function FloatButtonsGroupComponent() {
  const { data: session } = useSession()
  const { resolvedTheme, setTheme } = useTheme();

  return (
    <>
      <FloatButton.Group
        trigger="hover"
        type= {`${resolvedTheme == "dark" ? "primary" : "default"}`}
        style={{ insetInlineEnd: 24 }}
        icon={<ToolOutlined />}
      >
        {
          (Number(session?.user.role) == 2) &&
          
          <FloatButtonClearCache />
          
        }
        <FloatButtonQrScan />

      </FloatButton.Group>
    </>
  )
}




export default FloatButtonsGroupComponent;