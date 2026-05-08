import React from "react";
import { formatCurrency } from "../../utils/bookingHelpers";
import SeatIcon from "./SeatIcon";

const BookingSeat = ({ seat, isSelected, onSelect, isAisle }) => {
  const isBooked = seat.booked;
  const type = seat.type || "NORMAL";
  const code = seat.code || "";
  const label = code.length > 1 ? code.substring(1) : code;
  const title = `${code} - ${formatCurrency(seat.price)}`;

  const marginClass = isAisle ? "mr-10 sm:mr-14" : "mx-0.5 sm:mx-1";
  const sizeClass = type === "COUPLE" ? "w-20 h-9 sm:w-[5.5rem] sm:h-10" : "w-9 h-9 sm:w-10 sm:h-10";

  return (
    <SeatIcon
      type={type}
      isBooked={isBooked}
      isSelected={isSelected}
      label={label}
      onClick={() => onSelect(seat)}
      title={title}
      className={`${sizeClass} ${marginClass}`}
    />
  );
};

export default React.memo(BookingSeat);
