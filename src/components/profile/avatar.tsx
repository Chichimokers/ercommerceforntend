import { Avatar } from "@heroui/react";
import { DEFAULT_AVATAR } from "@/types/default-avatar";
const UserAvatar = ({ image }: { image?: string }) => {
  return (
    <div className="flex gap-4 items-center">
      <Avatar src={image || DEFAULT_AVATAR} />
    </div>
  );
};

export default UserAvatar;
