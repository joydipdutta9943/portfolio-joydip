import { useState } from "react";
import Button from "./Button";

const EMAIL = "joydip.dutta9943@gmail.com";

export default function CopyEmailButton() {
  const [copied, setCopied] = useState(false);

  const onClick = () => {
    if (typeof navigator === "undefined" || !navigator.clipboard) return;
    navigator.clipboard
      .writeText(EMAIL)
      .then(() => {
        setCopied(true);
        window.setTimeout(() => setCopied(false), 1600);
      })
      .catch(() => {
        // Fallback: open mailto
        window.location.href = `mailto:${EMAIL}`;
      });
  };

  return <Button onClick={onClick}>{copied ? "Copied to clipboard ✓" : EMAIL}</Button>;
}
