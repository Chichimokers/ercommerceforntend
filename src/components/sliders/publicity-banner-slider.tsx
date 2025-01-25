"use client";
import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, Autoplay } from "swiper/modules";

import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/autoplay";
import { PublicityBanner } from "@/types/types";
import Link from "next/link";
import Image from "next/image";

export default function PublicityBannerSlider({
  banners,
  className,
}: {
  banners: PublicityBanner[];
  className?: string;
}) {
  return (
    <div className="slide-left m-auto w-full h-[100px] sm:h-[200px] md:h-[300px]">
      <Swiper
        className={`${className} h-full`}
        modules={[Pagination, Autoplay]}
        pagination={{
          clickable: true,
        }}
        autoplay={{
          delay: 3000,
          disableOnInteraction: false,
        }}
        slidesPerView={1}
        spaceBetween={10}
      >
        {banners.map((banner) => (
          <SwiperSlide key={banner.id}>
            <Link href={banner.link || "#"} rel="">
              <Image
                src={banner.image}
                alt={banner.altText}
                className="w-full h-full object-fill"
                height={300}
                width={1200}
                loading="lazy"
                priority={false}
              />
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
