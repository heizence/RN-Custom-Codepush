const responseDto = (success, statusCode, message = "", data = "") => {
  return { success, statusCode, message, data };
};

module.exports = {
  responseDto,
};
