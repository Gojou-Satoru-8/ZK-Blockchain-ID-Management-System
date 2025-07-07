import React from "react";

const BackIcon = ({
  className = "",
  onClick = () => {},
}: {
  className?: string;
  onClick?: () => void;
}) => {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`cursor-pointer transition-all duration-300 hover:scale-110 text-gray-700 dark:text-gray-300 ${className}`}
      onClick={onClick}
    >
      <style jsx>{`
        .arrow-stem {
          transition: transform 0.3s ease;
        }
        .arrow-tip {
          transition: transform 0.3s ease;
        }
        svg:hover .arrow-tip {
          transform: translateX(-4px);
        }
        svg:hover .arrow-stem {
          transform: translateX(2px);
        }
      `}</style>

      {/* Arrow stem */}
      <line
        x1="19"
        y1="12"
        x2="8"
        y2="12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        className="arrow-stem"
      />

      {/* Arrow tip */}
      <g className="arrow-tip">
        <polyline
          points="11,7 6,12 11,17"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  );
};

export default BackIcon;
