"use client";
import { SafeView } from "@/components/mobile/SafeView";
import { useState, useEffect, useRef } from "react";
import { SignOutButton, UserProfile, useUser } from "@clerk/nextjs";
import {
  IoColorPaletteOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoMenuOutline,
  IoMusicalNotesOutline,
} from "react-icons/io5";
import { showToast } from "@/hooks/useToast";
import { Spinner } from "@/rework/components/extra/Spinner";
import { Switch } from "@/rework/components/controls/Switch";

export default function SettingsPage() {
  const { user, isLoaded } = useUser();
  const [username, setUsername] = useState("");
  const [themeColor, setThemeColor] = useState("#5891fa"); // Default color
  const [highlightedQueries, setHighlightedQueries] = useState(false);
  const [showSidebarIcons, setShowSidebarIcons] = useState(true);
  const [soundcloudUserId, setSoundcloudUserId] = useState("");
  const [saving, setSaving] = useState(false);
  const colorInputRef = useRef<HTMLInputElement>(null);

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
    if (isLoaded && user) {
      setUsername(user.username || "");
      fetchUserSettings();
    }
  }, [isLoaded, user]);

  // Set the CSS variable when themeColor changes (e.g., on mount or save)
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
        setHighlightedQueries(data.highlightedQueries || false);
        setShowSidebarIcons(data.showSidebarIcons !== false); // Default to true if not set
        setSoundcloudUserId(data.soundcloudUserId || "");
      }
    } catch (error) {
      console.error("Error fetching user settings:", error);
    }
  };

  const updateUsername = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await user.update({ username });
      showToast("success", "Username updated successfully");
    } catch (error) {
      console.error("Error updating username:", error);
      const errorMessage = error instanceof Error ? error.message : "";
      if (
        errorMessage.includes(
          "Username must be between 4 and 64 characters long"
        )
      ) {
        showToast("error", "Username must be between 4 and 64 characters long");
      } else {
        showToast("error", "Failed to update username");
      }
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Update CSS variable directly for real-time preview
    document.documentElement.style.setProperty("--keyColor", e.target.value);
  };

  const handleSaveThemeColor = async () => {
    if (colorInputRef.current) {
      const selectedColor = colorInputRef.current.value;
      setThemeColor(selectedColor); // Update state
      try {
        const response = await fetch("/api/user/settings", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ themeColor: selectedColor }),
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
    }
  };

  const updateSetting = async (settingName: string, value: any) => {
    try {
      const response = await fetch("/api/user/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [settingName]: value }),
      });

      if (response.ok) {
        showToast("success", "Setting updated");
        return true;
      } else {
        showToast("error", "Failed to save setting");
        return false;
      }
    } catch (error) {
      console.error(`Error updating ${settingName}:`, error);
      showToast("error", "Failed to save setting");
      return false;
    }
  };

  const toggleHighlightedQueries = async () => {
    const newValue = !highlightedQueries;
    setHighlightedQueries(newValue);
    await updateSetting("highlightedQueries", newValue);
  };

  const toggleShowSidebarIcons = async () => {
    const newValue = !showSidebarIcons;
    setShowSidebarIcons(newValue);
    await updateSetting("showSidebarIcons", newValue);
  };

  const saveSoundcloudUserId = async () => {
    const trimmedId = soundcloudUserId.trim();
    await updateSetting("soundcloudUserId", trimmedId || null);
  };

  if (!isLoaded) {
    return (
      <SafeView className="w-full">
        <h1 className="text-3xl font-bold mb-4">Settings</h1>
        <Spinner />
      </SafeView>
    );
  }

  return (
    <div className="pb-24 p-4 w-full">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[--systemSecondary]">
          Manage your personal details and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* Profile Section */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoPersonOutline /> Profile
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="username"
                className="block select-none text-sm font-medium mb-1"
              >
                Username
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      username &&
                      username !== user?.username
                    ) {
                      updateUsername();
                    }
                  }}
                  className="p-2 bg-background border border-labelDivider rounded-xl w-full placeholder:text-[--systemSecondary]"
                  placeholder="Enter username"
                />
                <button
                  onClick={updateUsername}
                  disabled={saving || !username || username === user?.username}
                  className="px-4 py-2 select-none bg-background border border-labelDivider rounded-xl hover:bg-systemToolbarTitlebar transition-colors disabled:opacity-50"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* SoundCloud Section */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoMusicalNotesOutline /> SoundCloud Integration
          </h2>
          <div className="space-y-4">
            <div>
              <label
                htmlFor="soundcloud-userid"
                className="block select-none text-sm font-medium mb-1"
              >
                SoundCloud User ID
              </label>
              <p className="text-sm text-[--systemSecondary] mb-2">
                Enter your SoundCloud User ID to access your playlists, likes,
                and more
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  id="soundcloud-userid"
                  value={soundcloudUserId}
                  onChange={(e) => setSoundcloudUserId(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      saveSoundcloudUserId();
                    }
                  }}
                  className="p-2 bg-background border border-labelDivider rounded-xl w-full placeholder:text-[--systemSecondary]"
                  placeholder="e.g. 123456789"
                />
                <button
                  onClick={saveSoundcloudUserId}
                  className="px-4 py-2 select-none bg-background border border-labelDivider rounded-xl hover:bg-systemToolbarTitlebar transition-colors"
                >
                  Save
                </button>
              </div>
              <p className="text-xs text-[--systemSecondary] mt-1">
                You can find your User ID in your SoundCloud profile URL or
                settings (e.g., ...soundcloud.com/saber-<span className="text-[var(--keyColor)]">601742928</span>?...).
              </p>
            </div>
          </div>
        </section>

        {/* Appearance Section */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoColorPaletteOutline /> Appearance
          </h2>
          <div>
            <label className="block text-sm font-medium mb-2 select-none">
              Theme Color
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  onClick={() => {
                    if (colorInputRef.current) {
                      colorInputRef.current.value = color.value;
                      document.documentElement.style.setProperty(
                        "--keyColor",
                        color.value
                      );
                    }
                  }}
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
              className="block select-none text-sm font-medium mb-2"
            >
              Custom Color
            </label>
            <div className="flex gap-2 items-center">
              <input
                type="color"
                id="custom-color"
                defaultValue={themeColor} // Uncontrolled input
                ref={colorInputRef}
                onChange={handleColorChange}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm">{themeColor}</span>
              <button
                onClick={handleSaveThemeColor}
                className="px-4 py-2 select-none bg-background border border-labelDivider rounded-xl hover:bg-systemToolbarTitlebar transition-colors disabled:opacity-50"
              >
                Save
              </button>
            </div>
          </div>
        </section>

        {/* Search Settings */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoSearchOutline /> Search
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Highlight search queries</h3>
                <p className="text-sm text-[--systemSecondary]">
                  Highlight matching text in search results
                </p>
              </div>
              <Switch
                checked={highlightedQueries}
                onCheckedChange={toggleHighlightedQueries}
                id="show-sidebar-icons"
              />
            </div>
          </div>
        </section>

        {/* Sidebar Settings */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoMenuOutline /> Sidebar
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">Show sidebar icons</h3>
                <p className="text-sm text-[--systemSecondary]">
                  Display icons next to sidebar menu items
                </p>
              </div>
              <Switch
                checked={showSidebarIcons}
                onCheckedChange={toggleShowSidebarIcons}
                id="show-sidebar-icons"
              />
            </div>
          </div>
        </section>
        <SignOutButton>
          <button className="px-4 py-2 select-none bg-background hover:bg-red-500/5 hover:text-red-500 border border-labelDivider hover:border-red-500 rounded-xl hover:bg-systemToolbarTitlebar transition-colors disabled:opacity-50">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
