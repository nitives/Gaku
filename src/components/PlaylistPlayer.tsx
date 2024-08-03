"use client";
import React, { useState, useEffect } from 'react';
import ReactPlayer from 'react-player';

const fetchAudioSegments = async (links: string[]) => {
  const audioSegments = await Promise.all(
    links.map(async (link) => {
      const response = await fetch(link);
      const arrayBuffer = await response.arrayBuffer();
      return arrayBuffer;
    })
  );
  return audioSegments;
};

const combineAudioSegments = (audioSegments: ArrayBuffer[]) => {
  const combinedArrayBuffer = new Uint8Array(
    audioSegments.reduce((acc, segment) => acc + segment.byteLength, 0)
  );

  let offset = 0;
  audioSegments.forEach((segment) => {
    combinedArrayBuffer.set(new Uint8Array(segment), offset);
    offset += segment.byteLength;
  });

  return combinedArrayBuffer.buffer;
};

export const PlaylistPlayer = ({ links }: { links: string[] }) => {
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadAndCombineAudio = async () => {
      const audioSegments = await fetchAudioSegments(links);
      const combinedAudioBuffer = combineAudioSegments(audioSegments);
      const audioBlob = new Blob([combinedAudioBuffer], { type: 'audio/mp3' });
      const audioUrl = URL.createObjectURL(audioBlob);
      setAudioUrl(audioUrl);
    };

    loadAndCombineAudio();
  }, [links]);

  return (
    <div>
      {audioUrl ? (
        <ReactPlayer
          url={audioUrl}
          playing
          controls
          width="1000px"
          height="50px"
        />
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};