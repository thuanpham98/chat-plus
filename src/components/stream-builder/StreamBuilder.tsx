import { ReactNode, useEffect, useState } from "react";
import { Map, fromJS } from "immutable";

/**
 * ! @param complete @type Function is dangerous function, because it close stream, if you are share stream between component, be careful.
 */
interface StreamData<T> {
  subscribe: (callback: (value: T) => void) => any;
  complete: () => void;
}

/**
 * * D is Data
 * * E is Error
 */
interface SnapShot<D, E> {
  connectionState: "waiting" | "done";
  data: D | null;
  hasError: boolean;
  hasData: boolean;
  error: E | null;
}

/**
 * * D is Data
 * * E is Error
 * * C is Context
 */
interface StreamBuilderProps<D, E, C> {
  initData?: D;
  stream: StreamData<D>;
  children: (context?: C, snapshot?: SnapShot<D, E>) => ReactNode;
  validate?: (d: D) => E | null;
  context?: C;
  selector?: (preState: D | null, nextState: D | null) => boolean;
}

export const StreamBuilder = <D, E, C>({
  children,
  initData,
  stream,
  validate,
  context,
  selector,
}: StreamBuilderProps<D, E, C>) => {
  const [state, setState] = useState<SnapShot<D, E>>({
    connectionState: "waiting",
    data: initData ?? null,
    hasError: false,
    error: null,
    hasData: initData ? true : false,
  });

  useEffect(() => {
    const currentSnap = Map({
      connectionState: "waiting",
      data: null,
      hasError: false,
      error: null,
      hasData: initData ? true : false,
    }).asMutable();

    stream.subscribe((v) => {
      // stream is close
      if (currentSnap.get("connectionState") === "done") {
        return;
      }
      // selector
      console.debug(currentSnap.get("data"));
      console.debug(v);
      if (selector && !selector(currentSnap.get("data").to, v)) {
        return;
      }
      // check error
      if (validate !== undefined) {
        currentSnap.update("error", () => validate(v));
      } else {
        currentSnap.update("error", () => null);
      }
      if (
        currentSnap.get("error") !== undefined &&
        currentSnap.get("error") !== null
      ) {
        currentSnap.update("hasError", () => true);
      } else {
        currentSnap.update("hasError", () => false);
      }
      // check data
      if (v !== null && v !== undefined) {
        currentSnap.update("hasData", () => true);
      } else {
        currentSnap.update("hasData", () => false);
      }
      const ret = currentSnap.update("data", () => fromJS(v));
      // new state
      setState({
        connectionState: "waiting",
        data: ret.get("data"),
        error: ret.get("error"),
        hasData: ret.get("hasData"),
        hasError: ret.get("hasError"),
      });
    });

    return () => {
      currentSnap.update("connectionState", () => "done");
    };
  }, []);

  return children(context, state);
};

