"use client";
export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-blue-700 to-blue-300 text-white py-2 px-4 w-full shadow-md text-center fixed bottom-0">
      <p className="text-lg font-bold">GPU Collection Data</p>
      <p className="text-sm">Walailak University</p>
      <p className="text-sm">
        ©2025 GPU Collection Data.{" "}
        <a
          href="https://www.kaggle.com/datasets/alanjo/graphics-card-full-specs?resource=download"
          target="_blank"
          rel="noopener noreferrer"
        >
          Kaggle.
        </a>
      </p>
    </footer>
  );
}
