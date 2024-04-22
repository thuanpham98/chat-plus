import { FC, useEffect, useRef } from "react";
import * as mount from "MiniAppChatWithWorld/MiniApp";
import React from "react";

const MAChatWithEveryone: FC<{ initPathName: string }> = ({ initPathName }) => {
  const wrapperRef = useRef(null);
  const isFirstRunRef = useRef(true);
  const unmountRef = useRef(() => {
    console.debug("unmount");
  });

  useEffect(() => {
    if (!isFirstRunRef.current) {
      return;
    }
    isFirstRunRef.current = false;
    unmountRef.current = mount.mount(wrapperRef.current, initPathName);

    return unmountRef.current;
  }, []);
  return (
    <div
      id="mini-app-chat-with-everyone"
      ref={wrapperRef}
      style={{ width: "100%", height: "100%" }}
    />
  );
};

export default MAChatWithEveryone;
