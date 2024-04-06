import "react";
import { Outlet } from "react-router-dom";
import React from "react";
import test from "../../assets/images/img-auth-background.svg";
import test2 from "../../assets/react.svg";

export const AuthScreen = () => {
  return (
    <div
      className="column"
      style={{
        width: "100vw",
        height: "100%",
        minHeight: "100vh",
        justifyContent: "center",
        alignItems: "center",
        backgroundImage: `url(${test})`,
        backgroundRepeat: "no-repeat",
      }}
    >
      <img src={test2} />
      <Outlet />
    </div>
  );
};

