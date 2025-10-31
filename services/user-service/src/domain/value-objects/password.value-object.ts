import { BadRequestException } from "@nestjs/common";

export class Password {
  private readonly value: string;

  private constructor(password: string) {
    this.value = password;
  }

  /**
   * Creates a new Password value object with strong validation
   * Requirements:
   * - Minimum 8 characters
   * - At least one uppercase letter
   * - At least one lowercase letter
   * - At least one digit
   * - At least one special character
   */
  static create(password: string): Password {
    if (!password) {
      throw new BadRequestException("Password is required");
    }

    if (password.length < 8) {
      throw new BadRequestException(
        "Password must be at least 8 characters long"
      );
    }

    if (!/[A-Z]/.test(password)) {
      throw new BadRequestException(
        "Password must contain at least one uppercase letter"
      );
    }

    if (!/[a-z]/.test(password)) {
      throw new BadRequestException(
        "Password must contain at least one lowercase letter"
      );
    }

    if (!/[0-9]/.test(password)) {
      throw new BadRequestException("Password must contain at least one digit");
    }

    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      throw new BadRequestException(
        "Password must contain at least one special character"
      );
    }

    // Check for common weak passwords
    const weakPasswords = [
      "password",
      "Password123!",
      "12345678",
      "Qwerty123!",
    ];
    if (
      weakPasswords.some((weak) =>
        password.toLowerCase().includes(weak.toLowerCase())
      )
    ) {
      throw new BadRequestException(
        "Password is too common, please choose a stronger password"
      );
    }

    return new Password(password);
  }

  getValue(): string {
    return this.value;
  }
}
