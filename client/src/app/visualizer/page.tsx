"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "../components";
import useSWR from "swr";
import Image from "next/image";
import { isTokenExpired } from "../spotify-login";
import { redirect } from "next/navigation";

type SpotifyPlayer = {};

declare global {
  interface Window {
    Spotify: {
      Player: SpotifyPlayer;
    };
  }
}

function searchSpotify([_, search]: [string, string]): Promise<{
  tracks: {
    items: {
      name: string;
      album: {
        images: {
          url: string;
          width: number;
          height: number;
        }[];
      };
    }[];
  } | null;
}> {
  if (!search) {
    return Promise.resolve({
      tracks: {
        items: [],
      },
    });
  }

  const queryParams = new URLSearchParams({
    q: "Never Gonna Give You Up",
    type: "track",
    limit: "1",
  });

  console.log(window.localStorage.getItem("access_token"));

  return fetch("https://api.spotify.com/v1/search?" + queryParams.toString(), {
    headers: {
      Authorization: "Bearer " + window.localStorage.getItem("access_token"),
    },
  }).then((res) => res.json());
}

export default function VisualizerPage() {
  const player = useRef<SpotifyPlayer | null>(null);
  const [search, setSearch] = useState<string>("");
  const { data, error, isLoading } = useSWR(["search", search], searchSpotify);

  useEffect(() => {
    if (player.current) {
      return;
    }

    if (isTokenExpired()) {
      return redirect("/?action=spotify-login");
    }

    const token = window.localStorage.getItem("access_token");
    const player = new Spotify.Player({
      name: "Web Playback SDK Quick Start Player",
      getOAuthToken: (cb) => {
        cb(token);
      },
      volume: 0.5,
    });
  }, []);

  return (
    <div className="flex flex-col justify-middle m-auto">
      <h1>Visualizer</h1>
      <form
        className="flex flex-col"
        onSubmit={(event) => {
          event.preventDefault();
          const formData = new FormData(event.target as HTMLFormElement);
          setSearch(formData.get("search") as string);
        }}
      >
        <div className="flex flex-row">
          <input type="text" placeholder="Search" name="search" />
          <Button variant="spotify" type="submit">
            Search
          </Button>
        </div>
      </form>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error</p>}
      {data?.tracks?.items && (
        <ul>
          {data.tracks.items.map((item) => {
            return (
              <li key={item.name}>
                <p>{item.name}</p>
                <Image
                  src={item.album.images[0].url}
                  alt="album cover"
                  width={item.album.images[0].width}
                  height={item.album.images[0].height}
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
