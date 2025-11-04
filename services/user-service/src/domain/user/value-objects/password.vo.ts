export class Password {
  private readonly value: string;

  private constructor(password: string) {
    this.value = password;
  }

  static create(password: string): Password {
    if (!password) {
      throw new Error('Password is required');
    }

    if (password.length < 8) {
      throw new Error('Password must be at least 8 characters long');
    }

    if (!/[A-Z]/.test(password)) {
      throw new Error('Password must contain at least one uppercase letter');
    }

    if (!/[a-z]/.test(password)) {
      throw new Error('Password must contain at least one lowercase letter');
    }

    if (!/[0-9]/.test(password)) {
      throw new Error('Password must contain at least one digit');
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new Error('Password must contain at least one special character');
    }

    const weakPasswords = ['password', 'Password123!', '12345678', 'Qwerty123!'];
    if (weakPasswords.some((weak) => password.toLowerCase().includes(weak.toLowerCase()))) {
      throw new Error('Password is too common, please choose a stronger password');
    }

    return new Password(password);
  }

  getValue(): string {
    return this.value;
  }
}
