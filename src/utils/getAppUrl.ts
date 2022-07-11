export const getUrl = () => {
  return process.env.NODE_ENV !== 'development'
    ? window.location.origin
    : `http://localhost:${process.env.PORT ?? 3000}`;
};
