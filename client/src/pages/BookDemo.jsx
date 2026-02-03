import React from "react";
import JuniorNavbar from "../components/JuniorNavbar.jsx";
// import BookDemoForm from "../components/BookDemoForm";
import BookDemoHero from "./BookDemoHero.jsx";
import BookDemoForm from "./BookDemoForm.jsx";

const BookDemo = () => {
  return (
    <div className="min-h-screen bg-[#FFFDF5]">
      <JuniorNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 items-start">
          <section>
            <p className="inline-flex items-center rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700 mb-4">
              Invest in the future for just ₹9/-
            </p>

            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
              Book a 60-minute demo class for your child
            </h1>

            <p className="text-base md:text-lg text-gray-700 mb-4">
              Most children find their daily lessons boring because they don't see how
              they connect to the real world. Our 60-minute demo class changes that by
              showing your child a faster and much more exciting way to learn. We
              spend this hour connecting with your child to find out what makes them
              curious and how we can make their current school subjects feel easier
              to handle.
            </p>

            <p className="text-base md:text-lg text-gray-700 mb-4">
              Instead of just memorizing facts, they will start learning how to
              actually solve problems on their own.
            </p>

            <p className="text-base md:text-lg text-gray-700 mb-8">
              For just ₹9, you can give your child the tools to feel smarter in class
              and more confident about their future.
            </p>

            <BookDemoForm />
          </section>

          <BookDemoHero />
        </div>
      </main>
    </div>
  );
};

export default BookDemo;
