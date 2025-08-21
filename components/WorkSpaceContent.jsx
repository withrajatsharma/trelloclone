'use client';
import { Edit, FolderKanban, Plus, X } from 'lucide-react'
import React, { useState } from 'react'
import Button from './Button'
import LoadingButton from './LoadingButton';

const WorkSpaceContent = () => {

    const [isLoading, setIsLoading] = useState(false);
    

      const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

//   const handleSaveWorkspace = async () => {
//     if (!newWorkspaceName.trim()) {
//       customToast.error("Please enter a workspace name.");
//       return;
//     }

//     if (isLoading) return;

//     setIsLoading(true);

//     try {
//       const res = await axios.post("/api/workspace", {
//         name: newWorkspaceName.toLowerCase().trim(),
//       });

//       if (res && res?.data && res?.data?.success) {
//         customToast.success(
//           res?.data?.message || "Workspace created successfully!"
//         );
//         setNewWorkspaceName("");
//         setIsModalOpen(false);
//         handleWorkspaceClick(res.data.workspace.id);
//       } else {
//         customToast.error(res?.data?.message || "Failed to create workspace.");
//       }
//     } catch (error) {
//       console.log("Error saving workspace:", error?.message);
//       console.log(`error :`, error?.response);
//       customToast.error(
//         error?.response?.data?.message ||
//           "Please try again. (workspace creation error)"
//       );
//     } finally {
//       setIsLoading(false);
//     }
//   };

  const handleCancel = () => {
    if (isLoading) return;
    setNewBoardName("");
    setIsModalOpen(false);
  };

  const clearInput = () => setNewBoardName("");

  return (
     <section className=" w-full  ">

        <div className="flex justify-between items-center w-full gap-5 pb-10">

        <div className="flex items-center  gap-5 pl-10 relative w-fit">
          <FolderKanban size={50} />
          <h1 className="text-h2 ">Testing</h1>
          <Edit className="absolute -right-8 top-2 cursor-pointer" size={20} />
        </div>

        <Button className={"bg-gradient-to-br from-red-50 to-red-200"}>Delete</Button>

        </div>

        <div
          className={
            "grid gap-4 transition-all duration-300 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full  h-[75vh] overflow-auto pb-20 hide-scrollbar"
          }
        >
          <div
            onClick={() => setIsModalOpen(true)}
          className="flex cursor-pointer flex-col gap-4 p-4 h-32 w-full rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300">
            <div className="flex flex-col gap-2 items-center justify-center w-full h-full">
              <Plus />
              <span>Create New Board</span>
            </div>
          </div>

          {Array.from({ length: 25 }).map((_, i) => (
            <div
              key={i}
              className="flex flex-col cursor-pointer h-32 gap-4 p-4 rounded-lg bg-blue-200 hover:bg-blue-300 transition-all duration-300"
            >
              <div className="flex items-center justify-center h-full">
                <p>Board</p>
              </div>
            </div>
          ))}
        </div>

  {isModalOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center "
            onClick={handleCancel}
          >
            <div
              className="bg-white rounded-lg p-6 w-[90%] md:w-[30%] relative"
              onClick={(e) => e.stopPropagation()}
            >
              <h2 className="text-lg font-semibold mb-4">Create Board</h2>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Board Name"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {newBoardName && (
                  <button
                    onClick={clearInput}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  onClick={handleCancel}
                  className="bg-gray-200 text-black hover:bg-gray-300 !text-sm"
                >
                  Cancel
                </Button>
                <LoadingButton
                  isLoading={isLoading}
                  loadingText={"saving..."}
                //   onClick={handleSaveWorkspace}
                  className=" !text-sm"
                >
                  Save
                </LoadingButton>
              </div>
            </div>
          </div>
        </>
      )}


      </section>
  )
}

export default WorkSpaceContent