import React from "react";

interface APCLogoProps {
  className?: string;
}

export default function APCLogo({ className = "w-12 h-12" }: APCLogoProps) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={`${className} select-none`}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer Circle Ring */}
      <circle cx="100" cy="100" r="98" stroke="#1E293B" strokeWidth="2" fill="white" />
      
      <g clipPath="url(#logo-clip)">
        {/* Left vertical slice - Green */}
        <path d="M 0 0 L 70 0 L 70 145 L 0 145 Z" fill="#008751" />
        
        {/* Middle vertical slice - White */}
        <path d="M 70 0 L 130 0 L 130 145 L 70 145 Z" fill="#FFFFFF" />
        
        {/* Right vertical slice - Sky Blue */}
        <path d="M 130 0 L 200 0 L 200 145 L 130 145 Z" fill="#00ADEF" />

        {/* Bottom Area - Red */}
        <path d="M 0 145 L 200 145 L 200 200 L 0 200 Z" fill="#D10000" />

        {/* Text "APC" on Red Area */}
        <text
          x="100"
          y="184"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="36"
          textAnchor="middle"
          letterSpacing="2"
        >
          APC
        </text>

        {/* Hand holding Broom in the White Area */}
        {/* Arm and Sleeve at the bottom left of hand */}
        <path 
          d="M 64 140 C 64 125 74 122 83 122 C 86 122 92 128 94 133 L 95 140 Z" 
          fill="#8D5B4C" 
        />
        {/* Sleeve */}
        <path d="M 64 134 L 84 134 L 80 140 L 64 140 Z" fill="#1E40AF" />

        {/* Hand Fist */}
        <path 
          d="M 80 115 C 75 115 73 118 73 124 C 73 130 80 134 88 134 C 95 134 98 128 98 122 C 98 116 90 115 80 115 Z" 
          fill="#C68B59" 
        />
        
        {/* Finger Details */}
        <path d="M 78 116 C 78 114 82 114 82 116" stroke="#5E3F27" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 83 116 C 83 114 87 114 87 116" stroke="#5E3F27" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 88 117 C 88 115 92 115 92 117" stroke="#5E3F27" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M 93 119 C 93 117 97 117 97 119" stroke="#5E3F27" strokeWidth="1.5" strokeLinecap="round" />

        {/* Broom Bundle */}
        {/* Broom handle being held */}
        <rect x="83" y="102" width="6" height="30" rx="2" fill="#8B5A2B" transform="rotate(-5 83 102)" />
        
        {/* Broom Straw Bristles (fan out upwards) */}
        {/* Central bunch */}
        <path d="M 84 105 L 75 35 C 75 30, 95 30, 95 35 L 90 105 Z" fill="#CD853F" opacity="0.9" />
        {/* Details and straws */}
        <path d="M 86 105 L 68 40 L 102 40 L 88 105" stroke="#8B5A2B" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M 84 105 L 80 35 M 84 105 L 88 35 M 84 105 L 72 37 M 84 105 L 96 37 M 84 105 L 64 42 M 84 105 L 106 42" stroke="#5C3D1D" strokeWidth="0.8" />
        
        {/* Tie around the broom bundle */}
        <rect x="81" y="94" width="10" height="4" rx="1" fill="#D10000" />
        <rect x="82" y="90" width="8" height="3" rx="1" fill="#FFFFFF" />
      </g>

      {/* Clip path inside the circle to prevent overflow of content outside */}
      <defs>
        <clipPath id="logo-clip">
          <circle cx="100" cy="100" r="96" />
        </clipPath>
      </defs>
    </svg>
  );
}
