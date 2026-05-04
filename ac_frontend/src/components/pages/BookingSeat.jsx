import React from "react";
import { formatCurrency } from "../../utils/bookingHelpers";

const BookingSeat = ({ seat, isSelected, onSelect, isAisle }) => {
  const isBooked = seat.booked;
  const type = seat.type || "NORMAL";
  const code = seat.code || "";
  const label = code.length > 1 ? code.substring(1) : code;

  let fillColor = "#525252";
  let strokeColor = "none";
  let cursorStyle = isBooked
    ? "cursor-not-allowed opacity-40"
    : "cursor-pointer hover:brightness-110 hover:-translate-y-1";
  let shadowClass = "";

  if (!isBooked) {
    if (isSelected) {
      fillColor = "#EAB308";
      strokeColor = "#FACC15";
      shadowClass = "drop-shadow-[0_0_8px_rgba(234,179,8,0.6)] z-10 scale-110";
    } else {
      if (type === "VIP") fillColor = "#DC2626";
      if (type === "COUPLE") fillColor = "#DB2777";
    }
  } else {
    fillColor = "#262626";
  }

  const marginClass = isAisle ? "mr-10 sm:mr-14" : "mx-0.5 sm:mx-1";

  const handleClick = () => {
    if (!isBooked) onSelect(seat);
  };

  if (type === "COUPLE") {
    return (
      <div
        onClick={handleClick}
        className={`relative w-20 h-9 sm:w-[5.5rem] sm:h-10 flex justify-center items-end group transition-all duration-300 ${cursorStyle} ${marginClass} ${shadowClass}`}
        title={`${code} - ${formatCurrency(seat.price)}`}
      >
        <svg width="100%" height="100%" viewBox="0 0 96 40" fill="none">
          <path
            d="M10 4 H86 Q90 4 90 15 V25 H6 V15 Q6 4 10 4 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={isSelected ? 2 : 0}
          />
          <rect
            x="6"
            y="24"
            width="84"
            height="12"
            rx="4"
            fill={fillColor}
            className="brightness-110"
          />
          <path d="M2 14 H8 V36 H2 V14 Z" fill="#00000050" rx="2" />
          <path d="M88 14 H94 V36 H88 V14 Z" fill="#00000050" rx="2" />
          {isBooked && (
            <path
              d="M40 15 L60 35 M60 15 L40 35"
              stroke="#737373"
              strokeWidth="3"
            />
          )}
        </svg>
        <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white text-[10px] font-bold select-none mt-1">
          {isBooked ? "" : label}
        </span>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`relative w-9 h-9 sm:w-10 sm:h-10 flex justify-center items-end group transition-all duration-300 ${cursorStyle} ${marginClass} ${shadowClass}`}
      title={`${code} - ${formatCurrency(seat.price)}`}
    >
      <svg width="100%" height="100%" viewBox="0 0 40 40" fill="none">
        <path
          d="M6 4 H34 Q36 4 36 12 V24 H4 V12 Q4 4 6 4 Z"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={isSelected ? 2 : 0}
        />
        <rect
          x="4"
          y="22"
          width="32"
          height="12"
          rx="3"
          fill={fillColor}
          className="brightness-110"
        />
        <rect x="0" y="14" width="4" height="20" rx="2" fill="#00000050" />
        <rect x="36" y="14" width="4" height="20" rx="2" fill="#00000050" />
        {isBooked && (
          <path
            d="M12 12 L28 28 M28 12 L12 28"
            stroke="#737373"
            strokeWidth="3"
          />
        )}
      </svg>
      <span className="absolute top-2 left-1/2 -translate-x-1/2 text-white text-[10px] font-bold select-none -mt-0.5">
        {isBooked ? "" : label}
      </span>
    </div>
  );
};

export default React.memo(BookingSeat);
