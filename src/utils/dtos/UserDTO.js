class UserDTO {
  id;
  username;
  email;
  role;
  isEmailVerified;

  constructor(user) {
    this.id = user._id;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
    this.isEmailVerified = user.isEmailVerified;
  }
}

module.exports = UserDTO;