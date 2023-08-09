import { useState, useEffect } from "react";

export interface DebounceOptions {
  delay?: number;
}

export default function useDebounce<T>(
  value: T,
  options: DebounceOptions = {}
) {
  const { delay = 300 } = options;

  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [delay, value]);

  return debouncedValue;
}
