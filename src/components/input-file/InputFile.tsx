import React, { CSSProperties, FC, useId } from "react";
import "./input-file.css";
import { checkTypeImageFromArrayBuffer } from "@/application/utils/checkTypeImage";

interface InputFile {
  onChange: (dataUrl: string, file: File, typeImage: string) => void;
  accept?: string;
  children?: React.ReactNode;
  classname?: string;
  style?: CSSProperties;
}

export const InputFile: FC<InputFile> = ({
  onChange,
  accept,
  children,
  classname,
  style,
}) => {
  const id = useId();

  function loadFile(event: any) {
    const file = event.target.files[0];
    const reader = new FileReader();
    const numberOfBytes = 12; //đọc 12 byte đầu
    let typeIfImage = "";
    reader.onload = function (e) {
      const data = e?.target?.result as ArrayBuffer;

      if (data) {
        if (data.byteLength >= numberOfBytes) {
          const firstBytes = data.slice(0, numberOfBytes);
          typeIfImage = checkTypeImageFromArrayBuffer(
            new Uint8Array(firstBytes),
          );
          console.debug("loại file", typeIfImage);
        } else {
          console.debug("Không đủ byte để đọc");
        }
        const blob = new Blob([data], { type: file.type });
        const nameFile = `${file?.name ?? ""}`;
        const tag = nameFile.split(".").at(-1);
        const newName = nameFile
          .replaceAll(" ", "")
          .replaceAll(",", "")
          .replaceAll(".", "");
        console.debug(newName);
        onChange(
          URL.createObjectURL(file),
          new File(
            [blob],
            newName.substring(
              newName.length > 20 ? newName.length - 20 : 0,
              newName.length - tag.length - 1,
            ) + `.${tag}`,
            { type: blob.type },
          ),
          typeIfImage,
        );
        const tmp = document.getElementById(id) as HTMLInputElement | null;
        if (tmp) {
          tmp.value = "";
        }
      }
      // if (e.target !== null && e.target.result !== null) {
      //   if (e.target.result.toString().split(",").length > 1) {
      //     // console.debug(
      //     //   "affter reload",
      //     //   ,
      //     // );

      //     onChange(URL.createObjectURL(file), file);
      //     const tmp = document.getElementById(id) as HTMLInputElement | null;
      //     if (tmp) {
      //       tmp.value = "";
      //     }
      //   }
      // }
    };
    reader.readAsArrayBuffer(file);
  }
  function dropHandler(ev: any) {
    ev.preventDefault();
    if (
      ev.dataTransfer.items &&
      ev.dataTransfer.items.length > 0 &&
      ev.dataTransfer.items[0].kind === "file"
    ) {
      const numberOfBytes = 12; //đọc 12 byte đầu
      let typeIfImage = "";
      const file = ev.dataTransfer.items[0].getAsFile();
      const reader = new FileReader();
      reader.onload = function (e) {
        const data = e?.target?.result as ArrayBuffer;

        if (data) {
          if (data.byteLength >= numberOfBytes) {
            const firstBytes = data.slice(0, numberOfBytes);
            typeIfImage = checkTypeImageFromArrayBuffer(firstBytes);
          } else {
            console.debug("Không đủ byte để đọc");
          }
          onChange(URL.createObjectURL(file), file, typeIfImage);
          const tmp = document.getElementById(id) as HTMLInputElement | null;
          if (tmp) {
            tmp.value = "";
          }
        }
        // if (e.target !== null && e.target.result !== null) {
        //   if (e.target.result.toString().split(",").length > 1) {
        //     onChange(e.target?.result.toString(), file);
        //     const tmp = document.getElementById(id) as HTMLInputElement | null;
        //     if (tmp) {
        //       tmp.value = "";
        //     }
        //   }
        // }
      };
      reader.readAsArrayBuffer(file);
    } else {
      [...ev.dataTransfer.files].forEach((file, i) => {
        console.debug(`… file[${i}].name = ${file.name}`);
      });
    }
  }

  function dragOverHandler(ev: any) {
    ev.preventDefault();
  }
  return (
    <label
      style={Object.assign(
        {
          width: "fit-content",
          height: "fit-content",
          display: "flex",
          justifyContent: "flex-start",
          alignItems: "flex-start",
          flexDirection: "column",
          position: "relative",
        },
        style,
      )}
      htmlFor={id}
      className={classname}
      onDragOver={dragOverHandler}
      onDrop={dropHandler}
    >
      {children}
      <input
        id={id}
        className="input-file-custom"
        type="file"
        accept={accept}
        onChange={loadFile}
      />
    </label>
  );
};

