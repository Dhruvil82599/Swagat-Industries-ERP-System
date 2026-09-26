const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const outDir = path.join(__dirname, 'FE', 'public', 'screenshots', '09-employee-reports');
  fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const page = await context.newPage();

  console.log("1. Navigating to Login...");
  await page.goto("http://localhost:3000/login");
  await page.fill("#username-input", "admin");
  await page.fill("#password-input", "adminpassword123");
  await page.click("button[type='submit']");

  await page.waitForURL("**/modules");
  console.log("2. Opening Swagat Employee...");
  await page.click("text=Swagat Employee");
  await page.waitForURL("**/employee/dashboard");

  console.log("3. Opening Salary Reports...");
  await page.click("text=7. Salary Reports");
  await page.waitForURL("**/employee/reports");
  await page.waitForTimeout(2000);

  // Tab 1: Attendance Log
  await page.screenshot({ path: path.join(outDir, "01_attendance_log.png") });
  console.log("Captured 01_attendance_log.png");

  // Tab 2: Attendance Summary
  await page.getByText("2. Attendance Summary").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "02_attendance_summary.png") });
  console.log("Captured 02_attendance_summary.png");

  // Tab 3: Advance Report
  await page.getByText("3. Advance Report").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "03_advance_report.png") });
  console.log("Captured 03_advance_report.png");

  // Tab 4: Overtime Report
  await page.getByText("4. Overtime Report").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "04_overtime_report.png") });
  console.log("Captured 04_overtime_report.png");

  // Tab 5: Monthly Salary Report
  await page.getByText("5. Monthly Salary Report").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "05_monthly_salary_report.png") });
  console.log("Captured 05_monthly_salary_report.png");

  // Tab 6: Employee Salary Ledger
  await page.getByText("6. Employee Salary Ledger").click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(outDir, "06_employee_salary_ledger.png") });
  console.log("Captured 06_employee_salary_ledger.png");

  await browser.close();
  console.log("All 6 screenshots captured successfully!");
}

capture().catch(console.error);
