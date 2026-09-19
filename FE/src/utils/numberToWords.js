/**
 * Utility to convert numeric amounts to Indian Currency Words format
 * Example: 324671.10 -> "Rupees Three Lakh Twenty-Four Thousand Six Hundred Seventy-One and Ten Paise Only"
 */

const a = [
  "",
  "One",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Eleven",
  "Twelve",
  "Thirteen",
  "Fourteen",
  "Fifteen",
  "Sixteen",
  "Seventeen",
  "Eighteen",
  "Nineteen",
];

const b = [
  "",
  "",
  "Twenty",
  "Thirty",
  "Forty",
  "Fifty",
  "Sixty",
  "Seventy",
  "Eighty",
  "Ninety",
];

function convertGroup(n) {
  let num = parseInt(n, 10);
  if (num === 0) return "";
  if (num < 20) return a[num];
  const tens = Math.floor(num / 10);
  const units = num % 10;
  return b[tens] + (units ? "-" + a[units] : "");
}

function convertHundreds(n) {
  let num = parseInt(n, 10);
  if (num === 0) return "";
  const hundred = Math.floor(num / 100);
  const remainder = num % 100;
  let str = "";
  if (hundred > 0) {
    str += a[hundred] + " Hundred";
  }
  if (remainder > 0) {
    if (str) str += " ";
    str += convertGroup(remainder);
  }
  return str;
}

export function numberToIndianWords(amount) {
  const numVal = parseFloat(amount);
  if (isNaN(numVal) || numVal < 0) return "Zero Rupees Only";
  if (numVal === 0) return "Rupees Zero Only";

  const parts = numVal.toFixed(2).split(".");
  let rupees = parseInt(parts[0], 10);
  let paise = parseInt(parts[1], 10);

  let rupeesStr = "";

  if (rupees === 0) {
    rupeesStr = "Zero";
  } else {
    // Crores (>= 10,00,00,00)
    const crores = Math.floor(rupees / 10000000);
    rupees = rupees % 10000000;

    // Lakhs (>= 1,00,000)
    const lakhs = Math.floor(rupees / 100000);
    rupees = rupees % 100000;

    // Thousands (>= 1,000)
    const thousands = Math.floor(rupees / 1000);
    rupees = rupees % 1000;

    // Hundreds & Below
    const hundreds = rupees;

    const partsArr = [];

    if (crores > 0) {
      partsArr.push(convertHundreds(crores) + " Crore");
    }
    if (lakhs > 0) {
      partsArr.push(convertHundreds(lakhs) + " Lakh");
    }
    if (thousands > 0) {
      partsArr.push(convertHundreds(thousands) + " Thousand");
    }
    if (hundreds > 0) {
      partsArr.push(convertHundreds(hundreds));
    }

    rupeesStr = partsArr.join(" ");
  }

  let paiseStr = "";
  if (paise > 0) {
    paiseStr = " and " + convertGroup(paise) + " Paise";
  }

  return `Rupees ${rupeesStr}${paiseStr} Only`;
}
