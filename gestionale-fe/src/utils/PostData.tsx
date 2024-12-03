import { useState, useEffect } from "react";
import { axiosInstance } from "./axios_interceptor";

const promiseWrapper = (promise: any) => {
  let status = "pending";
  let result: any;

  const s = promise.then(
    (value: any) => {
      status = "success";
      result = value;
    },
    (error: any) => {
      status = "error";
      result = error;
    }
  );

  return () => {
    switch (status) {
      case "pending":
        throw s;
      case "success":
        return result;
      case "error":
        throw result;
      default:
        throw new Error("Unknown status");
    }
  };
};

export function PostData(url: any, payload?: any) {
  const [resource, setResource] = useState(null);

  useEffect(() => {
    const PostData = async () => {
      const promise = axiosInstance
        .post(url, payload)
        .then((response) => response.data)
        .catch((_) => {});
      setResource(promiseWrapper(promise));
    };

    PostData();
  }, [url]);

  return resource;
}
