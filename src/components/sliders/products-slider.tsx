import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Navigation } from "swiper/modules";
import ProductCard from "../cards/product/product-card";
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
    <div className={`relative`}>
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
        spaceBetween={16}
        pagination={{
          clickable: true,
        }}
        breakpoints={{
          320: {
            slidesPerView: 1,
            spaceBetween: 24,
          },
          540: {
            slidesPerView: 2,
            spaceBetween: 16,
          },
          768: {
            slidesPerView: 3,
            spaceBetween: 16,
          },
          1024: {
            slidesPerView: 4,
            spaceBetween: 16,
          },
          1280: {
            slidesPerView: 5,
            spaceBetween: 16,
          },
          1536: {
            slidesPerView: 6,
            spaceBetween: 16,
          },
        }}
        modules={[Navigation, Pagination]}
        className="pb-12"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="flex items-center justify-center justify-items-center mb-12">
            <div className="w-full max-w-[280px]">
              <ProductCard
                product={product}
                className="shadow-sm hover:shadow-md transition-shadow border border-default-300"
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {isXLScreen && (
        <>
          <div className="swiper-button-prev !text-primary-500 !bg-white/80 hover:!bg-white !w-10 !h-10 !rounded-full !shadow-md after:!text-lg"></div>
          <div className="swiper-button-next !text-primary-500 !bg-white/80 hover:!bg-white !w-10 !h-10 !rounded-full !shadow-md after:!text-lg"></div>
        </>
      )}
    </div>
  );
}