import { PostListResponse } from "../models/response";
import { makeRequest, RequestData } from "../utils/request";
import { PostListResponseSchema } from "./schemas/post";

export function makePostAPIClient() {
  async function getPosts(channelId: string, query?: { [key: string]: any }) {
    const requestData: RequestData = {
      method: "GET",
      queryParams: {
        ...query,
      },
    };
    return makeRequest<PostListResponse>(
      `/api/channels/${channelId}/posts`,
      requestData,
      PostListResponseSchema
    );
  }

  return {
    getPosts,
  };
}

export type PostAPIClient = ReturnType<typeof makePostAPIClient>;
