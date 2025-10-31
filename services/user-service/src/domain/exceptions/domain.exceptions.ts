export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class UserAlreadyExistsException extends DomainException {
  constructor(email: string) {
    super(`User with email ${email} already exists`);
  }
}

export class UserNotFoundException extends DomainException {
  constructor(identifier: string) {
    super(`User ${identifier} not found`);
  }
}

export class InvalidCredentialsException extends DomainException {
  constructor() {
    super("Invalid credentials");
  }
}
