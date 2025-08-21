import React from "react";
import Image from "next/image";

export default function ErrorPage() {
  return (
    <div className=" w-full h-screen flex justify-center items-center px-4">
      <Image
        src="/images/404.svg"
        alt="404 Not Found"
        width={600}
        height={600}
        className="h-[90%] "
      />
    </div>
  );
}
