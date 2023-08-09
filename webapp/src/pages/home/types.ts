import { Post } from "../../models/post";

export enum SecondaryContentType {
  Thread = "Thread",
}

interface ThreadContent {
  type: SecondaryContentType.Thread;
  post: Post;
}
export function ThreadContent(post: Post): ThreadContent {
  return {
    type: SecondaryContentType.Thread,
    post,
  };
}

export type SecondaryContent = ThreadContent;
