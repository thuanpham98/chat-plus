// @generated by protobuf-ts 2.9.4
// @generated from protobuf file "message-processing-image.proto" (syntax proto3)
// tslint:disable
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import { WireType } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf message MessageProcessingImageResponse
 */
export interface MessageProcessingImageResponse {
    /**
     * @generated from protobuf field: MessageProcessingImageEventType eventType = 1;
     */
    eventType: MessageProcessingImageEventType;
    /**
     * @generated from protobuf field: bytes data = 2;
     */
    data: Uint8Array;
    /**
     * @generated from protobuf field: string typeImage = 3;
     */
    typeImage: string;
}
/**
 * @generated from protobuf message MessageProcessingImageRequest
 */
export interface MessageProcessingImageRequest {
    /**
     * @generated from protobuf field: MessageProcessingImageEventType eventType = 1;
     */
    eventType: MessageProcessingImageEventType;
    /**
     * @generated from protobuf field: string path = 2;
     */
    path: string;
}
/**
 * @generated from protobuf enum MessageProcessingImageEventType
 */
export enum MessageProcessingImageEventType {
    /**
     * @generated from protobuf enum value: INIT = 0;
     */
    INIT = 0,
    /**
     * @generated from protobuf enum value: START = 1;
     */
    START = 1,
    /**
     * @generated from protobuf enum value: END = 2;
     */
    END = 2,
    /**
     * @generated from protobuf enum value: ERROR = 3;
     */
    ERROR = 3
}
// @generated message type with reflection information, may provide speed optimized methods
class MessageProcessingImageResponse$Type extends MessageType<MessageProcessingImageResponse> {
    constructor() {
        super("MessageProcessingImageResponse", [
            { no: 1, name: "eventType", kind: "enum", T: () => ["MessageProcessingImageEventType", MessageProcessingImageEventType] },
            { no: 2, name: "data", kind: "scalar", T: 12 /*ScalarType.BYTES*/ },
            { no: 3, name: "typeImage", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<MessageProcessingImageResponse>): MessageProcessingImageResponse {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.eventType = 0;
        message.data = new Uint8Array(0);
        message.typeImage = "";
        if (value !== undefined)
            reflectionMergePartial<MessageProcessingImageResponse>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: MessageProcessingImageResponse): MessageProcessingImageResponse {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* MessageProcessingImageEventType eventType */ 1:
                    message.eventType = reader.int32();
                    break;
                case /* bytes data */ 2:
                    message.data = reader.bytes();
                    break;
                case /* string typeImage */ 3:
                    message.typeImage = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: MessageProcessingImageResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* MessageProcessingImageEventType eventType = 1; */
        if (message.eventType !== 0)
            writer.tag(1, WireType.Varint).int32(message.eventType);
        /* bytes data = 2; */
        if (message.data.length)
            writer.tag(2, WireType.LengthDelimited).bytes(message.data);
        /* string typeImage = 3; */
        if (message.typeImage !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.typeImage);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message MessageProcessingImageResponse
 */
export const MessageProcessingImageResponse = new MessageProcessingImageResponse$Type();
// @generated message type with reflection information, may provide speed optimized methods
class MessageProcessingImageRequest$Type extends MessageType<MessageProcessingImageRequest> {
    constructor() {
        super("MessageProcessingImageRequest", [
            { no: 1, name: "eventType", kind: "enum", T: () => ["MessageProcessingImageEventType", MessageProcessingImageEventType] },
            { no: 2, name: "path", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value?: PartialMessage<MessageProcessingImageRequest>): MessageProcessingImageRequest {
        const message = globalThis.Object.create((this.messagePrototype!));
        message.eventType = 0;
        message.path = "";
        if (value !== undefined)
            reflectionMergePartial<MessageProcessingImageRequest>(this, message, value);
        return message;
    }
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: MessageProcessingImageRequest): MessageProcessingImageRequest {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* MessageProcessingImageEventType eventType */ 1:
                    message.eventType = reader.int32();
                    break;
                case /* string path */ 2:
                    message.path = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message: MessageProcessingImageRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter {
        /* MessageProcessingImageEventType eventType = 1; */
        if (message.eventType !== 0)
            writer.tag(1, WireType.Varint).int32(message.eventType);
        /* string path = 2; */
        if (message.path !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.path);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message MessageProcessingImageRequest
 */
export const MessageProcessingImageRequest = new MessageProcessingImageRequest$Type();