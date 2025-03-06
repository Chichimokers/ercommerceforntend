import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
  Tooltip,
} from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { useModal } from "@/contexts/modal-context";
import { FaUser } from "react-icons/fa6";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Función para generar color basado en el nombre
const generateColorFromName = (name: string) => {
  const colors = [
    'bg-red-500', 'bg-blue-500', 'bg-green-500',
    'bg-purple-500', 'bg-pink-500', 'bg-orange-500'
  ];
  const charCode = name.charCodeAt(0) || 0;
  return colors[charCode % colors.length];
};

const AccountButton = React.memo(({ className }: { className?: string }) => {
  const { data: session } = useSession();
  const { openLogin } = useModal();
  const pathname = usePathname();
  const isOrdersPage = pathname === "/orders";

  return (
    <>

      <Dropdown placement="bottom-end" className="">
        <Tooltip
          className="h-auto"
          content={
            session?.user.name
          }
          delay={200}
        >
          <div className="inline-flex">
            <DropdownTrigger
              className={cn(
                "cursor-pointer h-10 w-10 border border-default-600 hover:border-default-400 bg-blue-50/50 dark:bg-gray-900/50 rounded-full group",
                className
              )}
            >
              <div className="flex flex-row items-center">
                <div
                  className={`w-full h-full rounded-full flex items-center justify-center text-white text-xl font-bold 
                ${session?.user?.name ? generateColorFromName(session.user.name) : 'bg-default-200'}`}
                >
                  {session?.user?.name ? session.user.name[0].toUpperCase() : <FaUser size={20} opacity={0.6} />}
                </div>
              </div>
            </DropdownTrigger>
          </div>
        </Tooltip>
        <DropdownMenu aria-label="Profile Actions" variant="faded">
          {session && (
            <DropdownItem key="profile" className="h-14 gap-2">
              <p className="font-semibold">Signed in as</p>
              <p className="font-semibold">{session.user.email}</p>
            </DropdownItem>
          )}
          {!session ? (
            <>
              <DropdownItem
                color="primary"
                key="sign in"
                onPress={() => openLogin()}
              >
                Iniciar sesión
              </DropdownItem>
            </>
          ) : null}
          {!isOrdersPage ?
            <DropdownItem as={Link} key="orders" href="/orders">
              Ordenes
            </DropdownItem>
            : null
          }

          <DropdownItem key="help_and_feedback">
            Ayuda y retroalimentación
          </DropdownItem>
          {session && (
            <DropdownItem
              key="logout"
              onPress={() => signOut({ callbackUrl: "/", redirect: false })}
              color="danger"
            >
              Finalizar sesión
            </DropdownItem>
          )}
        </DropdownMenu>
      </Dropdown>

    </>
  );
});

AccountButton.displayName = "AccountButton";

export default AccountButton;
