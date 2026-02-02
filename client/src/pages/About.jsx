import React from "react";
import Navbar from "../components/Navbar";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="container mx-auto px-4 py-16">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">About Us</h1>
        <p className="text-lg text-gray-700">
          Welcome to AcadLearn! We are dedicated to providing the best learning
          experience for everyone, from curious juniors to ambitious
          professionals.
        </p>
      </div>
    </div>
  );
};

export default About;
