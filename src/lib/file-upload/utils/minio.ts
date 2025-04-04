import { randomBytes } from "crypto";

export function randomString(length = 10): string {
  const lettersAndDigits =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = randomBytes(length);
  const result = new Array(length);
  for (let i = 0; i < length; i++) {
    const index = (bytes[i] ?? 0) % lettersAndDigits.length;
    result[i] = lettersAndDigits[index];
  }

  return result.join("");
}
