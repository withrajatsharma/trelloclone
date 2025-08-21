import React from "react";
import WorkSpaceBar from "./WorkSpaceBar";
import { unstable_cache } from "next/cache";
import verifyToken from "@/app/api/verifyToken";
import { getUserWorkspaces } from "@/app/api/workspace/route";
import { notFound } from "next/navigation";
import mongoose from "mongoose";

const Sidebar = async () => {
  const user = await verifyToken();
  if (!user) return notFound();
  const userId = new mongoose.Types.ObjectId(user?.id);

  const cachedFunction = unstable_cache(
    () => getUserWorkspaces(userId),
    [`workspaces`],
    {
      revalidate: 3600,
      tags: ["workspaces",`user-workspaces-${userId}`],
    }
  );
  const workspaces = await cachedFunction();

  const serializedWorkspaces = workspaces?.map((workspace) => ({
    _id: workspace._id?.toString() || "",
    ownerId: workspace.ownerId.toString(),
    name: workspace.name
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" "),
  }));

  if (!workspaces) {
    return notFound();
  }

  return <WorkSpaceBar workspaces={serializedWorkspaces} />;
};

export default Sidebar;
