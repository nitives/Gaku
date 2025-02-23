import React from "react";
import { USER } from "@/lib/constants";

const getGreeting = () => {
  const now = new Date();
  const hours = now.getHours();
  const month = now.getMonth() + 1; // Months are 0-indexed
  const day = now.getDate();

  // Define holidays
  const holidays = [
    { date: "1-1", greeting: "Happy New Year" },
    { date: "2-14", greeting: "Happy Valentine's Day" },
    { date: "3-17", greeting: "Happy St. Patrick's Day" },
    { date: "4-1", greeting: "Happy April Fools' Day" },
    { date: "4-9", greeting: "Happy Easter" }, // Example Easter date, update yearly
    { date: "10-31", greeting: "Happy Halloween" },
    { date: "12-25", greeting: "Merry Christmas" },
    { date: "12-31", greeting: "Happy New Year's Eve" },
    { date: "11-24", greeting: "Happy Thanksgiving" }, // Example Thanksgiving, update yearly
    { date: "7-4", greeting: "Happy Independence Day" },
  ];

  // Check for holidays
  const today = `${month}-${day}`;
  const holiday = holidays.find((h) => h.date === today);
  if (holiday) return holiday.greeting;

  // Time of day greetings
  if (hours < 12) return "Good morning";
  if (hours < 18) return "Good afternoon";
  if (hours < 22) return "Good evening";
  return "Goodnight";
};

export const Welcome = () => {
  const greeting = getGreeting();

  return (
    <div className="py-8 px-10">
      <h1 className="text-2xl font-[700]">Home</h1>
      <p className="text-lg font-[500] text-[--systemSecondary]">
        {greeting}, {USER.name}
      </p>
    </div>
  );
};
