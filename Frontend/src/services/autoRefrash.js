import { useEffect } from "react";

const useAutoRefresh = (callback, interval = 10000) => {
  useEffect(() => {
    callback(); // initial fetch

    const id = setInterval(callback, interval);
    return () => clearInterval(id);
  }, []);
};

export default useAutoRefresh;
