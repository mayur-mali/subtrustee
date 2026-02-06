export const getStartAndEndOfMonth = () => {
  const istDate = new Date().toLocaleString("en-US", {
    timeZone: "Asia/Kolkata",
  });
  const currentDate = new Date(istDate);

  const formatDate = (date: any) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const todayDate = formatDate(currentDate);

  const startDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1,
    0,
    0,
    0,
  );
  const formattedStartDate = formatDate(startDate);

  const endDate = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() + 1,
    0,
    0,
    0,
    0,
  );
  const formattedEndDate = formatDate(endDate);

  return {
    startDate: formattedStartDate,
    endDate: formattedEndDate,
    currentDate: todayDate,
  };
};

export function getPreviousMonthYear() {
  const currentDate = new Date();
  let month = currentDate.getMonth() + 1;
  let year = currentDate.getFullYear();

  if (month === 1) {
    month = 12;
    year -= 1;
  } else {
    month -= 1;
  }

  return { year, month };
}

export function getDateRange(month: number, year: number) {
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const firstDate = new Date(year, month - 1, 1);
  const lastDate = new Date(year, month, 0);

  const startDate = `${String(firstDate.getDate()).padStart(2, "0")} ${monthNames[firstDate.getMonth()]} ${firstDate.getFullYear()}`;
  const endDate = `${String(lastDate.getDate()).padStart(2, "0")} ${monthNames[lastDate.getMonth()]} ${lastDate.getFullYear()}`;

  return `${startDate} - ${endDate}`;
}
