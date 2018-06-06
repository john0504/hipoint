export class AccountError extends Error {
  constructor(public message: string) {
      super(message);
      // Note: This is a typescript issue
      // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
      Object.setPrototypeOf(this, AccountError.prototype);
      this.name = 'AccountError';
      this.message = message;
      this.stack = (<any>new Error()).stack;
  }
}