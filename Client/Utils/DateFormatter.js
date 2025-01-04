const DateFormatter = (date) => {
  const now = new Date();

  // Get today's date at midnight
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Get yesterday's date at midnight
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Get the time part
  const time = date.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Check if the date is today
  if (date >= today) {
    return time;
  }

  // Check if the date is yesterday
  if (date >= yesterday && date < today) {
    return `Yesterday ${time}`;
  }

  // Check if the date is within the last 7 days
  const sevenDaysAgo = new Date(today);
  sevenDaysAgo.setDate(today.getDate() - 7);

  if (date >= sevenDaysAgo) {
    const dayOfWeek = date.toLocaleDateString(undefined, { weekday: "long" });
    return `${dayOfWeek} ${time}`;
  }

  // Otherwise, return the full date and time
  return date.toLocaleDateString() + " " + time;
};

export default DateFormatter