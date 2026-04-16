import { infoEndpoint } from "../../Navbar/navbarUtils";

const resolveEndpoint = (suffix) => {
  if (!infoEndpoint) {
    return "";
  }

  try {
    const endpoint = new URL(infoEndpoint);
    endpoint.pathname = endpoint.pathname.replace(/\/info\/?$/, suffix);
    return endpoint.toString();
  } catch {
    return infoEndpoint.replace(/\/info\/?$/, suffix);
  }
};

export const getTtsEndpoint = () => resolveEndpoint("/tts");

export const getChatEndpoint = () => resolveEndpoint("/chat");

export const getStreamEndpoint = () => resolveEndpoint("/stream");
