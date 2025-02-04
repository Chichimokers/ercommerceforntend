import React from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
} from "@heroui/react";
import { signOut, useSession } from "next-auth/react";
import { useModal } from "@/contexts/modal-context";
import { FaUser } from "react-icons/fa6";

const AccountButton = React.memo(({ className }: { className?: string }) => {
  const { data: session } = useSession();
  const { openLogin } = useModal();

  return (
    <>
      <Dropdown placement="bottom-end" className="">
        <DropdownTrigger
          className={cn(
            "cursor-pointer h-10 border-2 border-default-200 hover:border-default-400 bg-opacity-50 dark:bg-opacity-50 bg-white dark:bg-black rounded-full group",
            className
          )}
        >
          <div className="flex flex-row items-center">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-black flex flex-col justify-center z-10 border-y-2 border-r-2 border-default-200 border-collapse hover:border-default-400 bg-opacity-50 group-hover:border-default-400">
              <FaUser size={20} opacity={0.6} className="mx-auto" />
            </div>

            <span className="mx-2 my-auto text-default-500 group-hover:text-default-600 hidden md:block">
              {session?.user.name}
            </span>
            <span className="mx-2 my-auto text-default-500 group-hover:text-default-600 flex md:hidden">
              {session?.user.name?.split(" ")[0]}
            </span>
          </div>
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="shadow">
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
          <DropdownItem key="orders" href="/orders">
            Ordenes
          </DropdownItem>
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
