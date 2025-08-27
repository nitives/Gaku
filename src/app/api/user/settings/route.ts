"use server";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// Get or create user settings for the current user
async function getOrCreateUserSettings(userId: string) {
  // First check if the user exists, if not create them
  let user = await prisma.user.findUnique({ where: { id: userId } });

  // If user doesn't exist yet, we need to create them
  if (!user) {
    const clerkUser = await currentUser();
    if (!clerkUser) {
      throw new Error("Failed to get current user");
    }

    user = await prisma.user.create({
      data: {
        id: userId,
        email: clerkUser.primaryEmailAddress?.emailAddress || "",
        firstName: clerkUser.firstName || null,
        lastName: clerkUser.lastName || null,
        username: clerkUser.username || null,
      },
    });
  }

  // Now get or create the user settings
  let settings = await prisma.userSettings.findUnique({
    where: { userId },
  });

  if (!settings) {
    settings = await prisma.userSettings.create({
      data: {
        userId,
        themeColor: "#5891fa", // Default theme color
        highlightedQueries: false, // Default search setting
        showSidebarIcons: true, // Default sidebar setting
        soundcloudUserId: null, // Default to no SoundCloud User ID
      },
    });
  }

  return settings;
}

// GET: Retrieve user's settings
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const settings = await getOrCreateUserSettings(userId);

    return NextResponse.json(settings);
  } catch (err) {
    console.error(`Error fetching user settings: ${String(err)}`);
    return NextResponse.json(
      { error: "Failed to retrieve user settings" },
      { status: 500 }
    );
  }
}

// PUT: Update user settings
export async function PUT(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await req.json();

    // Validate theme color if provided
    if (data.themeColor && !/^#[0-9A-F]{6}$/i.test(data.themeColor)) {
      return NextResponse.json(
        { error: "Invalid theme color format. Use hex format (e.g., #5891fa)" },
        { status: 400 }
      );
    }

    // Get current settings or create them if they don't exist
    await getOrCreateUserSettings(userId);

    // Update the settings
    const settings = await prisma.userSettings.update({
      where: { userId },
      data: {
        ...(data.themeColor !== undefined && { themeColor: data.themeColor }),
        ...(data.highlightedQueries !== undefined && {
          highlightedQueries: data.highlightedQueries,
        }),
        ...(data.showSidebarIcons !== undefined && {
          showSidebarIcons: data.showSidebarIcons,
        }),
        ...(data.soundcloudUserId !== undefined && {
          soundcloudUserId: data.soundcloudUserId,
        }),
      },
    });

    return NextResponse.json(settings);
  } catch (err) {
    console.error(`Error updating user settings: ${String(err)}`);
    return NextResponse.json(
      { error: "Failed to update user settings" },
      { status: 500 }
    );
  }
}
