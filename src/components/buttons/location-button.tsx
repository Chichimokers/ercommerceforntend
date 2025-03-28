import { Dispatch, SetStateAction } from "react"
import { MapPin } from "lucide-react";
import { Button } from "@heroui/react";
import { useLocationStore } from "@/store/location/location-store";
import { useRouter, usePathname } from "next/navigation";
import { useIsMobile } from "@hooks/useMobile";

export const LocationButton = ({
  className,
  setModalOpen
}: {
  className?: string,
  setModalOpen: Dispatch<SetStateAction<boolean>>
}) => {
  const { hasLocation, location } = useLocationStore();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useIsMobile();

  const handleLocationClick = () => {
    if (pathname.startsWith("/products") && !hasLocation) {
      router.push("/?locationRequired=true");
    } else {
      setModalOpen(true);
    }
  };

  return (
    <div>
      <Button
        onPress={handleLocationClick}
        isIconOnly={isMobile}
        className={`${className} !rounded-full min-w-10 max-w-40 h-10 !border border-default-600 hover:bg-blue-50/50 dark:hover:bg-gray-900/50 hover:border-default-400 transition-none bg-blue-50/50 dark:bg-gray-900/50`}
        variant="bordered">
        <MapPin size={22} opacity={0.8} className="text-default-foreground" />
        {!isMobile && <span>{location.provinceName || "Seleccionar ubicación"}</span>}
      </Button>
    </div>
  );
}