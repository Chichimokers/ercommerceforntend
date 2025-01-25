export type LoginProps = {
  title: string;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToOther: () => void;
  closeModals:Function

};
