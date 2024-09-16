"use client";
import {
  Heading,
  SubHeading,
  SafeView,
  Input,
  ScrollHeader,
} from "@/components/mobile/SafeView";
import Image from "next/image";
import { LinearBlur } from "progressive-blur";

const imageUrls = Array(10).fill(
  "https://i1.sndcdn.com/artworks-kTARXYIL6Ej32m2o-QyPlSg-t500x500.jpg"
);

import { toast } from "react-hot-toast";

const showToast = (type: "success" | "error" | "warning") => {
  switch (type) {
    case "success":
      toast.success("Added to library");
      break;
    case "error":
      toast.error("This is an error message!");
      break;
    case "warning":
      toast("This is a warning message!", { icon: "⚠️" });
      break;
    default:
      break;
  }
};

export default function Home() {
  return (
    <>
      <SafeView>
        <Heading>Toast Example</Heading>
        <button onClick={() => showToast("success")}>Show Success Toast</button>
        <button onClick={() => showToast("error")}>Show Error Toast</button>
        <button onClick={() => showToast("warning")}>Show Warning Toast</button>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {imageUrls.map((url, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <Image
                src={url}
                alt={`Image ${index + 1}`}
                width={100}
                height={100}
              />
            </div>
          ))}
        </div>
      </SafeView>
    </>
  );
}
