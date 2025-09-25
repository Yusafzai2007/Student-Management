class ApiResponse {
  constructor(statuscode, data, message = "success") {
    (this.data = data),
      (this.statuscode = statuscode),
      (this.message = message);
  }
}

export { ApiResponse };
