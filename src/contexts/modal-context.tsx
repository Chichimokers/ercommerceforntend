"use client";

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
  useState,
  useMemo,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ModalAction, ModalState, ModalType, UserData } from "@/types/types";
import { useSession } from "next-auth/react";

// Estado inicial
const initialState: ModalState = {
  isLoginOpen: false,
  isSignUpOpen: false,
  isVerifyOpen: false,
  canRenderLogin: false,
  canRenderSignUp: false,
  canRenderVerify: false,
  currentModal: null,
};

// Reducer
function modalReducer(state: ModalState, action: ModalAction): ModalState {
  switch (action.type) {
    case "OPEN_LOGIN":
      return {
        ...state,
        isLoginOpen: true,
        isSignUpOpen: false,
        canRenderLogin: false,
        currentModal: "login",
      };
    case "OPEN_SIGNUP":
      return {
        ...state,
        isLoginOpen: false,
        isSignUpOpen: true,
        canRenderSignUp: false,
        currentModal: "signup",
      };
    case "OPEN_VERIFY":
      return {
        ...state,
        isVerifyOpen: true,
        canRenderVerify: false,
        currentModal: "verify",
      };
    case "CLOSE_MODALS":
      return {
        ...state,
        isLoginOpen: false,
        isSignUpOpen: false,
        isVerifyOpen: false,
        canRenderLogin: false,
        canRenderSignUp: false,
        canRenderVerify: false,
        currentModal: null,
      };
    case "CLOSE_VERIFY":
      return {
        ...state,
        isVerifyOpen: false,
        canRenderVerify: false,
        currentModal:
          state.currentModal === "verify" ? null : state.currentModal,
      };
    case "SET_RENDER_LOGIN":
      return { ...state, canRenderLogin: true };
    case "SET_RENDER_SIGNUP":
      return { ...state, canRenderSignUp: true };
    case "SET_RENDER_VERIFY":
      return { ...state, canRenderVerify: true };
    default:
      return state;
  }
}

// Contexto
const ModalContext = createContext<
  | (ModalState & {
      openLogin: () => void;
      openSignUp: () => void;
      openVerify: () => void;
      closeModals: () => void;
      closeVerify: () => void;
      isAuthorizationInProgress: boolean;
      setIsAuthorizationInProgress: React.Dispatch<
        React.SetStateAction<boolean>
      >;
      data: UserData | undefined;
      setData: React.Dispatch<React.SetStateAction<UserData | undefined>>;
    })
  | undefined
>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session } = useSession();

  const [state, dispatch] = useReducer(modalReducer, initialState);
  const [isAuthorizationInProgress, setIsAuthorizationInProgress] =
    useState(false);
  const [data, setData] = useState<UserData | undefined>(undefined);

  const RENDER_DELAY = 300;

  // Helper para actualizar query params
  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      value === null ? params.delete(name) : params.set(name, value);
      return params.toString();
    },
    [searchParams]
  );

  // Sincronización con URL
  useEffect(() => {
    const modal = searchParams.get("modal") as ModalType;
    const handleModalOpen = (modalType: ModalType | null) => {
      if (!session && !isAuthorizationInProgress && modalType) {
        switch (modalType) {
          case "login":
            dispatch({ type: "OPEN_LOGIN" });
            setTimeout(
              () => dispatch({ type: "SET_RENDER_LOGIN" }),
              RENDER_DELAY
            );
            break;
          case "signup":
            dispatch({ type: "OPEN_SIGNUP" });
            setTimeout(
              () => dispatch({ type: "SET_RENDER_SIGNUP" }),
              RENDER_DELAY
            );
            break;
          case "verify":
            dispatch({ type: "OPEN_VERIFY" });
            setTimeout(
              () => dispatch({ type: "SET_RENDER_VERIFY" }),
              RENDER_DELAY
            );
            break;
        }
      }
    };
    handleModalOpen(modal);
  }, [searchParams, session, isAuthorizationInProgress]);

  // Métodos optimizados
  const openLogin = useCallback(() => {
    if (!session) {
      router.replace(`${pathname}?${createQueryString("modal", "login")}`);
    }
  }, [session, pathname, createQueryString, router]);

  const openSignUp = useCallback(() => {
    if (!session) {
      router.replace(`${pathname}?${createQueryString("modal", "signup")}`);
    }
  }, [session, pathname, createQueryString, router]);

  const openVerify = useCallback(() => {
    const previousModal = searchParams.get("modal");
    const params = new URLSearchParams();
    params.set("modal", "verify");
    if (previousModal) params.set("previousModal", previousModal);

    router.replace(`${pathname}?${params.toString()}`);
  }, [pathname, searchParams, router]);

  const closeModals = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("modal");
    params.delete("previousModal");

    router.replace(`${pathname}?${params.toString()}`);
    dispatch({ type: "CLOSE_MODALS" });
  }, [pathname, searchParams, router]);

  const closeVerify = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    const previousModal = params.get("previousModal");

    if (params.get("modal") === "verify") {
      params.delete("modal");
      params.delete("previousModal");
      if (previousModal) params.set("modal", previousModal);
    }

    router.replace(`${pathname}?${params.toString()}`);
    dispatch({ type: "CLOSE_VERIFY" });
  }, [pathname, searchParams, router]);

  // Memoizar el contexto
  const contextValue = useMemo(
    () => ({
      ...state,
      openLogin,
      openSignUp,
      openVerify,
      closeModals,
      closeVerify,
      isAuthorizationInProgress,
      setIsAuthorizationInProgress,
      data,
      setData,
    }),
    [
      state,
      openLogin,
      openSignUp,
      openVerify,
      closeModals,
      closeVerify,
      isAuthorizationInProgress,
      data,
    ]
  );

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error("useModal must be used within a ModalProvider");
  return context;
};
