"use client";
import React, { useEffect, useState } from "react";
import { ChevronDown, ChevronRight, FolderKanban, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Button from "./Button";
import LoadingButton from "./LoadingButton";
import axios from "axios";
import { customToast } from "./CustomToast";

const WorkSpaceBar = ({ workspaces }) => {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedWorkspace = searchParams.get("workspace") || null;
  const selectedTab = searchParams.get("tab") || "boards";

  const [isLoading, setIsLoading] = useState(false);

  const handleWorkspaceClick = (id) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("workspace", id);
    params.delete("tab");
    params.delete("search");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const handleTabClick = (workspaceId, tab) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("workspace", workspaceId);
    tab === "members" ? params.set("tab", tab) : params.delete("tab");
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const handleSaveWorkspace = async () => {
    if (!newWorkspaceName.trim()) {
      customToast.error("Please enter a workspace name.");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);

    try {
      const res = await axios.post("/api/workspace", {
        name: newWorkspaceName.toLowerCase().trim(),
      });

      if (res && res?.data && res?.data?.success) {
        customToast.success(
          res?.data?.message || "Workspace created successfully!"
        );
        setNewWorkspaceName("");
        setIsModalOpen(false);
        handleWorkspaceClick(res.data.workspace.id);
      } else {
        customToast.error(res?.data?.message || "Failed to create workspace.");
      }
    } catch (error) {
      console.log("Error saving workspace:", error?.message);
      console.log(`error :`, error?.response);
      customToast.error(
        error?.response?.data?.message ||
          "Please try again. (workspace creation error)"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    if (isLoading) return;
    setNewWorkspaceName("");
    setIsModalOpen(false);
  };

  const clearInput = () => setNewWorkspaceName("");

  return (
    <aside className="w-[30%] border-t-2 mt-10 px-2">
      <Button onClick={() => setIsModalOpen(true)} className="my-4">
        Add Workspace
      </Button>

<div className="h-[60vh] hide-scrollbar overflow-auto">
   {workspaces?.map((workspace) => {
        const isExpanded = selectedWorkspace === String(workspace?._id);

        return (
          <div key={workspace?._id} className="mb-3">
            <button
              onClick={() => handleWorkspaceClick(workspace?._id)}
              className="flex items-center justify-between w-full font-semibold p-2 rounded hover:bg-gray-100 hover:pl-5 transition-all"
            >
              <div className="flex items-center gap-2  text-left ">
                <FolderKanban />
                <span className="line-clamp-1">{workspace.name}</span>
              </div>
              {isExpanded ? (
                <ChevronDown size={18} />
              ) : (
                <ChevronRight size={18} />
              )}
            </button>

            {isExpanded && (
              <div className="pl-2 mt-2 space-y-2">
                <button
                  onClick={() => handleTabClick(workspace?._id, "boards")}
                  className={`block w-full text-left p-1 pl-10 rounded ${
                    selectedTab === "boards"
                      ? "bg-gray-200 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Boards
                </button>

                <button
                  onClick={() => handleTabClick(workspace?._id, "members")}
                  className={`block w-full text-left p-1 pl-10 rounded ${
                    selectedTab === "members"
                      ? "bg-gray-200 font-semibold"
                      : "hover:bg-gray-100"
                  }`}
                >
                  Members
                </button>
              </div>
            )}
          </div>
        );
      })}

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
              <h2 className="text-lg font-semibold mb-4">Add Workspace</h2>

              <div className="relative mb-4">
                <input
                  type="text"
                  placeholder="Workspace Name"
                  value={newWorkspaceName}
                  onChange={(e) => setNewWorkspaceName(e.target.value)}
                  className="w-full border border-gray-300 rounded px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                {newWorkspaceName && (
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
                  onClick={handleSaveWorkspace}
                  className=" !text-sm"
                >
                  Save
                </LoadingButton>
              </div>
            </div>
          </div>
        </>
      )}
    </aside>
  );
};

export default WorkSpaceBar;
