import React, { memo } from "react";
import WorkSpaceContent from "./WorkSpaceContent";
import verifyToken from "@/app/api/verifyToken";
import { notFound } from "next/navigation";
import mongoose from "mongoose";
import { getWorkspace } from "@/app/api/workspace/[id]/route";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import { Board } from "@/models/Board";
import Link from "next/link";
import { connectToDB } from "@/services/connectdb";
import { WorkSpace } from "@/models/Workspace";

const WorkSpaceMain = async ({ searchParams }) => {
  const params = await searchParams;
  const workSpaceId = params?.workspace || "";

  const searchQuery = params?.search || "";

  const user = await verifyToken();
  const userId = new mongoose.Types.ObjectId(user?.id);

  if (!userId) {
    return notFound();
  }

  if (searchQuery) {
    await connectToDB();

    const workSpacesUserPartOf = await WorkSpace.find({
      members: userId,
    }).select("_id");

    const workSpaceIds = workSpacesUserPartOf.map((ws) => ws._id);

    const trimmedQuery = (searchQuery || "").trim();

    const boards = await Board.find({
      name: { $regex: trimmedQuery, $options: "i" },
      workSpaceId: { $in: workSpaceIds }, // only boards in those workspaces
    }).sort({ position: 1 });

    return (
      <div
        className={
          "grid gap-4 transition-all duration-300 grid-cols-3 md:grid-cols-4 xl:grid-cols-5 mt-20 px-8 w-full  h-[75vh] overflow-auto pb-20 hide-scrollbar"
        }
      >
        {boards.length === 0 ? (
          <div className="col-span-full flex justify-center items-center h-32">
            <p className="text-gray-500">
              No boards found matching "{searchQuery}"
            </p>
          </div>
        ) : (
          boards.map((board, i) => (
            <Link
              href={`/dashboard/${board._id}`}
              key={i}
              className="flex flex-col cursor-pointer h-32 gap-4 p-4 rounded-lg bg-blue-200 hover:bg-blue-300 transition-all duration-300"
            >
              <div className="flex items-center justify-center h-full">
                <p>{board.name}</p>
              </div>
            </Link>
          ))
        )}
      </div>
    );
  }

  if (!workSpaceId) {
    return (
      <div className=" w-full h-[85vh] flex justify-center items-center">
        <Image
          src={"/images/dashboard.svg"}
          alt="Dashboard"
          width={500}
          height={500}
          className="w-[500px]"
          priority
        />
      </div>
    );
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
      // searchParams={searchParams}
      currUserId={user?.id}
      workSpace={serializedWorkSpace}
    />
    // <div></div>
  );
};

export default WorkSpaceMain;
