export const generateUsername = (name) => {
  const prefix = name.substring(0, 3).toUpperCase();
  const year = new Date().getFullYear();
  const randomDigits = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}${year}${randomDigits}`;
};
