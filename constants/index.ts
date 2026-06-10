export const sidebarLinks = [
  {
    imgURL: "/icons/home.svg",
    route: "/",
    label: "Home",
  },
  {
    imgURL: "/icons/dollar-circle.svg",
    route: "/my-banks",
    label: "My Banks",
  },
  {
    imgURL: "/icons/transaction.svg",
    route: "/transaction-history",
    label: "Transaction History",
  },
  {
    imgURL: "/icons/money-send.svg",
    route: "/payment-transfer",
    label: "Transfer Funds",
  },
];

// good_user / good_password - Bank of America
export const TEST_USER_ID = "6627ed3d00267aa6fa3e";

// custom_user -> Chase Bank
// export const TEST_ACCESS_TOKEN =
//   "access-sandbox-da44dac8-7d31-4f66-ab36-2238d63a3017";

// custom_user -> Chase Bank
export const TEST_ACCESS_TOKEN =
  "access-sandbox-229476cf-25bc-46d2-9ed5-fba9df7a5d63";

export const ITEMS = [
  {
    id: "6624c02e00367128945e", // appwrite item Id
    accessToken: "access-sandbox-83fd9200-0165-4ef8-afde-65744b9d1548",
    itemId: "VPMQJKG5vASvpX8B6JK3HmXkZlAyplhW3r9xm",
    userId: "6627ed3d00267aa6fa3e",
    accountId: "X7LMJkE5vnskJBxwPeXaUWDBxAyZXwi9DNEWJ",
  },
  {
    id: "6627f07b00348f242ea9", // appwrite item Id
    accessToken: "access-sandbox-74d49e15-fc3b-4d10-a5e7-be4ddae05b30",
    itemId: "Wv7P6vNXRXiMkoKWPzeZS9Zm5JGWdXulLRNBq",
    userId: "6627ed3d00267aa6fa3e",
    accountId: "x1GQb1lDrDHWX4BwkqQbI4qpQP1lL6tJ3VVo9",
  },
];

export const topCategoryStyles = {
  "FOOD AND DRINK": {
    bg: "bg-red-50 dark:bg-red-950/30",
    circleBg: "bg-red-100 dark:bg-red-900",
    text: {
      main: "text-red-900 dark:text-red-200",
      count: "text-red-700 dark:text-red-300",
    },
    progress: {
      bg: "bg-red-100 dark:bg-red-900",
      indicator: "bg-red-600",
    },
    icon: "/icons/shopping-bag.svg",
  },

  TRAVEL: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    circleBg: "bg-sky-100 dark:bg-sky-900",
    text: {
      main: "text-sky-900 dark:text-sky-200",
      count: "text-sky-700 dark:text-sky-300",
    },
    progress: {
      bg: "bg-sky-100 dark:bg-sky-900",
      indicator: "bg-sky-600",
    },
    icon: "/icons/dollar-circle.svg",
  },

  TRANSPORTATION: {
    bg: "bg-purple-50 dark:bg-purple-950/30",
    circleBg: "bg-purple-100 dark:bg-purple-900",
    text: {
      main: "text-purple-900 dark:text-purple-200",
      count: "text-purple-700 dark:text-purple-300",
    },
    progress: {
      bg: "bg-purple-100 dark:bg-purple-900",
      indicator: "bg-purple-600",
    },
    icon: "/icons/payment-transfer.svg",
  },

  "GENERAL MERCHANDISE": {
    bg: "bg-orange-50 dark:bg-orange-950/30",
    circleBg: "bg-orange-100 dark:bg-orange-900",
    text: {
      main: "text-orange-900 dark:text-orange-200",
      count: "text-orange-700 dark:text-orange-300",
    },
    progress: {
      bg: "bg-orange-100 dark:bg-orange-900",
      indicator: "bg-orange-600",
    },
    icon: "/icons/shopping-bag.svg",
  },

  "TRANSFER IN": {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    circleBg: "bg-emerald-100 dark:bg-emerald-900",
    text: {
      main: "text-emerald-900 dark:text-emerald-200",
      count: "text-emerald-700 dark:text-emerald-300",
    },
    progress: {
      bg: "bg-emerald-100 dark:bg-emerald-900",
      indicator: "bg-emerald-600",
    },
    icon: "/icons/deposit.svg",
  },

  "LOAN PAYMENTS": {
    bg: "bg-yellow-50 dark:bg-yellow-950/30",
    circleBg: "bg-yellow-100 dark:bg-yellow-900",
    text: {
      main: "text-yellow-900 dark:text-yellow-200",
      count: "text-yellow-700 dark:text-yellow-300",
    },
    progress: {
      bg: "bg-yellow-100 dark:bg-yellow-900",
      indicator: "bg-yellow-600",
    },
    icon: "/icons/credit-card.svg",
  },

  Transfer: {
    bg: "bg-pink-50 dark:bg-pink-950/30",
    circleBg: "bg-pink-100 dark:bg-pink-900",
    text: {
      main: "text-pink-900 dark:text-pink-200",
      count: "text-pink-700 dark:text-pink-300",
    },
    progress: {
      bg: "bg-pink-100 dark:bg-pink-900",
      indicator: "bg-pink-600",
    },
    icon: "/icons/money-send.svg",
  },

  default: {
    bg: "bg-gray-50 dark:bg-gray-900",
    circleBg: "bg-gray-100 dark:bg-gray-800",
    text: {
      main: "text-gray-900 dark:text-white",
      count: "text-gray-700 dark:text-gray-300",
    },
    progress: {
      bg: "bg-gray-100 dark:bg-gray-800",
      indicator: "bg-gray-500",
    },
    icon: "/icons/transaction.svg",
  },
};

