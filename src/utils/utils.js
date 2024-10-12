// utils.js
export const loadFromLocalStorage = (key, defaultValue) => {
  const savedValue = localStorage.getItem(key);
  return savedValue !== null ? savedValue : defaultValue;
};
