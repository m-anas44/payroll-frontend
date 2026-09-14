import axios from "axios";
import { attachAuthInterceptors } from "./apiClient";

export const browserClient = attachAuthInterceptors(
  axios.create({
    headers: {
      "Content-Type": "application/json",
      "X-Requested-With": "XMLHttpRequest",
    },
    withCredentials: true,
    timeout: 20000,
  })
);

export default browserClient;