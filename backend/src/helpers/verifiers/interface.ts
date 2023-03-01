export interface Verifier {
  verify(address: string, message: string, signature: string): boolean;
}
