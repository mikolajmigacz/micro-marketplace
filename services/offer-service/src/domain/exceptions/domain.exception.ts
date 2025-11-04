export class DomainException extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DomainException';
  }
}

export class OfferNotFoundException extends DomainException {
  constructor(id: string) {
    super(`Offer with id ${id} not found`);
    this.name = 'OfferNotFoundException';
  }
}

export class UnauthorizedException extends DomainException {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'UnauthorizedException';
  }
}
