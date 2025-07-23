export function formatDate(
  date: Date | string | { seconds: number; nanoseconds: number } | null
): string {
  if (!date) {
    return "Not set";
  }
  if (typeof date === "object" && date !== null && "seconds" in date) {
    const dateObject = date as { seconds: number; nanoseconds: number };
    const jsDate = new Date(
      dateObject.seconds * 1000 + Math.floor(dateObject.nanoseconds / 1e6)
    );
    return jsDate.toLocaleDateString("lt-LT");
  }
  if (typeof date === "string") {
    return new Date(date).toLocaleDateString("lt-LT");
  } else if (date instanceof Date) {
    return date.toLocaleDateString("lt-LT");
  } else {
    return "Wrong type";
  }
} 