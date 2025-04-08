export function phoneFormatStringToNumber(input: string) {
  if (input.length === 11 && input.startsWith("1")) {
    input = input.slice(1);
  }

  return input.replace(/\D/g, "");
}
