"use client";
import { useRef, useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import {
  IoColorPaletteOutline,
  IoPersonOutline,
  IoSearchOutline,
  IoMenuOutline,
  IoMusicalNotesOutline,
  IoDownloadOutline,
  IoCloudUploadOutline,
  IoCloudOutline,
  IoSyncOutline,
  IoCheckmarkCircleOutline,
  IoLinkOutline,
  IoCloseCircleOutline,
} from "react-icons/io5";
import { showToast } from "@/hooks/useToast";
import { Switch } from "@/components/controls/Switch";
import { useLocalSettings, exportSettings } from "@/hooks/useLocalSettings";

export default function SettingsPage() {
  const { settings, updateSetting, importSettings, isSignedIn, isSyncing } =
    useLocalSettings();
  const colorInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);

  type ResolveStatus = "idle" | "loading" | "linked" | "error";
  const [profileUrlDraft, setProfileUrlDraft] = useState(
    settings.soundcloudProfileUrl ?? "",
  );
  const [resolveStatus, setResolveStatus] = useState<ResolveStatus>(
    settings.soundcloudUserId ? "linked" : "idle",
  );
  const [resolveError, setResolveError] = useState("");
  const [linkedUsername, setLinkedUsername] = useState(
    settings.soundcloudUserId ? settings.soundcloudProfileUrl || "" : "",
  );

  const handleLinkAccount = async () => {
    const url = profileUrlDraft.trim();
    if (!url) return;
    setResolveStatus("loading");
    setResolveError("");
    try {
      const res = await fetch(
        `/api/soundcloud/user?profileUrl=${encodeURIComponent(url)}`,
      );
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body?.error ?? "Failed to resolve profile");
      }
      const data = await res.json();
      const userId = String(data.userData?.id ?? "");
      if (!userId) throw new Error("Could not find user ID in response");
      const username = data.userData?.username ?? url;
      updateSetting("soundcloudProfileUrl", url);
      updateSetting("soundcloudUserId", userId);
      setLinkedUsername(username);
      setResolveStatus("linked");
    } catch (err) {
      setResolveStatus("error");
      setResolveError((err as Error).message);
    }
  };

  const handleUnlink = () => {
    updateSetting("soundcloudProfileUrl", "");
    updateSetting("soundcloudUserId", "");
    setProfileUrlDraft("");
    setLinkedUsername("");
    setResolveStatus("idle");
    setResolveError("");
  };

  const colorOptions = [
    { name: "Blue", value: "#5891fa" },
    { name: "Purple", value: "#8a4fff" },
    { name: "Green", value: "#4caf50" },
    { name: "Pink", value: "#ff4fa9" },
    { name: "Orange", value: "#ff9800" },
    { name: "Red", value: "#f44336" },
    { name: "Teal", value: "#009688" },
  ];

  const handleColorPick = (hex: string) => {
    document.documentElement.style.setProperty("--keyColor", hex);
    if (colorInputRef.current) colorInputRef.current.value = hex;
    updateSetting("themeColor", hex);
  };

  const handleImportFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      await importSettings(file);
      showToast("success", "Settings imported");
    } catch {
      showToast("error", "Failed to import settings");
    } finally {
      // Reset so the same file can be re-imported
      e.target.value = "";
    }
  };

  return (
    <div className="pb-24 p-4 w-full">
      <div className="mb-4">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-[--systemSecondary]">
          Manage your personal details and preferences
        </p>
      </div>

      <div className="space-y-8">
        {/* SoundCloud Section */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoMusicalNotesOutline /> SoundCloud Integration
          </h2>
          {resolveStatus === "linked" ? (
            <div className="flex items-center justify-between p-3 bg-background border border-labelDivider rounded-xl">
              <div className="flex items-center gap-2">
                <IoCheckmarkCircleOutline className="text-green-500 shrink-0" />
                <div>
                  <p className="text-sm font-medium">Linked account</p>
                  <p className="text-xs text-[--systemSecondary] truncate max-w-[240px]">
                    {linkedUsername}
                  </p>
                </div>
              </div>
              <button
                onClick={handleUnlink}
                className="flex items-center gap-1 text-sm text-red-500 hover:underline shrink-0"
              >
                <IoCloseCircleOutline /> Unlink
              </button>
            </div>
          ) : (
            <div>
              <label
                htmlFor="soundcloud-profile-url"
                className="block select-none text-sm font-medium mb-1"
              >
                SoundCloud Profile URL
              </label>
              <p className="text-sm text-[--systemSecondary] mb-2">
                Enter your SoundCloud profile URL to link your account and
                access your likes and playlists.
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  id="soundcloud-profile-url"
                  value={profileUrlDraft}
                  onChange={(e) => {
                    setProfileUrlDraft(e.target.value);
                    if (resolveStatus !== "idle") setResolveStatus("idle");
                    setResolveError("");
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLinkAccount()}
                  className="p-2 bg-background border border-labelDivider rounded-xl w-full placeholder:text-[--systemSecondary]"
                  placeholder="https://soundcloud.com/your-username"
                />
                <button
                  onClick={handleLinkAccount}
                  disabled={
                    resolveStatus === "loading" || !profileUrlDraft.trim()
                  }
                  className="flex items-center gap-2 px-4 py-2 select-none bg-[var(--keyColor)] text-white rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 shrink-0"
                >
                  {resolveStatus === "loading" ? (
                    <IoSyncOutline className="animate-spin" />
                  ) : (
                    <IoLinkOutline />
                  )}
                  Link
                </button>
              </div>
              {resolveStatus === "error" && (
                <p className="text-xs text-red-500 mt-1">{resolveError}</p>
              )}
            </div>
          )}
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
                  onClick={() => handleColorPick(color.value)}
                  className={`w-12 h-12 rounded-full flex items-center justify-center transition-transform ${
                    settings.themeColor === color.value
                      ? "ring-2 ring-offset-2 scale-110"
                      : ""
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

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
                defaultValue={settings.themeColor}
                ref={colorInputRef}
                onChange={(e) => {
                  document.documentElement.style.setProperty(
                    "--keyColor",
                    e.target.value,
                  );
                }}
                onBlur={(e) => handleColorPick(e.target.value)}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <span className="text-sm">{settings.themeColor}</span>
            </div>
          </div>
        </section>

        {/* Search Settings */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoSearchOutline /> Search
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Highlight search queries</h3>
              <p className="text-sm text-[--systemSecondary]">
                Highlight matching text in search results
              </p>
            </div>
            <Switch
              checked={settings.highlightedQueries}
              onCheckedChange={(v) => updateSetting("highlightedQueries", v)}
              id="highlighted-queries"
            />
          </div>
        </section>

        {/* Sidebar Settings */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoMenuOutline /> Sidebar
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">Show sidebar icons</h3>
              <p className="text-sm text-[--systemSecondary]">
                Display icons next to sidebar menu items
              </p>
            </div>
            <Switch
              checked={settings.showSidebarIcons}
              onCheckedChange={(v) => updateSetting("showSidebarIcons", v)}
              id="show-sidebar-icons"
            />
          </div>
        </section>

        {/* Data Section */}
        <section>
          <h2 className="text-xl font-semibold select-none flex items-center gap-2 mb-4">
            <IoDownloadOutline /> Data
            {isSignedIn && (
              <span className="ml-auto flex items-center gap-1 text-sm font-normal">
                {isSyncing ? (
                  <>
                    <IoSyncOutline className="animate-spin text-[--systemSecondary]" />
                    <span className="text-[--systemSecondary]">
                      Syncing&hellip;
                    </span>
                  </>
                ) : (
                  <>
                    <IoCheckmarkCircleOutline className="text-green-500" />
                    <span className="text-green-500">Synced</span>
                  </>
                )}
              </span>
            )}
          </h2>
          <p className="text-sm text-[--systemSecondary] mb-4">
            {isSignedIn
              ? "Settings are synced to your account and stored locally — changes are reflected across all your devices."
              : "Settings are stored locally in your browser. Sign in to sync them across devices. Export to back them up or import to restore them."}
          </p>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={exportSettings}
              className="flex items-center gap-2 px-4 py-2 select-none bg-background border border-labelDivider rounded-xl hover:bg-systemToolbarTitlebar transition-colors"
            >
              <IoDownloadOutline />
              Export settings
            </button>
            <button
              onClick={() => importInputRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 select-none bg-background border border-labelDivider rounded-xl hover:bg-systemToolbarTitlebar transition-colors"
            >
              <IoCloudUploadOutline />
              Import settings
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={handleImportFile}
            />
          </div>
        </section>

        <SignOutButton>
          <button className="px-4 py-2 select-none bg-background hover:bg-red-500/5 hover:text-red-500 border border-labelDivider hover:border-red-500 rounded-xl transition-colors">
            Sign Out
          </button>
        </SignOutButton>
      </div>
    </div>
  );
}