export const transactionCategoryStyles = {
  "FOOD AND DRINK": {
    borderColor: "border-red-600",
    backgroundColor: "bg-red-600",
    textColor: "text-red-700 dark:text-red-300",
    chipBackgroundColor: "bg-red-100 dark:bg-red-950/30",
  },

  TRAVEL: {
    borderColor: "border-sky-600",
    backgroundColor: "bg-sky-600",
    textColor: "text-sky-700 dark:text-sky-300",
    chipBackgroundColor: "bg-sky-100 dark:bg-sky-950/30",
  },

  TRANSPORTATION: {
    borderColor: "border-purple-600",
    backgroundColor: "bg-purple-600",
    textColor: "text-purple-700 dark:text-purple-300",
    chipBackgroundColor: "bg-purple-100 dark:bg-purple-950/30",
  },

  "GENERAL MERCHANDISE": {
    borderColor: "border-orange-600",
    backgroundColor: "bg-orange-600",
    textColor: "text-orange-700 dark:text-orange-300",
    chipBackgroundColor: "bg-orange-100 dark:bg-orange-950/30",
  },

  "TRANSFER IN": {
    borderColor: "border-emerald-600",
    backgroundColor: "bg-emerald-600",
    textColor: "text-emerald-700 dark:text-emerald-300",
    chipBackgroundColor: "bg-emerald-100 dark:bg-emerald-950/30",
  },

  "LOAN PAYMENTS": {
    borderColor: "border-yellow-600",
    backgroundColor: "bg-yellow-600",
    textColor: "text-yellow-700 dark:text-yellow-300",
    chipBackgroundColor: "bg-yellow-100 dark:bg-yellow-950/30",
  },

  Transfer: {
    borderColor: "border-pink-600",
    backgroundColor: "bg-pink-600",
    textColor: "text-pink-700 dark:text-pink-300",
    chipBackgroundColor: "bg-pink-100 dark:bg-pink-950/30",
  },

  Processing: {
    borderColor: "border-amber-500",
    backgroundColor: "bg-amber-500",
    textColor: "text-amber-700 dark:text-amber-300",
    chipBackgroundColor: "bg-amber-100 dark:bg-amber-950/30",
  },

  Success: {
    borderColor: "border-green-500",
    backgroundColor: "bg-green-500",
    textColor: "text-green-700 dark:text-green-300",
    chipBackgroundColor: "bg-green-100 dark:bg-green-950/30",
  },

  default: {
    borderColor: "border-gray-500",
    backgroundColor: "bg-gray-500",
    textColor: "text-gray-700 dark:text-gray-300",
    chipBackgroundColor: "bg-gray-100 dark:bg-gray-800",
  },
};
