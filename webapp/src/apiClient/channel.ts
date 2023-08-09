import { ChannelListResponse, ChannelResponse } from "../models/response";
import { makeRequest, RequestData } from "../utils/request";
import {
  ChannelListResponseSchema,
  ChannelResponseSchema,
} from "./schemas/channel";

export function makeChannelAPIClient() {
  async function createChannel(
    name: string,
    description: string,
    type: string,
    members_id: string[]
  ) {
    const requestData: RequestData = {
      method: "POST",
      payload: {
        name: name,
        description: description,
        type: type,
        members_id: members_id,
      },
    };
    return makeRequest<ChannelResponse>(
      "/api/channel",
      requestData,
      ChannelResponseSchema
    );
  }

  async function joinChannel(id: string) {
    const requestData: RequestData = {
      method: "POST",
      payload: {
        id: id,
      },
    };
    const apiRoute = "/api/channel/" + id + "/join";
    return makeRequest<ChannelResponse>(
      apiRoute,
      requestData,
      ChannelResponseSchema
    );
  }

  async function leaveChannel(id: string) {
    const requestData: RequestData = {
      method: "POST",
      payload: {
        id: id,
      },
    };
    const apiRoute = "/api/channel/" + id + "/leave";
    return makeRequest<ChannelResponse>(apiRoute, requestData);
  }

  async function getChannelByID(id: string) {
    const requestData: RequestData = {
      method: "GET",
    };
    const apiRoute = "/api/channel/" + id;
    return makeRequest<ChannelResponse>(
      apiRoute,
      requestData,
      ChannelResponseSchema
    );
  }

  async function getChannels(query?: { [key: string]: string }) {
    const requestData: RequestData = {
      method: "GET",
      queryParams: {
        ...query,
      },
    };
    return makeRequest<ChannelListResponse>(
      "/api/channels",
      requestData,
      ChannelListResponseSchema
    );
  }

  async function getPublicChannels(query?: { [key: string]: string }) {
    const requestData: RequestData = {
      method: "GET",
      queryParams: {
        ...query,
      },
    };
    return makeRequest<ChannelListResponse>(
      "/api/public-channels",
      requestData,
      ChannelListResponseSchema
    );
  }

  return {
    createChannel,
    joinChannel,
    leaveChannel,
    getChannelByID,
    getChannels,
    getPublicChannels,
  };
}

export type ChannelAPIClient = ReturnType<typeof makeChannelAPIClient>;
