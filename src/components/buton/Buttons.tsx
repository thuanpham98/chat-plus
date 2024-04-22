import { FC } from "react";
import "./button.css";
import React from "react";

export const Button: FC<
  React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  >
> = (props) => {
  return <button {...props} className={props.className ?? "button"} />;
};
