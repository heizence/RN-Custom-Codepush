const responseDto = (success, message = "", data = "") => {
  return { success, message, data };
};

module.exports = {
  responseDto,
};
