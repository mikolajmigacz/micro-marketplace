export class UserResponseDto {
  id: string;
  email: string;
  name: string;
  createdAt: string;
  updatedAt: string;

  constructor(data: UserResponseDto) {
    this.id = data.id;
    this.email = data.email;
    this.name = data.name;
    this.createdAt = data.createdAt;
    this.updatedAt = data.updatedAt;
  }
}

export class AuthResponseDto {
  access_token: string;
  user: UserResponseDto;

  constructor(token: string, user: UserResponseDto) {
    this.access_token = token;
    this.user = user;
  }
}
