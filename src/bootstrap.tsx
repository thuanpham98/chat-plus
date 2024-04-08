import { createRoot } from "react-dom/client";
import "./index.css";
import { RouterProvider } from "react-router-dom";
import { createAppRouter } from "./router";
import { RdModulesManager, RdModule } from "@radts/reactjs";
import { AppStorage } from "./application/services/app-storage";
import { AppSession } from "./application/services/app-session";
import { AppRepository } from "./application/services/app-repository";
import React from "react";

const rdManager = new RdModulesManager<RdModule>();
rdManager
  .use(new AppStorage())
  .use(new AppSession())
  .use(new AppRepository("http://localhost:6969"));

const router = createAppRouter();

console.log("test", process.env.NODE_ENV);
console.log("test", process.env.ENVIORNMENT_TYPE);
createRoot(document.getElementById("app")!).render(
  <RouterProvider router={router} fallbackElement={<span>loading</span>} />,
);

export { router };

