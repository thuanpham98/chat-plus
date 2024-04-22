import { useRef } from "react";
import "./style.css";
import { Input } from "../../components/input/Input";
import { RdModulesManager, StreamBuilder, useRdBloc } from "@radts/reactjs";
import { Button } from "../../components/buton/Buttons";
import React from "react";
import { AppRepository } from "@/application/services/app-repository";
import { AppSession } from "@/application/services/app-session";
import { LoginStatus } from "@/application/models/LoginStatus";
import { AppStorage } from "@/application/services/app-storage";

type LoginPageState = {
  username: string;
  password: string;
};

export const LoginPage = () => {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, , stream] = useRdBloc<LoginPageState>({
    password: "",
    username: "",
  });

  async function onLogin() {
    try {
      const manager = new RdModulesManager();
      const ret = await manager
        .get<AppRepository>("AppRepository")
        .chat.auth.login({
          username: state.username,
          password: state.password,
        });

      manager.get<AppStorage>("AppStorage").accessToken = ret.token;
      manager
        .get<AppSession>("AppSession")
        .loginStatus.next(LoginStatus.Success);
    } catch (error: any) {
      console.error(error);
    }
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onLogin();
      }}
      className="login-form"
    >
      <Input
        placeholder="Số điện thoại"
        onChange={(e) => {
          state.username = e.currentTarget.value;
          stream.next(state);
        }}
      />
      <Input
        placeholder="Mật khẩu"
        onChange={(e) => {
          state.password = e.currentTarget.value;
          stream.next(state);
        }}
      />
      <StreamBuilder<LoginPageState, any, any>
        context={"button-submit"}
        stream={stream}
        initData={stream.value}
      >
        {(context, state: any) => {
          return (
            <Button
              disabled={
                state.data.username.length === 0 ||
                state.data.password.length === 0
              }
              key={context}
              onClick={() => {
                formRef.current?.submit();
              }}
            >
              Login
            </Button>
          );
        }}
      </StreamBuilder>
    </form>
  );
};
