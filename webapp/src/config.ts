interface EnvVariables {
  REACT_APP_CHIRP_API_ENDPOINT: string;
  REACT_APP_CHIRP_WS_ENDPOINT: string;
}

const env: EnvVariables = process.env as any;

export const REACT_APP_CHIRP_API_ENDPOINT = env.REACT_APP_CHIRP_API_ENDPOINT;
export const REACT_APP_CHIRP_WS_ENDPOINT = env.REACT_APP_CHIRP_WS_ENDPOINT;
