import { useEffect, useState } from "react";
import { StreamChat } from "stream-chat";
import { useAuth } from "@/contexts/auth-context";
import { getStreamToken } from "@/services/chat";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || "";

export const useChatClient = () => {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !apiKey) return;

    let client: StreamChat;
    let isMounted = true;

    const initChat = async () => {
      try {
        client = StreamChat.getInstance(apiKey);

        const token = await getStreamToken();

        await client.connectUser(
          {
            id: String(user.pk),
            name: user.first_name + " " + user.last_name,
            image: `https://ui-avatars.com/api/?name=${user.first_name}+${user.last_name}&background=random`,
          },
          token
        );

        if (isMounted) {
          setChatClient(client);
        }
      } catch (err) {
        if (isMounted) setError("Failed to initialize chat client.");
        console.error(err);
      }
    };

    initChat();

    return () => {
      isMounted = false;
      if (client) {
        client.disconnectUser();
      }
    };
  }, [user]);

  return { client: chatClient, error };
};
