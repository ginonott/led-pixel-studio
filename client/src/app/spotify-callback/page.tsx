"use client";

import { useRouter } from "next/router";
import { useEffect, useRef } from "react";

async function getToken(code: string) {
  // stored in the previous step
  const clientId = "d6a017eea7024640b3ceee1f5a3c5759";
  const codeVerifier = localStorage.getItem("code_verifier");
  const redirectUri = localStorage.getItem("redirect_uri");

  const authUrl = new URL("https://accounts.spotify.com/api/token");

  const payload = {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri!,
      code_verifier: codeVerifier!,
    }),
  };

  const body = await fetch(authUrl, payload);
  const response = await body.json();
  console.log(response.expires_in);

  localStorage.setItem("access_token", response.access_token);
  localStorage.setItem(
    "access_token_expiration",
    `${Date.now() + response.expires_in * 1000}`
  );
}

export default function SpotifyCallback() {
  const handlingRef = useRef<boolean>(false);
  useEffect(() => {
    if (handlingRef.current) return;
    handlingRef.current = true;

    const urlParams = new URLSearchParams(window.location.search);
    const error = urlParams.get("error");
    if (error) {
      console.log({ error });
      window.location.replace("/");
    }
    let code = urlParams.get("code");
    getToken(code!).then(() => {
      console.log("success!");
      window.location.replace("/");
    });
  }, []);

  return null;
}
