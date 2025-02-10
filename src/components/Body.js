"use client";
export default function Body() {
  return (
    <div className="container max-w-7xl mx-auto my-20 pb-20 px-4">
      <div className="text-center mb-12">
        <br />
        <h1 className="text-4xl font-bold text-blue-500 mb-4">
          GPU Collection Data - ระบบจัดการฐานข้อมูลของกราฟิกการ์ด
        </h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column */}
        <div className="bg-white shadow-lg rounded-lg p-6 border-t-4 border-blue-500">
          <h2 className="text-2xl font-bold text-blue-500 mb-4">
            Our data types
          </h2>
          <ul className="list-disc list-inside text-gray-700">
            <li>manufacturer</li>
            <li>productName</li>
            <li>releaseYear</li>
            <li>memSize</li>
            <li>memBusWidth</li>
            <li>gpuClock</li>
            <li>memClock</li>
            <li>unifiedShader</li>
            <li>tmu</li>
            <li>rop</li>
            <li>pixelShader</li>
            <li>vertexShader</li>
            <li>igp</li>
            <li>bus</li>
            <li>memType</li>
            <li>gpuChip</li>
          </ul>
        </div>

        {/* Right Column */}
        <div className="bg-white shadow-lg rounded-lg p-6 flex items-center justify-center border-t-4 border-blue-500">
          <img
            src="/img/homelogo.jpg"
            className="rounded-lg w-full h-auto max-w-sm"
          />
        </div>
      </div>
    </div>
  );
}
