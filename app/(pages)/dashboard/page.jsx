import React from "react";
import WorkSpaceBar from "@/components/WorkSpaceBar";

const page = () => {
  const workspaces = [
    {
      id: 1,
      name: "Workspace A",
      boards: ["Board 1", "Board 2"],
      members: ["Alice", "Bob"],
    },
    {
      id: 2,
      name: "Workspace B",
      boards: ["Board X", "Board Y", "Board Z"],
      members: ["Charlie", "Dana"],
    },
  ];

  return (
    <main className="w-full flex items-start pt-5 md:px-8">
      <WorkSpaceBar workspaces={workspaces} />

      <section className="bg-blue-200 h-full flex-1"></section>
    </main>
  );
};

export default page;
