import React, { memo } from "react";
import WorkSpaceContent from "./WorkSpaceContent";
import verifyToken from "@/app/api/verifyToken";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { getWorkspace } from "@/app/api/workspace/[id]/route";
import { unstable_cache } from "next/cache";

const WorkSpaceMain = async ({ searchParams }) => {
  const params = await searchParams;
  const workSpaceId = params.workspace || "";

  if (!workSpaceId) {return null;}

  const user = await verifyToken();
  const userId = new mongoose.Types.ObjectId(user?.id);

  if (!userId) {
    return notFound();
  }

//   const cachedFunction = unstable_cache(
//     () => getWorkspace(new mongoose.Types.ObjectId(workSpaceId), userId),
//     [`workspace-${workSpaceId}`],
//     {
//       revalidate: 3600,
//       tags: [`workSpace-${workSpaceId}`],
//     }
//   );
//   const workSpace = await cachedFunction();


const workSpace = await getWorkspace(
    new mongoose.Types.ObjectId(workSpaceId),
    userId
  );

//   console.log(`workSpace:`, workSpace);

const serializedWorkSpace = JSON.parse(JSON.stringify(workSpace));

  if (!workSpace) {
    return notFound();
  }

  return (
    <WorkSpaceContent
      searchParams={searchParams}
      workSpace={serializedWorkSpace}
    />
    // <div></div>
  );
};

export default WorkSpaceMain;
