import { useState, useCallback, useRef, useEffect } from "react";

export const useHttpClient = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState();

  const activeHttpRequests = useRef([]);
  const sendRequest = useCallback(
    async (url, method = "GET", body = null, headers = {}) => {
      setIsLoading(true);
      const httpAbortCtrl = new AbortController();
      activeHttpRequests.current.push(httpAbortCtrl);
      try {
        const response = await fetch(url, {
          method,
          body,
          headers,
          signal: httpAbortCtrl.signal,
        });
        const responseData =await response.json();
        activeHttpRequests.current.filter((reqCtrl) =>{return reqCtrl!==httpAbortCtrl});
        if (!response.ok) {
          throw new Error(responseData.message);
        }
        setIsLoading(false);
        return responseData;
      } catch (error) {
        setIsLoading(false);
        setError(error.message);
        throw error;
      }
    },
    []
  );

  const clearError = () => {setError(null)};

  useEffect(() => {
    return () => {
      return () => {
        activeHttpRequests.current.forEach((element) => {
          element.abort();
        });
      };
    };
  }, []);

  return { isLoading, error, sendRequest,clearError };
};
