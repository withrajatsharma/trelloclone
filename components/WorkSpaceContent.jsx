"use client";
import { Edit, FolderKanban, Plus, Save, Trash, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import Button from "./Button";
import LoadingButton from "./LoadingButton";
import { customToast } from "./CustomToast";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const WorkSpaceContent = ({ workSpace }) => {

  const params = useSearchParams();

  const workSpaceId = params.get("workspace") || "";
  const tab = params.get("tab") || "boards";


  const [isEditing, setIsEditing] = useState(false);

  const [name, setName] = useState(workSpace?.name || "");
  useEffect(() => {
    setName(workSpace?.name || "");
  }, [workSpace, workSpaceId]);




  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBoardName, setNewBoardName] = useState("");

  const handelSaveBoard = async () => {
    if (!newBoardName.trim()) {
      customToast.error("Please enter a Board name.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await axios.post("/api/board", {
        name: newBoardName.toLowerCase().trim(),
        workSpaceId: workSpaceId,
      });

      if (res && res?.data && res?.data?.success) {
        customToast.success(
          res?.data?.message || "Board created successfully!"
        );
        setNewBoardName("");
        setIsModalOpen(false);
        // handleBoardClick(res.data.workspace.id);
      } else {
        customToast.error(res?.data?.message || "Failed to create Board.");
      }
    } catch (error) {
      console.log("Error saving Board:", error?.message);
      console.log(`error :`, error?.response);
      customToast.error(
        error?.response?.data?.message ||
          "Please try again. (Board creation error)"
      );
    } finally {
      setIsLoading(false);
    }
  };


    const handleSave = async() => {
    if (name.trim() === "" || name.trim() === workSpace?.name) return;

    if(isLoading) return;

    setIsLoading(true);

    try {
      const res = await axios.patch(`/api/workspace/`, {
        name: name.trim(),
        workSpaceId: workSpaceId,
      });
      if (res && res?.data && res?.data?.success) {
        customToast.success(
          res?.data?.message || "Workspace updated successfully!"
        );
        setName(name.trim());
        router.refresh();
        setIsEditing(false);
      } else {
        customToast.error(res?.data?.message || "Failed to update Workspace.");
      }
    } catch (error) {
     setIsEditing(false);
      setName(workSpace?.name || "");
      console.log("Error updating Workspace:", error?.message);
      console.log(`error :`, error?.response);
      customToast.error(
        error?.response?.data?.message ||
          "Please try again. (Workspace update error)"
      );
    } finally {
             
      setIsLoading(false);
    }
      
  };

    


  const handleCancel = () => {
    if (isLoading) return;
    setNewBoardName("");
    setIsModalOpen(false);
  };

  const clearInput = () => setNewBoardName("");

  return (
    <section className=" w-[70%]  ">
      <div className="flex justify-between items-center w-full gap-5 pb-10 ">
        {isLoading && (
          <div
            className="fixed inset-0 bg-transparent bg-opacity-50 z-40 flex items-center justify-center "
            onClick={handleCancel}
          ></div>
        )}

        <div className="flex items-center gap-5 pl-10 w-fit relative ">
          <FolderKanban size={50} />

          {isEditing ? (
            <input
              className="text-h2 font-semibold border-none outline-none underline "
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={handleSave}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
              autoFocus
            />
          ) : (
            <h1 className="text-h2 ">{name}</h1>
          )}

          {!isEditing ? (
            <Edit
              className="absolute -right-8 top-2 cursor-pointer"
              size={20}
              onClick={() => setIsEditing(true)}
            />
          ) : (
            <div>
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-black border-t-transparent rounded-full mr-2 animate-spin" />
              ) : (
                <Save
                  onClick={handleSave}
                className=" cursor-pointer text-green-500" size={30} />
              )}

              <X
                className=" cursor-pointer text-black"
                size={30}
                onClick={() => {
                  setIsEditing(false);
                  setName("Testing");
                }}
              />
            </div>
          )}
        </div>

        {/* <LoadingButton
          isLoading={isLoading}
          loadingText={"deleting..."}
          className="bg-gradient-to-br from-red-50 to-red-200"
          onClick={() => {}}
        >
          Delete
        </LoadingButton> */}
      </div>

      {tab !== "members"? (
        <div
          className={
            "grid gap-4 transition-all duration-300 grid-cols-2 md:grid-cols-3 xl:grid-cols-4 w-full  h-[75vh] overflow-auto pb-20 hide-scrollbar"
          }
        >
          <div
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer flex-col gap-4 p-4 h-32 w-full rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300"
          >
            <div className="flex flex-col gap-2 items-center justify-center w-full h-full">
              <Plus />
              <span>Create New Board</span>
            </div>
          </div>

          {workSpace?.boards?.map((board, i) => (
            <Link
              href={`/dashboard/${board._id}`}
              key={i}
              className="flex flex-col cursor-pointer h-32 gap-4 p-4 rounded-lg bg-blue-200 hover:bg-blue-300 transition-all duration-300"
            >
              <div className="flex items-center justify-center h-full">
                <p>{board.name}</p>
              </div>
            </Link>
          ))}
        </div>
      ):
      

      <div
          className={
            " w-full  h-[75vh] overflow-auto pb-20 hide-scrollbar"
          }
        >

           <div
            onClick={() => setIsModalOpen(true)}
            className="flex cursor-pointer flex-col h-10 gap-4 p-4 mb-4  w-full rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300"
          >
            <div className="flex  gap-2 items-center justify-center w-full h-full">
              <Plus />
              <span>Invite Member</span>
            </div>
          </div>
         

          {workSpace?.members?.map((member, i) => (
            <div
              key={i}
              className="flex flex-col  h-10 gap-4 p-4 rounded-lg bg-blue-100 transition-all duration-300"
            >
              <div className="flex items-center justify-between h-full">
                <p>{member.fullName}</p>
                {member?._id !== workSpace?.ownerId && <Trash size={20} className="text-red-400 cursor-pointer" />}
              </div>
            </div>
          ))}
        </div>


      }

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
                  onClick={handelSaveBoard}
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
  );
};

export default WorkSpaceContent;
