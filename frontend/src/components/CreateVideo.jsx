import { useRef, useState } from "react";
import { CiImageOn, CiVideoOn } from "react-icons/ci";
import { BsEmojiSmileFill } from "react-icons/bs";
import { IoCloseSharp } from "react-icons/io5";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

export default function CreateVideo() {
  const [caption, setCaption] = useState("");
  const [video, setVideo] = useState(null);
  const videoRef = useRef(null);

  // Fetch the authenticated user
  const { data: authUser } = useQuery({ queryKey: ["authUser"] });
  const queryClient = useQueryClient();

  // Mutation for creating a video post
  const {
    mutate: createVideo,
    isPending,
    isError,
    error,
  } = useMutation({
    mutationFn: async ({ caption, video }) => {
      try {
        const formData = new FormData();
        formData.append("text", caption);
        if (video) {
          formData.append("video", video); // Append video file correctly
        }

        const res = await fetch("/api/reel/create", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Something went wrong");
        }

        return data;
      } catch (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: () => {
      setCaption("");
      setVideo(null);
      toast.success("Video uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["videos"] });
    },
  });

  // Handle form submit
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!video) {
      toast.error("Please select a video to upload.");
      return;
    }
    createVideo({ caption, video });
  };

  // Handle video file change
  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideo(file);
    }
  };

  return (
    <div className="flex p-4 items-start gap-4 border-b border-gray-700">
      <div className="avatar">
        <div className="w-8 rounded-full">
          {authUser?.photo === "noProfile.jpg" ? (
            <img src="/noProfile.jpg" alt="user-avatar" />
          ) : (
            <img src={authUser?.photo} alt="user-avatar" />
          )}
        </div>
      </div>

      <form className="flex flex-col gap-2 w-full" onSubmit={handleSubmit}>
        <textarea
          className="textarea w-full text-lg resize-none focus:outline-none border-1 border-blue-500 p-4 rounded-2xl"
          placeholder="Say something about your video..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {video && (
          <div className="relative w-full max-w-sm mx-auto">
            <IoCloseSharp
              className="absolute top-1 right-1 text-white bg-blue-500 rounded-full w-5 h-5 cursor-pointer z-10"
              onClick={() => {
                setVideo(null);
                videoRef.current.value = null;
              }}
            />
            <video
              src={URL.createObjectURL(video)}
              className="w-full h-72 object-contain rounded"
              controls
            />
          </div>
        )}

        <div className="flex justify-between items-center border py-2 border-blue-500 rounded-2xl p-2.5">
          <div className="flex gap-2 items-center">
            <CiVideoOn
              className="fill-primary w-6 h-6 text-blue-500 cursor-pointer"
              onClick={() => videoRef.current.click()}
            />
            <BsEmojiSmileFill className="fill-primary text-blue-500 w-5 h-5 cursor-pointer" />
          </div>

          <input
            type="file"
            accept="video/*"
            hidden
            ref={videoRef}
            onChange={handleVideoChange}
          />

          <button
            type="submit"
            className="btn btn-primary rounded-full btn-sm text-white bg-blue-500 border-blue-500 px-4"
            disabled={isPending}
          >
            {isPending ? "Uploading..." : "Upload"}
          </button>
        </div>

        {isError && (
          <p className="text-red-500 text-sm mt-1">{error.message}</p>
        )}
      </form>
    </div>
  );
}
