/* eslint-disable @typescript-eslint/no-unused-vars */
function filterTransactionsByMonth(
  transactions: any,
  year: number,
  month: number,
) {
  const filterTransactionArray = transactions?.filter((transaction: any) => {
    const transactionDate = new Date(Number(transaction?.createdAt));
    return (
      transactionDate.getFullYear() === year &&
      transactionDate.getMonth() === month - 1
    );
  });

  const totalTransactionAmount = filterTransactionArray
    ?.filter((transaction: any) => {
      return (
        transaction?.transaction_amount && transaction?.status === "SUCCESS"
      );
    })
    ?.reduce((acc: any, curr: any) => acc + curr.transaction_amount, 0);
  const totalCommissionAmount = filterTransactionArray
    ?.filter((transaction: any) => {
      return transaction?.commission_amount;
    })
    ?.reduce((acc: any, curr: any) => acc + curr.commission_amount, 0);

  return {
    month,
    transactionCount: filterTransactionArray?.length,
    totalTransactionAmount,
    totalCommissionAmount,
  };
}

function filterTransactionsByQuarter(
  transactions: any,
  year: number,
  quarter: number,
) {
  const startMonth = (quarter - 1) * 3;
  const endMonth = startMonth + 2;

  const filterTransactionArray = transactions?.filter((transaction: any) => {
    const transactionDate = new Date(Number(transaction?.createdAt));
    const transactionMonth = transactionDate.getMonth();
    return (
      transactionDate.getFullYear() === year &&
      transactionMonth >= startMonth &&
      transactionMonth <= endMonth
    );
  });

  const totalTransactionAmount = filterTransactionArray
    ?.filter((transaction: any) => {
      return (
        transaction?.transaction_amount && transaction?.status === "SUCCESS"
      );
    })
    ?.reduce((acc: any, curr: any) => acc + curr.transaction_amount, 0);
  const totalCommissionAmount = filterTransactionArray
    ?.filter((transaction: any) => {
      return transaction?.commission_amount;
    })
    ?.reduce((acc: any, curr: any) => acc + curr.commission_amount, 0);
  return {
    quarter,
    transactionCount: filterTransactionArray?.length,
    totalTransactionAmount,
    totalCommissionAmount,
  };
}

function formatNumber(num: number) {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

function sumTransactionAmountOfToday(transactions: any) {
  let sum: any = 0;
  let count: any = 0;
  transactions?.forEach((transaction: any) => {
    if (transaction.status.toUpperCase() === "SUCCESS") {
      const dateOfTransaction = new Date(transaction?.createdAt).toLocaleString(
        "en-US",
        {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        },
      );
      const todaysDate = new Date().toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      if (dateOfTransaction === todaysDate) {
        count++;
        sum = sum + transaction.transaction_amount;
      }
    }
  });
  return { sum, count };
}
function getSettlementAmount(settlements: any) {
  let sum = 0;
  const recentSettlementDate = new Date(
    settlements?.[0]?.settlementDate,
  ).toLocaleString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  if (!recentSettlementDate) {
    return sum;
  } else {
    for (let i = 0; i < settlements?.length; i++) {
      const dateOfSettlement = new Date(
        settlements?.[i]?.settlementDate,
      ).toLocaleString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      if (
        dateOfSettlement === recentSettlementDate &&
        (settlements?.[i]?.status === "Settled" ||
          settlements?.[i]?.status === "SUCCESS")
      ) {
        sum += settlements?.[i]?.netSettlementAmount;
      }
    }
    return sum;
  }
}
function getRecentTransactions(transactions: any) {
  let recenetTransactions = [];
  for (
    let i = 0;
    i < transactions?.length && recenetTransactions?.length < 10;
    i++
  ) {
    if (transactions?.[i]?.status?.toUpperCase() === "SUCCESS") {
      recenetTransactions.push(transactions?.[i]);
    }
  }
  return recenetTransactions;
}

export {
  filterTransactionsByMonth,
  filterTransactionsByQuarter,
  sumTransactionAmountOfToday,
  getSettlementAmount,
  formatNumber,
  getRecentTransactions,
};
