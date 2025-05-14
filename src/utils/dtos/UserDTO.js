class UserDTO {
  id;
  username;
  email;
  role;

  constructor(user) {
    this.id = user._id;
    this.username = user.username;
    this.email = user.email;
    this.role = user.role;
  }
}

module.exports = UserDTO;