import * as yup from "yup";
import { ChannelListResponse, ChannelResponse } from "../../models/response";
import { Channel, ChannelType } from "../../models/channel";
import { UserSchema } from "./user";

export const ChannelSchema: yup.Schema<Channel> = yup
  .object<Channel>({
    id: yup.string().required(),
    name: yup.string().required(),
    users: yup.array(UserSchema).required(),
    description: yup.string(),
    type: yup.mixed<ChannelType>().oneOf(Object.values(ChannelType)),
  })
  .required()
  .camelCase();

export const ChannelResponseSchema: yup.Schema<ChannelResponse> = yup
  .object<ChannelResponse>({
    channel: ChannelSchema,
  })
  .required()
  .camelCase();

export const ChannelListResponseSchema: yup.Schema<ChannelListResponse> = yup
  .object<ChannelListResponse>({
    channels: yup.array().defined().of(ChannelSchema),
  })
  .required()
  .camelCase();
