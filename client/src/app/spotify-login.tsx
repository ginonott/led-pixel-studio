"use client";
import { useEffect, useState } from "react";
import { Button } from "./components";
import { useRouter } from "next/navigation";

function generateRandomString(length: number) {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
}

async function sha256(plain: string) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64encode(input: ArrayBuffer) {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

export function isTokenExpired() {
  return (
    Date.now() >
    parseInt(window.localStorage.getItem("access_token_expiration") || "0")
  );
}

export default function SpotifyLogin() {
  const [expired, setExpired] = useState<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    const expired = isTokenExpired();

    if (expired) {
      [
        "code_verifier",
        "redirect_uri",
        "access_token",
        "access_token_expiration",
      ].forEach((key) => window.localStorage.removeItem(key));
      setExpired(true);
    }
  }, []);

  if (!expired) {
    return (
      <Button
        variant="spotify"
        onClick={() => {
          router.push("/visualizer");
        }}
      >
        Spotify Visualizer
      </Button>
    );
  }

  return (
    <Button
      variant="spotify"
      onClick={async () => {
        [
          "code_verifier",
          "redirect_uri",
          "access_token",
          "access_token_expiration",
        ].forEach((key) => window.localStorage.removeItem(key));

        const codeVerifier = generateRandomString(64);
        const hashed = await sha256(codeVerifier);
        const codeChallenge = base64encode(hashed);

        const clientId = "d6a017eea7024640b3ceee1f5a3c5759";
        const redirectUri = `${window.location.origin}/spotify-callback`;

        const scope = "playlist-read-private playlist-read-collaborative";
        const authUrl = new URL("https://accounts.spotify.com/authorize");

        // generated in the previous step
        window.localStorage.setItem("code_verifier", codeVerifier);
        window.localStorage.setItem("redirect_uri", redirectUri);

        const params = {
          response_type: "code",
          client_id: clientId,
          scope,
          code_challenge_method: "S256",
          code_challenge: codeChallenge,
          redirect_uri: redirectUri,
        };

        authUrl.search = new URLSearchParams(params).toString();
        window.location.href = authUrl.toString();
      }}
    >
      Login with Spotify
    </Button>
  );
}
