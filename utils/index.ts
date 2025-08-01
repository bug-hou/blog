export function generate8DigitCode() {
  return Math.random().toString(36).slice(2, 10);
}