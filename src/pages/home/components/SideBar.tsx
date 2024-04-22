import { RdModulesManager } from "@radts/reactjs";
import "./side-bar.css";
import { AppSession } from "../../../application/services/app-session";
import { LoginStatus } from "../../../application/models/LoginStatus";
import { NavLink, useLocation } from "react-router-dom";
import React from "react";
import { RouterPath } from "../../../application/services/router-config";
import { IcChattingX20 } from "../../../components/icons/IcChattingX20";
import { IcWorldX20 } from "../../../components/icons/IcWorldX20";

const IcLogout = () => {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M19.9955 16.8567C20.0059 17.2599 19.9318 17.661 19.7777 18.0372C19.6236 18.4134 19.3924 18.7573 19.0973 19.0492C18.8022 19.3411 18.449 19.5753 18.0579 19.7385C17.6668 19.9016 17.2454 19.9905 16.8179 20H6.26241C6.03502 19.9868 5.8224 19.8893 5.67097 19.7288C5.51954 19.5683 5.44159 19.3578 5.45416 19.1433C5.44159 18.9288 5.51954 18.7183 5.67097 18.5578C5.8224 18.3973 6.03502 18.2998 6.26241 18.2867H16.8179C17.2259 18.2917 17.6195 18.1441 17.9123 17.876C18.2051 17.608 18.3734 17.2414 18.3802 16.8567V3.14333C18.3731 2.75874 18.2047 2.39248 17.9119 2.12469C17.6191 1.8569 17.2257 1.70939 16.8179 1.71444H6.26241C6.04002 1.68936 5.83511 1.58826 5.68644 1.43029C5.53778 1.27232 5.45568 1.06843 5.45568 0.857221C5.45568 0.646008 5.53778 0.442122 5.68644 0.284152C5.83511 0.126181 6.04002 0.0250854 6.26241 -9.53674e-07H16.8179C17.2457 0.00908357 17.6675 0.0976334 18.059 0.260581C18.4505 0.423529 18.8041 0.657675 19.0996 0.949628C19.3951 1.24158 19.6266 1.58561 19.7809 1.96203C19.9353 2.33845 20.0094 2.73987 19.9991 3.14333L19.9955 16.8567ZM12.1793 10.9144H3.10718L6.40615 14.0256C6.49032 14.1056 6.55695 14.2005 6.60223 14.3048C6.64752 14.4091 6.67057 14.5208 6.67008 14.6335C6.66959 14.7463 6.64556 14.8578 6.59936 14.9617C6.55317 15.0657 6.48571 15.1601 6.40084 15.2394C6.22945 15.3998 5.99755 15.4893 5.75615 15.4883C5.51476 15.4874 5.28365 15.3961 5.11366 15.2344L0.266541 10.6667C0.182039 10.587 0.115007 10.4924 0.0692732 10.3883C0.0235393 10.2842 0 10.1727 0 10.06C0 9.94732 0.0235393 9.83575 0.0692732 9.73166C0.115007 9.62757 0.182039 9.53299 0.266541 9.45333L5.11366 4.88C5.19735 4.79738 5.29771 4.73137 5.40883 4.68583C5.51995 4.6403 5.63959 4.61616 5.76074 4.61483C5.88189 4.6135 6.0021 4.63501 6.11432 4.67809C6.22653 4.72118 6.32849 4.78497 6.4142 4.86573C6.49991 4.94648 6.56765 5.04258 6.61344 5.14836C6.65923 5.25414 6.68214 5.36749 6.68085 5.48174C6.67955 5.59599 6.65406 5.70885 6.60587 5.81368C6.55769 5.91852 6.48778 6.01322 6.40026 6.09222L3.10129 9.20333H12.1734C12.4751 9.20333 12.7189 9.58778 12.7189 10.06C12.7189 10.5322 12.481 10.9144 12.1793 10.9144Z"
        fill="black"
        fillOpacity="0.45"
      />
    </svg>
  );
};

const ItemNav = ({
  path,
  icon,
  isSelected,
}: {
  path: string;
  isSelected: boolean;
  icon: () => React.ReactNode;
}) => {
  return (
    <NavLink
      className="side-bar__item"
      to={path}
      style={{
        backgroundColor: isSelected ? "#27AE60" : undefined,
      }}
    >
      <>{icon()}</>
    </NavLink>
  );
};

export const SideBar = () => {
  function onLogout() {
    const modules = new RdModulesManager();
    modules.get<AppSession>("AppSession").loginStatus.next(LoginStatus.Expired);
  }
  const location = useLocation();

  return (
    <aside
      className="column"
      style={{
        position: "fixed",
        top: "0px",
        left: "0px",
        width: "56px",
        height: "100vh",
        backgroundColor: "#FAFAFA",
      }}
    >
      <nav
        className="column"
        style={{
          width: "100%",
          height: "100%",
          overflowY: "auto",
          flex: "1",
          padding: "8px",
          gap: "8px",
        }}
      >
        <ItemNav
          path={RouterPath.chatting}
          isSelected={location.pathname.startsWith(RouterPath.chatting)}
          icon={() => {
            return (
              <IcChattingX20
                color={
                  location.pathname.startsWith(RouterPath.chatting)
                    ? "#FFFFFF"
                    : "#27AE60"
                }
              />
            );
          }}
        />
        <ItemNav
          path={RouterPath.chatWithEveryOne}
          isSelected={location.pathname.startsWith(RouterPath.chatWithEveryOne)}
          icon={() => {
            return (
              <IcWorldX20
                color={
                  location.pathname.startsWith(RouterPath.chatWithEveryOne)
                    ? "#FFFFFF"
                    : "#27AE60"
                }
              />
            );
          }}
        />
      </nav>
      <div
        className="column"
        style={{
          width: "100%",
          gap: "0px",
        }}
      >
        <div
          className="side-bar__item"
          onClick={() => {
            onLogout();
          }}
        >
          <IcLogout />
        </div>
      </div>
    </aside>
  );
};
