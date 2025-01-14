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

export function GetData(url: any) {
  const [resource, setResource] = useState(null);

  useEffect(() => {
    const getData = async () => {
      const promise = axiosInstance
        .get(url)
        .then((response) => {
          console.log("REPONSE ", response.data);
          return response.data;
        })
        .catch((_) => {});
      setResource(promiseWrapper(promise));
    };

    getData();
  }, [url]);

  return resource;
}
