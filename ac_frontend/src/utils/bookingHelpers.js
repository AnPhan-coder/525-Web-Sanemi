
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return "0 ₫";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

export const getAisleConfig = (seats) => {
  if (!seats || seats.length === 0) return [];

  const validSeats = seats.filter((s) => s && s.colIndex !== undefined && s.colIndex !== null);
  
  if (validSeats.length === 0) return [];

  const maxCol = Math.max(...validSeats.map((s) => Number(s.colIndex)));
  
  const centerBlock = 8;
  
  if (maxCol <= centerBlock) {
    return [];
  }

  const sideBlock = Math.floor((maxCol - centerBlock) / 2);
  
  return [sideBlock, sideBlock + centerBlock + 1];
};

export const checkOrphanSeats = (selectedIds, allSeats, aisleConfig) => {
  if (!allSeats || allSeats.length === 0) return false;
  if (!selectedIds || selectedIds.length === 0) return false;

  const futureState = new Map();
  const rows = new Set();

  allSeats.forEach((seat) => {
    if (!seat || !seat.code || seat.colIndex === undefined) return;

    const rowCode = seat.code.charAt(0);
    const colIndex = Number(seat.colIndex);
    rows.add(rowCode);

    const key = `${rowCode}-${colIndex}`;
    
    const willBeOccupied = seat.booked || selectedIds.includes(seat.id);
    
    futureState.set(key, {
      id: seat.id,
      type: seat.type,
      code: seat.code,
      willBeOccupied: willBeOccupied,
      colIndex: colIndex,
    });
  });

  const getFutureSlotStatus = (rowCode, colIndex) => {
    if (aisleConfig && aisleConfig.includes(colIndex)) {
      return "BLOCKED";
    }

    const key = `${rowCode}-${colIndex}`;
    const seat = futureState.get(key);

    if (!seat) return "BLOCKED";

    if (seat.willBeOccupied) return "BLOCKED";

    return "AVAILABLE";
  };
  const getCoupleOccupiedSlots = () => {
    const slots = new Set();
    
    allSeats.forEach((seat) => {
      if (!seat || !seat.code) return;
      
      if (seat.type === "COUPLE" && (seat.booked || selectedIds.includes(seat.id))) {
        const rowCode = seat.code.charAt(0);
        const col = Number(seat.colIndex);
        
        slots.add(`${rowCode}-${col}`);
        slots.add(`${rowCode}-${col + 1}`);
      }
    });
    
    return slots;
  };

  const coupleSlots = getCoupleOccupiedSlots();

  for (const row of rows) {
    const rowSeats = allSeats
      .filter((s) => s && s.code && s.code.charAt(0) === row)
      .sort((a, b) => Number(a.colIndex) - Number(b.colIndex));

    for (const seat of rowSeats) {
      if (!seat || !seat.code) continue;

      const col = Number(seat.colIndex);
      const key = `${row}-${col}`;

      if (seat.booked || selectedIds.includes(seat.id)) continue;
      
      if (seat.type === "COUPLE") continue;
      
      if (coupleSlots.has(key)) continue;

      const leftStatus = getFutureSlotStatus(row, col - 1);
      const rightStatus = getFutureSlotStatus(row, col + 1);

      if (leftStatus === "BLOCKED" && rightStatus === "BLOCKED") {
        console.warn(`⚠️ Orphan seat detected: ${seat.code} (${row}${col}) - Left: ${leftStatus}, Right: ${rightStatus}`);
        return true;
      }
    }
  }

  return false;
};

export const isValidSeat = (seat) => {
  return (
    seat &&
    seat.id &&
    seat.code &&
    seat.colIndex !== undefined &&
    seat.colIndex !== null &&
    seat.price !== undefined &&
    seat.price !== null
  );
};

export const getSelectedSeatsInfo = (selectedIds, allSeats) => {
  const selectedSeats = selectedIds
    .map((id) => allSeats.find((s) => s.id === id))
    .filter(isValidSeat);

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + (seat.price || 0), 0);
  
  const seatCodes = selectedSeats
    .map((s) => s.code)
    .sort()
    .join(", ");

  const seatTypes = {
    normal: selectedSeats.filter((s) => !s.type || s.type === "NORMAL").length,
    vip: selectedSeats.filter((s) => s.type === "VIP").length,
    couple: selectedSeats.filter((s) => s.type === "COUPLE").length,
  };

  return {
    seats: selectedSeats,
    count: selectedSeats.length,
    totalPrice,
    seatCodes,
    seatTypes,
  };
};