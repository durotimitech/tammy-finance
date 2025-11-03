import { isSameDay } from "@/lib/date-utils";

describe("Date Utils", () => {
  describe("isSameDay", () => {
    it("returns true for same dates", () => {
      const date1 = new Date("2024-01-15T10:30:00Z");
      const date2 = new Date("2024-01-15T18:45:00Z");
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("returns false for different dates", () => {
      const date1 = new Date("2024-01-15T10:30:00Z");
      const date2 = new Date("2024-01-16T10:30:00Z");
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("returns false for different months", () => {
      const date1 = new Date("2024-01-15T10:30:00Z");
      const date2 = new Date("2024-02-15T10:30:00Z");
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("returns false for different years", () => {
      const date1 = new Date("2024-01-15T10:30:00Z");
      const date2 = new Date("2025-01-15T10:30:00Z");
      expect(isSameDay(date1, date2)).toBe(false);
    });

    it("handles dates at midnight", () => {
      const date1 = new Date(2024, 0, 15, 0, 0, 0); // Jan 15, 2024 00:00:00
      const date2 = new Date(2024, 0, 15, 23, 59, 59); // Jan 15, 2024 23:59:59
      expect(isSameDay(date1, date2)).toBe(true);
    });

    it("handles dates across day boundary", () => {
      const date1 = new Date(2024, 0, 15, 23, 59, 59); // Jan 15, 2024 23:59:59
      const date2 = new Date(2024, 0, 16, 0, 0, 0); // Jan 16, 2024 00:00:00
      expect(isSameDay(date1, date2)).toBe(false);
    });
  });
});
