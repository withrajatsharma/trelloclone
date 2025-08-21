import { notFound } from "next/navigation";
import React from "react";

const page = ({ params }) => {
  const { id } = params;

  if (!id) {
    return notFound();
  }

  return <div>{id}</div>;
};

export default page;
