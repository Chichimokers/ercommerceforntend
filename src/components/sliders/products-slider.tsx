import React, { useEffect, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import ProductCard from "../cards/product-card";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import { ProductBase } from "@/types/types";

export default function ProductsSlider({
  products,
}: {
  products: ProductBase[];
}) {
  const [isXLScreen, setIsXLScreen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsXLScreen(window.innerWidth >= 1280);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div className={`xs:p-0 xl:px-16 bg-gray-100 dark:bg-gray-800/85`}>
      <Swiper
        navigation={
          isXLScreen
            ? {
              nextEl: ".swiper-button-next",
              prevEl: ".swiper-button-prev",
            }
            : false
        }
        slidesPerView={1}
        spaceBetween={5}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 5,
          },
          540: {
            slidesPerView: 2,
            spaceBetween: 5,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 5,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 5,
          },
        }}
        modules={[Navigation, Pagination]}
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="mt-2 mb-12 justify-items-center">
            <ProductCard product={product} />
          </SwiperSlide>
        ))}
      </Swiper>

      <div
        className={`swiper-button-prev ${isXLScreen ? "flex" : "!hidden"}`}
      ></div>
      <div
        className={`swiper-button-next ${isXLScreen ? "flex" : "!hidden"}`}
      ></div>
    </div>
  );
}
