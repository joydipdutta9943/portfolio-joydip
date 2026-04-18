export type CmdItem =
  | { id: string; label: string; meta: "NAV"; href: string }
  | { id: string; label: string; meta: "ACTION"; action: "copy-email" }
  | { id: string; label: string; meta: "ACTION"; href: string }
  | { id: string; label: string; meta: "EXT"; href: string }
  | { id: string; label: string; meta: "CASE STUDY"; href: string; tags: string[] };
