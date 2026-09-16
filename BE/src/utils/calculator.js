/**
 * Shutter and Quotation Calculation Engine for Swagat Industries ERP
 * Implements the exact business rules from Swagat ERP specification.
 */

function roundTo(num, decimals = 2) {
  const factor = Math.pow(10, decimals);
  return Math.round((Number(num) + Number.EPSILON) * factor) / factor;
}

/**
 * Calculate single shutter item dimensions and basic costs
 */
function calculateShutterItem(item) {
  const heightInches = parseFloat(item.height_inches !== undefined ? item.height_inches : item.heightInches) || 0;
  const widthInches = parseFloat(item.width_inches !== undefined ? item.width_inches : item.widthInches) || 0;
  const shutterType = item.shutter_type || item.shutterType || 'Manual';
  const fittingType = item.fitting_type || item.fittingType || 'A Type';
  const ratePerSqft = parseFloat(item.rate_per_sqft !== undefined ? item.rate_per_sqft : item.ratePerSqft) || 0;
  const giTopCoverRate = parseFloat(item.gi_top_cover_rate_per_sqft !== undefined ? item.gi_top_cover_rate_per_sqft : item.giTopCoverRatePerSqft) || 0;
  
  let gearPrice = parseFloat(item.gear_price !== undefined ? item.gear_price : item.gearPrice) || 0;
  let motorPrice = parseFloat(item.motor_price !== undefined ? item.motor_price : item.motorPrice) || 0;

  // Manual shutters do not have gear/motor price
  if (shutterType === 'Manual') {
    gearPrice = 0;
    motorPrice = 0;
  } else if (shutterType === 'Gear') {
    motorPrice = 0;
  } else if (shutterType === 'Motorised') {
    gearPrice = 0;
  }

  // Convert inches to feet: ROUND(HEIGHT / 12, 2)
  const heightFt = roundTo(heightInches / 12, 2);
  const widthFt = roundTo(widthInches / 12, 2);

  let overHeight = 0;
  let overWidth = 0;
  let coverSize = 0;

  if (shutterType === 'Manual') {
    overHeight = roundTo(heightFt + 1.50, 2);
    overWidth = roundTo(widthFt + 0.50, 2);
    coverSize = roundTo(overWidth + 0.50, 2);
  } else if (shutterType === 'Gear' || shutterType === 'Motorised') {
    overHeight = roundTo(heightFt + 2.00, 2);
    overWidth = roundTo(widthFt + 0.75, 2);
    coverSize = roundTo(overWidth + 0.75, 2);
  }

  // TOTAL_SQFT = OVER_HEIGHT * OVER_WIDTH
  const totalSqft = roundTo(overHeight * overWidth, 2);

  // SHUTTER_BASIC = (TOTAL_SQFT * RATE_PER_SQFT) + GEAR_OR_MOTOR_PRICE
  const gearOrMotorPrice = shutterType === 'Gear' ? gearPrice : (shutterType === 'Motorised' ? motorPrice : 0);
  const shutterBasic = roundTo((totalSqft * ratePerSqft) + gearOrMotorPrice, 2);

  // GI_TOP_COVER_BASIC = COVER_SIZE * GI_TOP_COVER_RATE_PER_SQFT
  const giTopCoverBasic = roundTo(coverSize * giTopCoverRate, 2);

  // Item Basic Total = Shutter Basic + GI Top Cover Basic
  const basicTotal = roundTo(shutterBasic + giTopCoverBasic, 2);

  return {
    heightInches,
    widthInches,
    heightFt,
    widthFt,
    shutterType,
    fittingType,
    overHeight,
    overWidth,
    totalSqft,
    coverSize,
    ratePerSqft,
    giTopCoverRatePerSqft: giTopCoverRate,
    gearPrice,
    motorPrice,
    shutterBasic,
    giTopCoverBasic,
    basicTotal
  };
}

/**
 * Calculate full quotation financial summary
 */
function calculateQuotationSummary({
  items = [],
  transportation = 0,
  additionalCharges = [],
  discountAmount = 0,
  gstApplicable = true,
  gstPercent = 18.00
}) {
  let shutterBasicTotal = 0;
  let giTopCoverTotal = 0;

  const processedItems = items.map((item, idx) => {
    const calc = calculateShutterItem(item);
    shutterBasicTotal = roundTo(shutterBasicTotal + calc.shutterBasic, 2);
    giTopCoverTotal = roundTo(giTopCoverTotal + calc.giTopCoverBasic, 2);

    return {
      ...item,
      ...calc,
      srNo: item.sr_no || item.srNo || (idx + 1)
    };
  });

  const transportationCharges = roundTo(parseFloat(transportation) || 0, 2);

  let additionalChargesTotal = 0;
  const processedAdditionalCharges = additionalCharges.map((chg) => {
    const amt = roundTo(parseFloat(chg.amount) || 0, 2);
    additionalChargesTotal = roundTo(additionalChargesTotal + amt, 2);
    return {
      description: (chg.description || '').trim(),
      amount: amt,
      chargeType: chg.charge_type || chg.chargeType || 'Quotation-wise',
      remark: chg.remark ? chg.remark.trim() : null
    };
  });

  const discount = roundTo(parseFloat(discountAmount) || 0, 2);

  // TOTAL_BASIC = Shutter Basic + GI Top Cover + Transportation + Additional Charges - Discount
  const totalBasic = roundTo(
    shutterBasicTotal + giTopCoverTotal + transportationCharges + additionalChargesTotal - discount,
    2
  );

  // GST calculation (Base includes transportation, additional charges, minus discount)
  let gstAmount = 0;
  const isGst = gstApplicable === true || gstApplicable === 'Yes' || gstApplicable === 'true' || gstApplicable === 1;
  const gstRate = parseFloat(gstPercent) || 18.00;

  if (isGst) {
    gstAmount = roundTo((totalBasic * gstRate) / 100, 2);
  }

  // FINAL_TOTAL = TOTAL_BASIC + GST_AMOUNT
  const finalTotal = roundTo(totalBasic + gstAmount, 2);

  return {
    processedItems,
    processedAdditionalCharges,
    shutterBasicTotal,
    giTopCoverTotal,
    transportationCharges,
    additionalChargesTotal,
    discountAmount: discount,
    totalBasic,
    gstApplicable: isGst,
    gstPercent: gstRate,
    gstAmount,
    finalTotal
  };
}

module.exports = {
  roundTo,
  calculateShutterItem,
  calculateQuotationSummary
};
