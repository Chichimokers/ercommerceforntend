"use client";

import { Refine, type AuthProvider } from "@refinedev/core";
import { RefineKbar, RefineKbarProvider } from "@refinedev/kbar";
import { SessionProvider, signIn, signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import React from "react";
import Image from "next/image";
import routerProvider from "@refinedev/nextjs-router";
import { dataProvider } from "@providers/data-provider";
import { Spinner } from "@heroui/react";

type RefineContextProps = {};

export const RefineContext = (
  props: React.PropsWithChildren<RefineContextProps>
) => {
  return (
    <SessionProvider>
      <App {...props} />
    </SessionProvider>
  );
};

type AppProps = {};

const App = (props: React.PropsWithChildren<AppProps>) => {
  const { data, status } = useSession();
  const to = usePathname();

  if (status === "loading") {
    return (
      <div className="h-screen flex flex-col justify-center items-center dark:bg-black gap-4">
        <div className="w-[300px] h-[100px] relative aspect-[3/1]">
          <Image
            src={"/logonav.png"}
            fill
            alt="EsAki"
            className="object-contain"
            sizes="300px"
            priority
          />
        </div>
        <Spinner />
      </div>
    );
  }

  const authProvider: AuthProvider = {
    login: async () => {
      signIn("credentials", {
        callbackUrl: to ? to.toString() : "/",
        redirect: true,
      });
      return { success: true };
    },
    logout: async () => {
      signOut({
        redirect: true,
        callbackUrl: "/api/auth/signout",
      });
      return { success: true };
    },
    onError: async (error) => {
      if (error.response?.status === 401) {
        return {
          logout: true,
        };
      }

      return {
        error,
      };
    },
    check: async () => {
      console.log(status)
      return status === "authenticated"
        ? { authenticated: true }
        : {
          authenticated: false,
          redirectTo: "/api/auth/signin?callbackUrl=" + encodeURIComponent(window.location.href)
        };
    },
    getPermissions: async () => {
      return null;
    },
    getIdentity: async () => {
      if (data?.user) {
        const { user } = data;
        return {
          name: user.name,
          avatar: user.image,
        };
      }

      return null;
    },
  };

  return (
    <>
      <RefineKbarProvider>
        <Refine
          routerProvider={routerProvider}
          dataProvider={dataProvider}
          authProvider={authProvider}
          resources={[
            {
              name: "blog_posts",
              list: "/blog-posts",
              create: "/blog-posts/create",
              edit: "/blog-posts/edit/:id",
              show: "/blog-posts/show/:id",
              meta: {
                canDelete: true,
              },
            },
            {
              name: "categories",
              list: "/categories",
              create: "/categories/create",
              edit: "/categories/edit/:id",
              show: "/categories/show/:id",
              meta: {
                canDelete: true,
              },
            },
          ]}
          options={{
            syncWithLocation: true,
            warnWhenUnsavedChanges: true,
            useNewQueryKeys: true,
          }}
        >
          {props.children}
          <RefineKbar />
        </Refine>
      </RefineKbarProvider>
    </>
  );
};
