const { prisma } = require("./src/config/db");
const salaryPaymentController = require("./src/controllers/salaryPaymentController");
const salaryController = require("./src/controllers/salaryController");

async function runPhase7Tests() {
  console.log("=========================================");
  console.log("STARTING PHASE 7 SALARY PAYMENT TESTS");
  console.log("=========================================");

  try {
    // 1. Ensure test employee exists
    let emp = await prisma.employee.findFirst({
      where: { employeeCode: "EMP-TEST-P7" },
    });

    if (!emp) {
      emp = await prisma.employee.create({
        data: {
          employeeCode: "EMP-TEST-P7",
          fullName: "Phase7 Test Employee",
          mobileNumber: "9876543210",
          baseSalary: 30000,
          salaryType: "MONTHLY",
        },
      });
      console.log("✓ Created test employee:", emp.fullName, `(${emp.employeeCode})`);
    } else {
      console.log("✓ Found test employee:", emp.fullName);
    }

    // 2. Create or reset a salary record for 9/2026
    const month = 9;
    const year = 2026;

    let salary = await prisma.employeeSalary.findUnique({
      where: {
        employeeId_month_year: {
          employeeId: emp.id,
          month,
          year,
        },
      },
    });

    if (salary) {
      // Clean up previous payments for this test salary
      await prisma.employeeSalaryPayment.deleteMany({
        where: { salaryId: salary.id },
      });
      salary = await prisma.employeeSalary.update({
        where: { id: salary.id },
        data: {
          baseSalary: 30000,
          earnedBasic: 30000,
          grossSalary: 30000,
          advanceDeduction: 0,
          totalDeductions: 0,
          netSalary: 30000,
          status: "UNPAID",
        },
      });
    } else {
      salary = await prisma.employeeSalary.create({
        data: {
          employeeId: emp.id,
          month,
          year,
          baseSalary: 30000,
          earnedBasic: 30000,
          grossSalary: 30000,
          advanceDeduction: 0,
          totalDeductions: 0,
          netSalary: 30000,
          status: "UNPAID",
        },
      });
    }

    console.log(`✓ Prepared Salary Record ID ${salary.id} - Net Salary: ₹${salary.netSalary}`);

    // Helper res mocker
    function mockRes() {
      let statusCode = 200;
      let bodyData = null;
      return {
        status(code) {
          statusCode = code;
          return this;
        },
        json(data) {
          bodyData = data;
          return this;
        },
        get result() {
          return { statusCode, bodyData };
        },
      };
    }

    // TEST 1: Partial Payment 1 - ₹5,000 via CASH
    console.log("\n--- TEST 1: First Partial Payment (₹5,000 via CASH) ---");
    const req1 = {
      body: {
        salaryId: salary.id,
        amount: 5000,
        paymentMode: "CASH",
        referenceNumber: "CASH-001",
        remarks: "First installment",
      },
      user: { username: "Tester" },
    };
    const res1 = mockRes();
    await salaryPaymentController.createSalaryPayment(req1, res1, (err) => { throw err; });
    const out1 = res1.result;
    console.log("Status Code:", out1.statusCode);
    console.log("Response:", JSON.stringify(out1.bodyData));
    if (out1.statusCode !== 201 || out1.bodyData.data.status !== "PARTIALLY PAID") {
      throw new Error("TEST 1 FAILED: Expected PARTIALLY PAID status");
    }
    console.log("✓ TEST 1 PASSED: Status is PARTIALLY PAID, remaining balance: ₹" + out1.bodyData.data.remainingBalance);

    // TEST 2: Partial Payment 2 - ₹10,000 via BANK
    console.log("\n--- TEST 2: Second Partial Payment (₹10,000 via BANK) ---");
    const req2 = {
      body: {
        salaryId: salary.id,
        amount: 10000,
        paymentMode: "BANK",
        referenceNumber: "NEFT98765",
        remarks: "Second installment",
      },
      user: { username: "Tester" },
    };
    const res2 = mockRes();
    await salaryPaymentController.createSalaryPayment(req2, res2, (err) => { throw err; });
    const out2 = res2.result;
    console.log("Status Code:", out2.statusCode);
    console.log("Remaining Balance:", out2.bodyData.data.remainingBalance);
    if (out2.statusCode !== 201 || out2.bodyData.data.remainingBalance !== 15000) {
      throw new Error("TEST 2 FAILED: Remaining balance should be 15000");
    }
    console.log("✓ TEST 2 PASSED: Total paid ₹15,000 / ₹30,000, remaining: ₹15,000");

    // TEST 3: Overpayment Validation (Attempt ₹20,000 when remaining is ₹15,000)
    console.log("\n--- TEST 3: Overpayment Validation (₹20,000 > ₹15,000 remaining) ---");
    const req3 = {
      body: {
        salaryId: salary.id,
        amount: 20000,
        paymentMode: "UPI",
        referenceNumber: "UPI1234",
      },
      user: { username: "Tester" },
    };
    const res3 = mockRes();
    await salaryPaymentController.createSalaryPayment(req3, res3, (err) => { throw err; });
    const out3 = res3.result;
    console.log("Status Code:", out3.statusCode);
    console.log("Error Message:", out3.bodyData.message);
    if (out3.statusCode !== 400 || !out3.bodyData.message.includes("cannot exceed")) {
      throw new Error("TEST 3 FAILED: Overpayment should return HTTP 400 validation error");
    }
    console.log("✓ TEST 3 PASSED: Overpayment successfully rejected with clear error message");

    // TEST 4: Final Payment - ₹15,000 via UPI (Reaches Net Salary ₹30,000)
    console.log("\n--- TEST 4: Final Payment to reach FULLY PAID status (₹15,000 via UPI) ---");
    const req4 = {
      body: {
        salaryId: salary.id,
        amount: 15000,
        paymentMode: "UPI",
        referenceNumber: "UPI-FINAL-001",
        remarks: "Final installment",
      },
      user: { username: "Tester" },
    };
    const res4 = mockRes();
    await salaryPaymentController.createSalaryPayment(req4, res4, (err) => { throw err; });
    const out4 = res4.result;
    console.log("Status Code:", out4.statusCode);
    console.log("New Status:", out4.bodyData.data.status);
    console.log("Remaining Balance:", out4.bodyData.data.remainingBalance);
    if (out4.statusCode !== 201 || out4.bodyData.data.status !== "FULLY PAID") {
      throw new Error("TEST 4 FAILED: Expected FULLY PAID status");
    }
    console.log("✓ TEST 4 PASSED: Salary status successfully updated to FULLY PAID");

    // TEST 5: Check Dashboard Summary KPI Metrics
    console.log("\n--- TEST 5: Salary Payment Dashboard Summary ---");
    const req5 = { query: { month, year } };
    const res5 = mockRes();
    await salaryPaymentController.getSalaryDashboardSummary(req5, res5, (err) => { throw err; });
    const out5 = res5.result;
    console.log("Dashboard Summary:", JSON.stringify(out5.bodyData.data, null, 2));
    if (out5.statusCode !== 200 || out5.bodyData.data.totalPaid < 30000) {
      throw new Error("TEST 5 FAILED: Dashboard metrics calculation error");
    }
    console.log("✓ TEST 5 PASSED: Dashboard metrics aggregated correctly");

    console.log("\n=========================================");
    console.log("ALL PHASE 7 TESTS PASSED SUCCESSFULLY!");
    console.log("=========================================");
  } catch (err) {
    console.error("❌ PHASE 7 TEST FAILED:", err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

runPhase7Tests();
