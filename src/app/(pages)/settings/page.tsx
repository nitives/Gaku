"use client";
import { SafeView } from "@/components/mobile/SafeView";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { IoColorPaletteOutline, IoPersonOutline } from "react-icons/io5";
import { showToast } from "@/hooks/useToast";
import { Spinner } from "@/rework/components/extra/Spinner";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState("");
  const [themeColor, setThemeColor] = useState("#5891fa"); // Default color
  const [saving, setSaving] = useState(false);

  // Predefined color options
  const colorOptions = [
    { name: "Blue", value: "#5891fa" },
    { name: "Purple", value: "#8a4fff" },
    { name: "Green", value: "#4caf50" },
    { name: "Pink", value: "#ff4fa9" },
    { name: "Orange", value: "#ff9800" },
    { name: "Red", value: "#f44336" },
    { name: "Teal", value: "#009688" },
  ];

  useEffect(() => {
    // Load user data
    if (isLoaded && user) {
      setUsername(user.username || "");

      // Try to fetch settings from our database
      fetchUserSettings();
    }
  }, [isLoaded, user]);

  // Apply the theme color to the CSS variable
  useEffect(() => {
    if (themeColor) {
      document.documentElement.style.setProperty("--keyColor", themeColor);
    }
  }, [themeColor]);

  const fetchUserSettings = async () => {
    try {
      const response = await fetch("/api/user/settings");
      if (response.ok) {
        const data = await response.json();
        if (data.themeColor) {
          setThemeColor(data.themeColor);
        }
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  const updateUsername = async () => {
    if (!user) return;
    setSaving(true);

    try {
      await user.update({
        username: username,
      });
      showToast("success", "Username updated successfully");
    } catch (error) {
      console.error("Error updating username:", error);
      showToast("error", "Failed to update username");
    } finally {
      setSaving(false);
    }
  };

  const updateThemeColor = async (color: string) => {
    setThemeColor(color);

    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ themeColor: color }),
      });

      if (response.ok) {
        showToast("success", "Theme color updated");
      } else {
        showToast("error", "Failed to save theme color");
      }
    } catch (error) {
      console.error("Error updating theme color:", error);
      showToast("error", "Failed to save theme color");
    }
  };

  if (!isLoaded) {
    return (
      <SafeView className="w-full">
        <h1 className="text-2xl font-bold mb-4">Settings</h1>
        <Spinner />
      </SafeView>
    );
  }

  return (
    <SafeView className="w-full">
      <h1 className="text-2xl font-bold mb-4">Settings</h1>

      <div className="space-y-8">
        {/* Profile Section */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <IoPersonOutline /> Profile
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-1"
              >
                Username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="p-2 bg-background border border-labelDivider rounded-md w-full placeholder:text-[--systemSecondary]"
                  placeholder="Enter username"
                />
                <button
                  onClick={updateUsername}
                  disabled={saving || !username || username === user?.username}
                  className="px-4 py-2 bg-background border border-labelDivider rounded-md hover:bg-systemToolbarTitlebar transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section>
          <h2 className="text-xl font-semibold flex items-center gap-2 mb-4">
            <IoColorPaletteOutline /> Appearance
          </h2>

          <div>
            <label className="block text-sm font-medium mb-2">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => updateThemeColor(color.value)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                    themeColor === color.value
                      ? "ring-2 ring-offset-2 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Custom color picker */}
          <div className="mt-4">
            <label
              htmlFor="custom-color"
              className="block text-sm font-medium mb-2"
            >
              Custom Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                id="custom-color"
                value={themeColor}
                onChange={(e) => updateThemeColor(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm">{themeColor}</span>
            </div>
          </div>
        </section>
      </div>
    </SafeView>
  );
}
