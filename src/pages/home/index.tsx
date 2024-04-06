import "react";
import { Outlet } from "react-router-dom";
import { SideBar } from "./components/SideBar";
import "./style.css";
import React from "react";

export const HomeScreen = () => {
  return (
    <section className="home">
      <SideBar />
      <main className="app-body">
        <Outlet />
      </main>
    </section>
  );
};

