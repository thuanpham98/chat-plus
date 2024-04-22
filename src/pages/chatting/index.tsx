import React, { Suspense } from "react";
import { RdModulesManager, useRdBloc, useRdQuery } from "@radts/reactjs";
import { AppRepository } from "@/application/services/app-repository";
import { FriendItem } from "./components/FriendItem";
import { UserModel } from "@/domain/auth";
import {} from "@/infrastructure/message-protobuf/message";
import { ChatContainer } from "./components/ChatContainer";

interface ChattingPageState {
  selectedFriend: UserModel | null;
}
const ChattingPage = () => {
  const [state, setState] = useRdBloc<ChattingPageState>({
    selectedFriend: null,
  });

  const { isLoading: isLoadingUserInfo, data: dataUserInfo } = useRdQuery({
    queryKey: ["get-user-info-from-chatting-page"],
    queryFn: async () => {
      const rdManager = new RdModulesManager();
      const ret = await rdManager
        .get<AppRepository>("AppRepository")
        .chat.user.userInfo();
      return ret;
    },
  });

  const { isLoading: isLoadingListFriends, data: dataListFriends } = useRdQuery(
    {
      queryKey: ["get-list-user-info-from-chatting-page"],
      queryFn: async () => {
        const rdManager = new RdModulesManager();
        const ret = await rdManager
          .get<AppRepository>("AppRepository")
          .chat.user.listFriends();
        return ret;
      },
    },
  );

  if (isLoadingListFriends || isLoadingUserInfo) {
    return <></>;
  }

  return (
    <Suspense fallback={<h1>🌀 Loading...</h1>}>
      <div
        className="row"
        style={{
          width: "100%",
          height: "100%",
          backgroundColor: "transparent",
        }}
      >
        <div
          className="column"
          style={{
            width: "256px",
            height: "100%",
            overflowY: "auto",
          }}
        >
          <div
            className="column"
            style={{
              width: "100%",
              height: "auth",
            }}
          >
            {/* list message here */}
            {dataListFriends &&
              dataListFriends.map((d, i) => {
                return (
                  <FriendItem
                    selected={d.id === state?.selectedFriend?.id}
                    onSelect={() => {
                      state.selectedFriend = d;
                      setState();
                    }}
                    key={d.id + i}
                    name={d.name}
                    message={""}
                  />
                );
              })}
          </div>
        </div>
        {state.selectedFriend && (
          <ChatContainer
            userId={dataUserInfo.id}
            friend={state.selectedFriend}
            key={state.selectedFriend.id}
          />
        )}
      </div>
    </Suspense>
  );
};

export default ChattingPage;
