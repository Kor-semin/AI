export class MissingEnvError extends Error {
  constructor(parameter: string) {
    super(`Missing or incomplete environment configuration: ${parameter}`);
    this.name = "MissingEnvError";
  }
}
