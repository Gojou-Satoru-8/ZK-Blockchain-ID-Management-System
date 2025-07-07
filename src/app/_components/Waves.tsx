import React from "react";

const Waves = () => {
  return (
    <svg
      viewBox="0 0 1200 320"
      xmlns="http://www.w3.org/2000/svg"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        width: "100%",
        height: "auto",
        zIndex: -1,
      }}
    >
      <defs>
        <style>
          {`
        @keyframes moveWave {
          0% { transform: translateX(0); }
          50% { transform: translateX(-20%); }
          100% { transform: translateX(-200px); }
        }
      `}
        </style>
      </defs>
      <g>
        {/* Back wave - lightest blue */}
        <path
          fill="#6499E9"
          d="M0,80L60,100C120,120,240,160,360,180C480,200,600,220,720,230C840,220,960,200,1080,160C1200,120,1320,100,1380,80L1440,60L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          style={{
            animation: "moveWave 20s linear infinite",
            transformOrigin: "center",
          }}
        />

        {/* Middle wave - medium blue */}
        <path
          fill="#9EDDFF"
          d="M0,100L60,120C120,140,240,180,360,200C480,220,600,240,720,250C840,240,960,220,1080,180C1200,140,1320,120,1380,100L1440,80L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          style={{
            animation: "moveWave 25s linear infinite reverse",
            transformOrigin: "center",
          }}
        />

        {/* Front wave - darkest blue */}
        <path
          fill="#27005D"
          d="M0,150L60,170C120,190,240,210,360,220C480,230,600,240,720,245C840,240,960,230,1080,210C1200,190,1320,170,1380,150L1440,130L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          style={{
            animation: "moveWave 38s linear infinite",
            transformOrigin: "center",
          }}
        />
      </g>
    </svg>
  );
};

export default Waves;
