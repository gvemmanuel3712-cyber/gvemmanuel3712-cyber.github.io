export interface TerminalLine {
  text: string;
  href?: string;
}
export interface TerminalResult {
  lines: TerminalLine[];
  action?: "clear";
}
export function runCommand(input: unknown, locale?: string): TerminalResult;
export function periodSummary(
  days: Array<{ date: string; count: number }>,
  endDate: string,
  period?: string,
): { total: number; activeDays: number; start: number };
