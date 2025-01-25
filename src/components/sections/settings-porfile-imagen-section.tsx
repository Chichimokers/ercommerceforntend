import React from "react";
import { DEFAULT_AVATAR } from "@/types/default-avatar";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { useSession } from "next-auth/react";
import Image from "next/image";

const ProfileImageSection = ({
  image,
  username,
  email,
}: {
  image?: string;
  username?: string;
  email?: string;
}) => {
  const windowWidth = useWindowWidth();
  const { data: session, status } = useSession();

  return (
    <div className="flex flex-col items-center w-full bg-white dark:bg-transparent border-b border-default-200 shadow-sm overflow-hidden">
      <div className="relative w-full h-48 sm:h-56 md:h-64 lg:h-72">
        <Image
          src={windowWidth > 512 ? "/banner_2.png" : "/banner.png"}
          alt="Imagen de portada"
          className="w-full h-full object-cover"
          fill
        />
      </div>

      <div className="relative -mt-16 sm:-mt-20 md:-mt-24">
        <div className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-full ring-2 ring-default-400 overflow-hidden">
          <Image
            src={image || DEFAULT_AVATAR}
            alt="Imagen de perfil"
            className="w-full h-full object-cover"
            width={160}
            height={160}
          />
        </div>
      </div>

      <div className="mt-4 mb-10 text-center px-4">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-semibold text-gray-800 dark:text-gray-100">
          {session?.user.name || "Nombre del Usuario"}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          {session?.user.email || "Correo Electrónico"}
        </p>
      </div>
    </div>
  );
};

export default ProfileImageSection;
