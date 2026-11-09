"use client";

import { cn } from "@/lib/utils";

export function PoufaEmblem({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 256 256"
      width="36"
      height="36"
      fill="none"
      role="img"
      aria-label="Emblème POUFA"
      style={{ maxWidth: "100%", maxHeight: "100%", flexShrink: 0 }}
      className={cn("size-9 shrink-0", className)}
    >
      <path
        d="M126 14C74 14 28 84 28 152C28 210 70 248 126 248C182 248 224 210 224 152C224 84 178 14 126 14Z"
        fill="#194D3B"
      />
      <path
        d="M126 24C80 24 38 89 38 152C38 204 75 238 126 238C177 238 214 204 214 152C214 89 172 24 126 24Z"
        fill="#EEF5F1"
      />
      <path
        d="M125 65C120 57 125 49 134 50C137 42 150 42 154 51C163 49 170 57 166 68C156 59 138 58 125 65Z"
        fill="#DAA025"
      />
      <path d="M171 74L182 83L168 86Q170 80 171 74Z" fill="#DAA025" />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M52 112C68 119 88 121 104 108C115 98 121 79 133 69C144 61 160 63 169 79C165 86 161 91 162 97C164 106 183 124 188 145C191 156 189 167 186 175L180 175C184 164 184 150 177 136C170 121 159 112 149 112C135 112 120 132 120 157C120 177 131 191 144 195L139 203C117 190 94 182 73 180C60 165 48 142 52 112Z"
        fill="#194D3B"
      />
      <circle cx="155" cy="77" r="4.2" fill="#EEF5F1" />
      <g
        stroke="#EEF5F1"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M51 141H71L80 132H101L112 121" />
        <path d="M54 158H74L83 149H107" />
        <path d="M62 172H97" />
      </g>
      <circle cx="112" cy="121" r="6.8" fill="#EEF5F1" />
      <circle cx="112" cy="121" r="3.4" fill="#194D3B" />
      <circle cx="107" cy="149" r="6.8" fill="#EEF5F1" />
      <circle cx="107" cy="149" r="3.4" fill="#194D3B" />
      <circle cx="97" cy="172" r="6.5" fill="#EEF5F1" />
      <circle cx="97" cy="172" r="3.2" fill="#194D3B" />
      <g
        stroke="#5964C5"
        strokeWidth="3.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M132 145V138Q132 135 135 135H142" />
        <path d="M161 135H168Q171 135 171 138V145" />
        <path d="M132 165V172Q132 175 135 175H142" />
        <path d="M161 175H168Q171 175 171 172V165" />
      </g>
      <rect
        x="140"
        y="143"
        width="10"
        height="10"
        rx="1"
        stroke="#194D3B"
        strokeWidth="2.6"
      />
      <rect
        x="140"
        y="158"
        width="10"
        height="10"
        rx="1"
        stroke="#194D3B"
        strokeWidth="2.6"
      />
      <rect x="155" y="142" width="9.5" height="9.5" rx="1" fill="#194D3B" />
      <rect x="154" y="155" width="4" height="4" rx="0.6" fill="#194D3B" />
      <rect x="160.5" y="155" width="4" height="6" rx="0.6" fill="#194D3B" />
      <rect x="154" y="162" width="4" height="6.5" rx="0.6" fill="#194D3B" />
      <rect x="160.5" y="164" width="4" height="4.5" rx="0.6" fill="#194D3B" />
      <path
        d="M51 185C78 182 114 191 138 212L137 222C112 202 82 195 58 197L51 185Z"
        fill="#578B36"
      />
      <path
        d="M62 204C85 202 114 209 136 228C126 232 115 234 104 233C89 221 75 216 62 217L62 204Z"
        fill="#578B36"
      />
      <path
        d="M82 225C99 224 117 229 133 236C114 237 96 233 82 225Z"
        fill="#578B36"
      />
      <path
        d="M141 231C139 201 162 183 204 173C201 205 182 223 146 234L141 231Z"
        fill="#578B36"
      />
      <path
        d="M143 233C152 214 164 201 178 193"
        stroke="#EEF5F1"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export default PoufaEmblem;

