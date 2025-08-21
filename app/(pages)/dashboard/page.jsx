import Button from "@/components/Button";
import { ChevronRight, Edit, FolderKanban, Kanban, Plus } from "lucide-react";
import React, { lazy, Suspense } from "react";

import Sidebar from "@/components/Sidebar";
import WorkSpaceMain from "@/components/WorkSpaceMain";

// // for checking suspense
// const WorkSpaceMain = lazy(
//   () =>
//     new Promise((resolve) =>
//       setTimeout(() => {
//         import("@/components/WorkSpaceMain").then((module) =>
//           resolve({ default: module.default })
//         );
//       }, 4000)
//     )
// );

const page = () => {
  return (
    <main className="w-full flex items-start pt-5 md:px-8 gap-10 ">
      <Suspense
        fallback={
          <aside className="w-[30%] border-t-2 mt-10 px-2">
            <Button className="my-4">Add Workspace</Button>

            {Array.from({ length: 8 }).map((_, i) => {
              return (
                <div key={i} className="mb-3 animate-pulse">
                  <button className="flex items-center justify-between w-full font-semibold p-2 rounded hover:bg-gray-100 hover:pl-5 transition-all">
                    <div className="flex items-center gap-2 leading-none">
                      <FolderKanban />
                      <span>Loading...</span>
                    </div>

                    <ChevronRight size={18} />
                  </button>
                </div>
              );
            })}
          </aside>
        }
      >
        <Sidebar />
      </Suspense>

      <Suspense
        fallback={
          <section className=" w-full  ">
            <div className="flex justify-between items-center w-full gap-5">
              <div className="flex items-center gap-5 pl-10 relative w-fit pb-10 animate-pulse">
                <FolderKanban size={50} />
                <h1 className="text-h2  ">Loading...</h1>
              </div>
            </div>

            <div
              className={
                "grid gap-4 transition-all duration-300 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full  h-[75vh] overflow-auto pb-20 hide-scrollbar"
              }
            >
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col bg-gray-100 h-32 gap-4 p-4 rounded-lg animate-pulse  "
                >
                  <div className="flex items-center justify-center h-full"></div>
                </div>
              ))}
            </div>
          </section>
        }
      >
        <WorkSpaceMain />
      </Suspense>
    </main>
  );
};

export default page;
