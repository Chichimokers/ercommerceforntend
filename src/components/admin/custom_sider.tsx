"use client";
import { ThemedSiderV2 } from "@refinedev/antd";
import { AppstoreOutlined } from "@ant-design/icons";
import Image from "next/image";
import { useMenu, useNavigation, useGetIdentity } from "@refinedev/core";
import { usePathname } from "next/navigation";

const CustomSider = () => {
  const { menuItems } = useMenu();
  const pathname = usePathname();
  const { push } = useNavigation();
  const { data: identity } = useGetIdentity<{ role: string }>();


  const filteredMenuItems = menuItems.filter(item => {
 
    const requiredRole = item?.meta?.requiredRole;
    if (!requiredRole) return true;
    
    if (Array.isArray(requiredRole)) {
      return requiredRole.includes(identity?.role);
    }
    return requiredRole === identity?.role;
  });

  return (
    <ThemedSiderV2
      fixed
      Title={({ collapsed }) => (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            padding: collapsed ? "0 12px" : "0 16px",
          }}
        >
          {collapsed ? (
            <AppstoreOutlined style={{ fontSize: "24px", color: "#3b82f6" }} />
          ) : (
            <Image
              alt="Company Logo"
              loading="lazy"
              width={160}
              height={60}
              quality={50}
              src="/logonav.png"
              className="w-auto object-contain flex-shrink-0"
            />
          )}
        </div>
      )}
      render={({ items, logout }) => (
        <>
          {filteredMenuItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <div 
                key={item.key}
                onClick={() => item.route && push(item.route)}
                className={`ant-menu-item ${isActive ? 'ant-menu-item-selected' : ''}`}
                style={{
                  paddingLeft: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                {item.icon && (
                  <span 
                    role="img" 
                    aria-label={item.label} 
                    className="anticon ant-menu-item-icon"
                  >
                    {item.icon}
                  </span>
                )}
                <span className="ant-menu-title-content">{item.label}</span>
              </div>
            );
          })}
          {logout}
        </>
      )}
    />
  );
};

export default CustomSider;