import { Card, CardBody } from "@heroui/react";
import React from "react";
import Link from "next/link";

const CategoryCard = ({
  className,
  size,
  icon,
  text,
  url,
}: {
  className?: string;
  size: string;
  icon: React.ReactNode;
  text: string;
  url: string;
}) => {
  return (
    <Card
      isHoverable
      isPressable
      className={`shadow-lg ${className}`}
      shadow="sm"
      as={Link}
      href={url}
    >
      <CardBody>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            textAlign: "center",
            height: "100%",
            alignItems: "center",
            backgroundColor: "inherit",
            cursor: "pointer",
          }}
        >
          <div
            className="mb-2"
            style={{ fontSize: size === "lg" ? "2rem" : "1.5rem" }}
          >
            {icon}
          </div>
          <h4 className="select-none cursor-default">{text}</h4>
        </div>
      </CardBody>
    </Card>
  );
};

export default CategoryCard;
