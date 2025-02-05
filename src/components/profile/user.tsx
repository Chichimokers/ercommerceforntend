import { User, Link } from "@heroui/react";

const UserComponent = ({
  name,
  email,
  avatar,
  href,
}: {
  name: string;
  email: string;
  avatar: string;
  href: string;
}) => {
  return (
    <User
      avatarProps={{
        src: avatar,
      }}
      description={
        <Link isExternal href={href} size="sm">
          {email}
        </Link>
      }
      name={name}
    />
  );
};

export default UserComponent;
