"use server";
import { NextResponse } from "next/server";
import { auth, currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { dev } from "@/lib/utils";

// 1) Create or find local user
async function getOrCreateUser(userId: string, email: string) {
  let user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        id: userId,
        email: email,
      },
    });
  }
  return user;
}

// 2) Create or find library
async function getOrCreateLibrary(userId: string) {
  let library = await prisma.library.findFirst({ where: { userId } });
  if (!library) {
    library = await prisma.library.create({
      data: {
        userId,
      },
    });
  }
  return library;
}

// **GET: Retrieve user's library songs**
export async function GET() {
  try {
    const { userId } = await auth();
    const user = await currentUser();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await getOrCreateUser(
      userId,
      user?.primaryEmailAddress?.emailAddress ?? ""
    );

    // Then get or create the library
    const library = await getOrCreateLibrary(userId);

    // Now fetch the library with songs
    const libraryWithSongs = await prisma.library.findUnique({
      where: { id: library.id },
      include: { songs: true },
    });

    return NextResponse.json(libraryWithSongs?.songs || [], { status: 200 });
  } catch (err) {
    console.error(`Error fetching library: ${String(err)}`);
    return NextResponse.json(
      { error: "Failed to retrieve library" },
      { status: 500 }
    );
  }
}
// **POST: Add song to library**
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { soundcloudId } = await req.json();
    if (!soundcloudId) {
      return NextResponse.json(
        { error: "SoundCloud ID is required" },
        { status: 400 }
      );
    }

    const library = await getOrCreateLibrary(userId);

    // Create song if it doesn't exist and add to library
    await prisma.$transaction(async (tx) => {
      // Try to create the song (if it exists, this will be skipped)
      await tx.song.upsert({
        where: { id: soundcloudId },
        update: {}, // No updates if it exists
        create: { id: soundcloudId },
      });

      // Add song to library
      await tx.library.update({
        where: { id: library.id },
        data: {
          songs: {
            connect: { id: soundcloudId },
          },
        },
      });
    });

    return NextResponse.json(
      { success: true, message: "Song added to library" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error adding song:", error);
    return NextResponse.json(
      { error: "Failed to add song to library" },
      { status: 500 }
    );
  }
}

// **DELETE: Remove song from library**
export async function DELETE(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    dev.log("DELETE | userId", userId);

    const { soundcloudId } = await req.json();
    dev.log("DELETE | soundcloudId", soundcloudId);
    if (!soundcloudId) {
      return NextResponse.json(
        { error: "SoundCloud ID is required" },
        { status: 400 }
      );
    }

    const library = await getOrCreateLibrary(userId);
    dev.log("DELETE | library", library);

    await prisma.library.update({
      where: { id: library.id },
      data: {
        songs: {
          disconnect: { id: soundcloudId },
        },
      },
    });

    return NextResponse.json(
      { success: true, message: "Song removed from library" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error removing song:", error);
    return NextResponse.json(
      { error: "Failed to remove song from library" },
      { status: 500 }
    );
  }
}
