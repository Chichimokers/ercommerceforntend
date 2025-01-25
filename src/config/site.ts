export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Es Aki",
  description: "Es Aki es una tienda de productos.",
  navItems: [
    {
      label: "Home",
      href: "/",
    },
    {
      label: "Orders",
      href: "/orders",
    },
  ],
  navMenuItems: [
    {
      label: "Profile",
      href: "/profile",
    },
    {
      label: "Settings",
      href: "/settings",
    },
    {
      label: "Help & Feedback",
      href: "/help-feedback",
    },
    {
      label: "Logout",
      href: "/logout",
    },
  ],
  links: {},
};
