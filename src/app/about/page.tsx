'use client';

export default function About() {
  return (
      <>
      {/* Navbar */}
      <nav className="w-full bg-white shadow-md px-6 py-4 flex justify-between items-center">
        <div className="text-2xl font-bold text-blue-700">Ezza_Creative</div>
        <div className="space-x-6">
          <a
            href="/"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Home
          </a>
          <a
            href="/about"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            About
          </a>
          
          <a
            href="/contact"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            contact
          </a>
          <a
            href="/login"
            className="text-gray-600 hover:text-blue-600 transition"
          >
            Login
          </a>
        </div>
      </nav>
    <div className="min-h-screen bg-gradient-to-r from-blue-100 via-white to-blue-50 px-7 py-20 flex flex-col items-center">
        
      <h1 className="text-5xl font-extrabold mb-8 text-blue-600 drop-shadow-lg text-center">
        About Ezza_Creative
      </h1>

      <p className="max-w-3xl text-gray-700 text-lg mb-10 text-center">
        Ezza_Creative is a powerful and easy-to-use platform designed to help businesses create and manage custom forms effortlessly.
        Whether you're in retail, events, healthcare, or any other industry, our platform simplifies data collection through a drag-and-drop form builder.
      </p>

      <h2 className="text-3xl font-semibold mb-6 text-blue-700">How It Works</h2>

      <p className="max-w-3xl text-gray-700 text-lg mb-10 text-center">
        The platform is designed with clear roles to streamline your workflow and ensure smooth collaboration:
      </p>

      <ul className="max-w-3xl text-gray-700 list-disc list-inside space-y-4 mb-12">
        <li>
          <strong>Super Admin:</strong> The core user responsible for designing and building all custom forms using an intuitive drag-and-drop interface. This role has full control over the form structure and logic.
        </li>
        <li>
          <strong>Commercial:</strong> The team member who interacts with clients, filling out the forms on their behalf, managing client data, and ensuring all required information is collected accurately.
        </li>
        <li>
          <strong>Assistant:</strong> Supports the Commercial by managing tasks, coordinating schedules, and handling administrative duties to keep the workflow efficient and organized.
        </li>
      </ul>

      <p className="max-w-3xl text-gray-700 text-lg text-center mb-12">
        Together, these roles form a seamless ecosystem, enabling your business to capture valuable data while optimizing teamwork and productivity.
      </p>

      <img
        src="/about-illustration.svg"
        alt="Teamwork illustration"
        className="w-96 max-w-full mb-12 animate-bounce"
      />

      <p className="max-w-3xl text-gray-600 text-sm text-center italic">
        Built with care to empower your business and simplify form management.
      </p>
    </div>
    </>
  );
  
}
