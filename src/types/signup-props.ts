import { UserData } from "./types";

export type SignUpProps = {
  title: string;
  onSignUpSuccess?: (user: { email: string, username: string, password: string }) => void;
  onSwitchToOther: () => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  closeModals:Function,
  DataLayoutLevel?:UserData,
  SetDataLayoutLevel?:Function

};
