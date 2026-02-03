import React from "react";
import DemoImage from "../assets/demoIpagemage.png";

const BookDemoHero = () => {
  return (
    <section className="w-full lg:sticky lg:top-28">
      <div className="relative h-64 sm:h-72 md:h-[380px] lg:h-[420px] rounded-3xl border-2 border-orange-200 bg-orange-50 overflow-hidden">
        <img
          src={DemoImage}
          alt="AcadLearn Jr demo"
          className="w-full h-full object-cover"
        />
      </div>
    </section>
  );
};

export default BookDemoHero;
