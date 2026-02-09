import type { Metadata } from "next";
import { Suspense } from "react";
import { PlayerFormUI } from "./PlayerFormUI";

export const metadata: Metadata = {
  title: "Player Output vs Value",
  description:
    "Compare player scoring output against market value. Find overpriced flops and hidden gems across top European leagues.",
};

export default function PlayerFormPage() {
  return (
    <Suspense>
      <PlayerFormUI />
    </Suspense>
  );
}
