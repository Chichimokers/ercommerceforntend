import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Grid, Pagination } from "swiper/modules";

import "swiper/css";
import "swiper/css/grid";
import "swiper/css/pagination";

import { Comment } from "@/types/types";
const CommentsSlider = ({ comments }: { comments: Comment[] }) => {
  return (
    <div className="m-auto h-[450px] md:h-[270px] sm:h-[250px] xxs:h-[270px] xs:h-[320px] lg:h-[290px] xl:h-[250px] 2xl:h-[250px]">
      <Swiper
        className="h-full"
        grid={{
          rows: 1,
        }}
        modules={[Grid, Pagination]}
        pagination={{
          clickable: true,
        }}
        slidesPerView={1}
        spaceBetween={20}
        breakpoints={{
          640: {
            grid: {
              rows: 1,
            },
            slidesPerView: 2,
            spaceBetween: 10,
          },
          1024: {
            grid: {
              rows: 1,
            },
            slidesPerView: 3,
            spaceBetween: 10,
          },
        }}
      >
        {comments.map((comment) => (
          <SwiperSlide key={comment.id}>
            <div className="bg-slate-300 bg-opacity-40 dark:bg-zinc-600 dark:bg-opacity-40 p-4 rounded-xl shadow m-4 h-[180px] lg:h-[220px] xxs:h-[200px] xs:h-[250px] xl:h-[180px] 2xl:h-[180px]">
              <p className="text-2xl font-bold mb-2 select-none cursor-default">
                &quot;{comment.text}&quot;
              </p>
              <span className="text-gray-500 dark:text-zinc-500 select-none cursor-default">
                - {comment.author}
              </span>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default CommentsSlider;
