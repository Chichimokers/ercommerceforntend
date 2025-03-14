import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { HiChevronRight, HiHome } from 'react-icons/hi';

export type BreadcrumbItem = {
  label: string;
  href?: string;
  icon?: React.ReactNode;
};

type BreadcrumbsProps = {
  items: BreadcrumbItem[];
  homeHref?: string;
  showHomeIcon?: boolean;
  className?: string;
  separatorIcon?: React.ReactNode;
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  items,
  homeHref = '/',
  showHomeIcon = true,
  className = '',
  separatorIcon = <HiChevronRight className="text-gray-400" />
}) => {
  const pathname = usePathname();

  // Container animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  // Item animation
  const itemVariants = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <nav aria-label="Breadcrumbs" className={`mb-6 ${className}`}>
      <motion.ol
        className="flex items-center flex-wrap"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Home item */}
        {showHomeIcon && (
          <motion.li variants={itemVariants} className="flex items-center text-sm">
            <Link
              href={homeHref}
              className="flex items-center text-gray-500 hover:text-primary-500 transition-colors"
            >
              <HiHome className="w-4 h-4 mr-1" />
              <span className="sr-only md:not-sr-only">Inicio</span>
            </Link>
            <span className="mx-2 text-gray-400">{separatorIcon}</span>
          </motion.li>
        )}

        {/* Dynamic items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isActive = item.href === pathname;

          return (
            <motion.li
              key={`breadcrumb-${index}`}
              variants={itemVariants}
              className={`flex items-center text-sm ${isActive ? 'text-primary-600' : ''}`}
            >
              {!isLast && item.href ? (
                <>
                  <Link
                    href={item.href}
                    className="flex items-center text-gray-500 dark:text-gray-400 hover:text-primary-500 dark:hover:text-primary-500 transition-colors"
                  >
                    {item.icon && <span className="mr-1">{item.icon}</span>}
                    <span>{item.label}</span>
                  </Link>
                  <span className="mx-2 text-gray-400">{separatorIcon}</span>
                </>
              ) : (
                <span className="flex items-center font-medium text-gray-800 dark:text-gray-200 select-none">
                  {item.icon && <span className="mr-1">{item.icon}</span>}
                  <span>{item.label}</span>
                </span>
              )}
            </motion.li>
          );
        })}
      </motion.ol>
    </nav>
  );
};