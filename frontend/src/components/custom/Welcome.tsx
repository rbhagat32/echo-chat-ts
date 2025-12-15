import { getSocket } from "@/Socket";
import { api } from "@/store/api";
import { appendLatestChat } from "@/store/reducers/LatestChatSlice";
import { memo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

function WelcomeComponent() {
  const socket = getSocket();
  const dispatch = useDispatch();

  const chats = useSelector((state: StateTypes) => state.chats);

  // socket listener for realtime messages
  useEffect(() => {
    const handleRealtimeMessage = async (msg: MessageTypes) => {
      try {
        // refetch chats in order of latest message when realtime message is received
        const refetchChatsPromise = dispatch(api.util.invalidateTags(["Chats"]));

        // append the chat to latest chats
        const appendLatestChatPromise = chats
          .filter((chat: ChatTypes) => chat._id === msg.chatId)
          .map((chat) => dispatch(appendLatestChat(chat)));

        // wait for all dispatches to complete
        await Promise.all([refetchChatsPromise, appendLatestChatPromise]);
      } catch (err) {
        console.error("Failed to handle real-time message:", err);
      }
    };

    socket?.on("realtime", handleRealtimeMessage);

    return () => {
      // on cleanup, remove the socket listener
      socket?.off("realtime", handleRealtimeMessage);
    };

    // re-render when activeChat changes so that we can append the messages to the correct chat
  }, [chats, socket, dispatch]);

  return (
    <div className="flex flex-col items-center gap-2">
      <img src="/logo.svg" alt="Logo" className="size-40" />
      <h1 className="text-3xl font-semibold">Echo.</h1>
      <p className="max-w-[38ch] text-justify text-zinc-500">
        "Welcome back! Ready to dive into your conversations? Connect with friends, share moments,
        and enjoy seamless communication all in one place."
      </p>
    </div>
  );
}

const Welcome = memo(WelcomeComponent);
export default Welcome;
