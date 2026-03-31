import { useState, useEffect, useCallback, useRef } from 'react';

export const useApi = (apiFunc, immediate = false) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const apiFuncRef = useRef(apiFunc);

  useEffect(() => {
    apiFuncRef.current = apiFunc;
  }, [apiFunc]);

  const execute = useCallback(async (...args) => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFuncRef.current(...args);
      setData(result);
      return result;
    } catch (err) {
      setError(err.message || 'Something went wrong');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { data, loading, error, execute, refresh: execute };
};

export const usePolling = (apiFunc, interval = 10000) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const timerRef = useRef(null);
  const apiFuncRef = useRef(apiFunc);

  useEffect(() => {
    apiFuncRef.current = apiFunc;
  }, [apiFunc]);

  const fetchData = useCallback(async () => {
    try {
      const result = await apiFuncRef.current();
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    timerRef.current = setInterval(fetchData, interval);
    return () => clearInterval(timerRef.current);
  }, [fetchData, interval]);

  return { data, loading, error, refresh: fetchData };
};
