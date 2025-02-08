import { Card, CardBody } from "@heroui/react";
import { useMemo } from "react";
import ProductsSlider from "../sliders/products-slider";
import { useRelatedProducts } from "@/hooks/useRelatedProducts";

type RelatedProductSectionProps = {
  id: string;
};

type MessageProps = {
  children: React.ReactNode;
  className?: string;
};

const Message = ({ children, className = "" }: MessageProps) => (
  <p className={`slide-in text-center ${className}`}>{children}</p>
);

export default function RelatedProductSection({
  id,
}: RelatedProductSectionProps) {
  // Los hooks deben estar SIEMPRE en el nivel superior
  const { relatedProducts, loading, error } = useRelatedProducts(id);

  const renderProducts = useMemo(() => {
    if (
      !id ||
      !Array.isArray(relatedProducts) ||
      relatedProducts.length === 0
    ) {
      return [];
    }

    return relatedProducts.filter(
      (product) => product?.id !== id && Boolean(product)
    );
  }, [relatedProducts, id]);

  // Mover la validación después de los hooks
  if (!id) {
    return null;
  }

  const renderContent = () => {
    if (loading) {
      return <Message>Cargando productos relacionados...</Message>;
    }

    if (error) {
      return (
        <Message className="text-red-500">
          Hubo un problema al cargar los productos relacionados. Por favor,
          intenta nuevamente más tarde.
        </Message>
      );
    }

    if (renderProducts.length === 0) {
      return <Message>No hay productos similares para mostrar</Message>;
    }

    return (
      <div className="w-full">
        <ProductsSlider products={renderProducts} />
      </div>
    );
  };

  return (
    <Card className="border-y border-default-200 shadow-none rounded-xl h-max w-full overflow-hidden min-h-[300px] flex flex-col py-4 bg-gray-100 dark:bg-gray-700">
      <h2 className="text-2xl font-extrabold text-gradient bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent text-center">
        Productos Relacionados
      </h2>
      <CardBody>{renderContent()}</CardBody>
    </Card>
  );
}
