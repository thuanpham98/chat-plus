import { AppSession } from "@/application/services/app-session";
import { MessageModel } from "@/domain/chat";
import { RdModulesManager, useRdQuery } from "@radts/reactjs";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { List } from "immutable";
import { MessageItem } from "./MessageItem";
import { AppRepository } from "@/application/services/app-repository";

interface MessageFrameProps {
  userId: string;
  friendId: string;
}

const MessageFrame: React.FC<MessageFrameProps> = React.memo(
  ({ friendId, userId }) => {
    const paging = useRef<{
      page: number;
      pageSize: number;
    }>({
      page: 0,
      pageSize: 10,
    });

    const rdManager = new RdModulesManager();

    const [isPending, startTransition] = useTransition();

    const refFrame = useRef<HTMLDivElement>(null);
    const refListMessage = useRef<HTMLDivElement>(null);

    const curMessage = useRef<List<MessageModel>>(List<MessageModel>([]));
    const isDoneLoading = useRef<boolean>(false);

    const [state, setState] = useState<List<MessageModel>>(curMessage.current);

    const { isLoading, refetch, isRefetching, isSuccess } = useRdQuery({
      queryKey: ["get-list-message-in-message-frame", friendId],
      queryFn: async () => {
        if (isDoneLoading.current) {
          return [];
        }
        const ret = await rdManager
          .get<AppRepository>("AppRepository")
          .chat.message.listMessage({
            page: paging.current.page,
            pageSize: paging.current.pageSize,
            receiver: friendId,
          });
        if (ret.length === 0) {
          isDoneLoading.current = true;
        }

        curMessage.current = List<MessageModel>(ret ?? [])
          .concat(List<MessageModel>(curMessage.current))
          .filter(
            (item, index, self) =>
              index === self.findIndex((t) => t.id === item.id),
          );

        setState(curMessage.current);
        return curMessage.current ?? [];
      },
    });

    useEffect(() => {
      // stream listen message from websocket
      const rdManager = new RdModulesManager();

      const subcriptionMessage = rdManager
        .get<AppSession>("AppSession")
        .message.subscribe((mes) => {
          if (
            mes &&
            ((mes.sender === friendId && mes.receiver === userId) ||
              (mes.receiver === friendId && mes.sender === userId))
          ) {
            curMessage.current = curMessage.current.push(mes);
            startTransition(() => {
              setState(curMessage.current);
            });
          }
        });

      return () => {
        subcriptionMessage.unsubscribe();
      };
    }, []);

    useEffect(() => {
      if (
        !isLoading &&
        isSuccess &&
        refFrame.current &&
        refListMessage.current
      ) {
        if (
          !isDoneLoading.current &&
          refFrame.current.clientHeight > refListMessage.current.clientHeight
        ) {
          for (
            let index = 0;
            index <
            Math.round(
              refFrame.current.clientHeight /
                refListMessage.current.clientHeight,
            );
            index++
          ) {
            if (isDoneLoading.current) {
              break;
            }
            paging.current.page++;
            refetch();
          }
        }
        refFrame.current.onscroll = () => {
          if (
            refFrame.current.scrollHeight - refFrame.current.clientHeight <=
            -refFrame.current.scrollTop + 1
          ) {
            if (!isDoneLoading.current) {
              paging.current.page++;
              refetch();
            }
            // load all data message here
          }
        };
      }
    }, [refFrame.current, refetch, refListMessage.current, isLoading]);

    async function deleteMessage(id: string) {
      const index = curMessage.current.findIndex((e) => e.id === id);
      if (index > -1) {
        curMessage.current = curMessage.current.delete(index);
        setState(curMessage.current);
      }
      rdManager
        .get<AppRepository>("AppRepository")
        .chat.message.deleteMessage({ id: id });
    }

    if (isSuccess) {
      return (
        <div
          ref={refFrame}
          className="column"
          style={{
            width: "100%",
            height: "100%",
            flexDirection: "column-reverse",
            overflowY: "scroll",
          }}
        >
          <div
            ref={refListMessage}
            className="column"
            style={{
              height: "fit-content",
              gap: "4px",
              padding: "8px",
              width: "100%",
            }}
          >
            {isRefetching && (
              <span
                style={{
                  color: "red",
                  fontSize: "16px",
                  lineHeight: "24px",
                  fontWeight: 500,
                }}
              >
                Loading nèk
              </span>
            )}
            {!isPending &&
              state &&
              state.map((mess) => {
                if (mess) {
                  return (
                    <MessageItem
                      onDelete={(v) => {
                        deleteMessage(v);
                      }}
                      isSender={mess.sender === userId}
                      message={mess}
                      key={mess.id}
                    />
                  );
                }
              })}
          </div>
        </div>
      );
    }

    return <></>;
  },
  (pre, next) => {
    return pre.friendId === next.friendId;
  },
);

export default MessageFrame;
