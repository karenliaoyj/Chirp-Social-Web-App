import * as yup from "yup";
import {
  APIError,
  APIErrorCode,
  Forbidden,
  InternalServerError,
  NotFoundError,
} from "../errors/errors";
import { REACT_APP_CHIRP_API_ENDPOINT } from "../config";

export const stringifyQueryParams = (queryParams: { [key: string]: any }) => {
  const searchParams = new URLSearchParams();
  Object.entries(queryParams).forEach(([k, v]) => {
    if (v == null) {
      return;
    }
    if (v instanceof Array) {
      v.forEach((it) => searchParams.append(k, it));
    } else {
      searchParams.append(k, v);
    }
  });
  return searchParams.toString();
};

const getCSRFToken = () => {
  const cookies = document.cookie.split(";");
  for (let i = 0; i < cookies.length; i++) {
    const c = cookies[i].trim();
    if (c.startsWith("csrftoken=")) {
      return c.substring("csrftoken=".length, c.length);
    }
  }
  return undefined;
};

const defaultHeaders = (): { [key: string]: any } => ({
  "Content-Type": "application/json",
  Accept: "application/json",
});

export interface RequestData {
  method?: string;
  payload?: { [key: string]: any };
  queryParams?: { [key: string]: any };
}

export async function makeRequest<T>(
  path: string,
  data: RequestData,
  responseSchema?: yup.Schema<T>
): Promise<T> {
  const _headers = defaultHeaders();

  const cors = getCSRFToken();
  if (cors) {
    _headers["X-CSRFToken"] = cors;
  } else {
    const r: any = await fetch(
      REACT_APP_CHIRP_API_ENDPOINT + "/api/csrf_cookie",
      {
        method: "GET",
      }
    );
    const result = await r.json();
    const csrfToken = result.response.csrf_token;
    _headers["X-CSRFToken"] = csrfToken;
    document.cookie = `csrftoken=${csrfToken}`;
  }

  const options: RequestInit = {
    credentials: "include",
    method: data.method ?? "GET",
    headers: _headers,
  };

  if (data.payload) {
    options.body = JSON.stringify(data.payload);
  }

  let requestInput = path;
  if (data.queryParams) {
    requestInput = `${requestInput}?${stringifyQueryParams(data.queryParams)}`;
  }

  const response = await fetch(
    `${REACT_APP_CHIRP_API_ENDPOINT}${requestInput}`,
    options
  );
  if (responseSchema) {
    const responseBody: any = await response.json();
    return await parseResponse(responseSchema, responseBody, response.status);
  }
  return Promise.resolve(yup.mixed().validate({})) as T;
}

async function parseResponse<T>(
  responseSchema: yup.Schema<T>,
  responseBody: any,
  statusCode: number
): Promise<T> {
  // API Error
  if ("status" in responseBody) {
    const { status } = responseBody;
    if (status === "ok" && "response" in responseBody) {
      return responseSchema.validate(responseBody.response);
    } else if (status === "ok") {
      return responseSchema.validate({});
    }
    if (status === "failed") {
      return Promise.reject(parseAPIError(responseBody));
    }
  }

  // Standard Error
  switch (statusCode) {
    case 403:
      return Promise.reject(new Forbidden(responseBody.detail));
    case 404:
      return Promise.reject(new NotFoundError(responseBody.detail));
    case 500:
      return Promise.reject(new InternalServerError(responseBody.detail));
  }

  return Promise.reject(new Error("Unexpected Error"));
}

function parseAPIError(e: any): Error {
  if (e.message && e.error_code) {
    return new APIError(e.error_code, e.message, undefined, e.info);
  }

  return new APIError(
    APIErrorCode.NetworkUnavailableError,
    "Network unavailable"
  );
}
