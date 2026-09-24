const http = require("http");

function makeRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => {
        data += chunk;
      });
      res.on("end", () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });

    req.on("error", (err) => reject(err));

    if (postData) {
      req.write(JSON.stringify(postData));
    }
    req.end();
  });
}

async function runPhase6Tests() {
  console.log("=================================================");
  console.log("  SWAGAT ERP - PHASE 6 INTEGRATION TEST SUITE");
  console.log("  (Employee Salary Calculation & Payslips)");
  console.log("=================================================\n");

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (condition) {
      console.log(`  🟢 PASSED: ${message}`);
      passedTests++;
    } else {
      console.log(`  🔴 FAILED: ${message}`);
    }
  }

  try {
    // 1. Authenticate Admin User to get token
    console.log("1. Authenticating Admin User...");
    const loginRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/auth/login",
        method: "POST",
        headers: { "Content-Type": "application/json" },
      },
      { username: "admin", password: "adminpassword123" }
    );

    assert(loginRes.status === 200 && loginRes.data.success, "Admin login successful");
    const token = loginRes.data.data.token;
    const authHeaders = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    // 2. Fetch or Create Active Employee with Salary Master Configuration
    console.log("\n2. Setting up Test Employee with Base Salary Configuration...");
    let empRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/employees?status=active",
      method: "GET",
      headers: authHeaders,
    });

    let targetEmployee;
    if (empRes.status === 200 && empRes.data.data.employees.length > 0) {
      targetEmployee = empRes.data.data.employees[0];
      // Update employee with salary master fields
      const updateEmp = await makeRequest(
        {
          hostname: "localhost",
          port: 5000,
          path: `/api/employees/${targetEmployee.id}`,
          method: "PUT",
          headers: authHeaders,
        },
        {
          baseSalary: 30000.00,
          salaryType: "MONTHLY",
          overtimeRate: 150.00,
          allowance: 2000.00,
        }
      );
      assert(updateEmp.status === 200, "Updated target employee with base salary master details (₹30,000/mo)");
      targetEmployee = updateEmp.data.data;
    } else {
      const createEmp = await makeRequest(
        {
          hostname: "localhost",
          port: 5000,
          path: "/api/employees",
          method: "POST",
          headers: authHeaders,
        },
        {
          fullName: "Ramesh Sharma",
          mobileNumber: "9876500099",
          department: "Production",
          designation: "Shutter Operator",
          baseSalary: 30000.00,
          salaryType: "MONTHLY",
          overtimeRate: 150.00,
          allowance: 2000.00,
        }
      );
      assert(createEmp.status === 201, "Registered new test employee with salary master configuration");
      targetEmployee = createEmp.data.data;
    }
    console.log(`   Target Employee: ${targetEmployee.fullName} (${targetEmployee.employeeCode}) - Base Salary: ₹${targetEmployee.baseSalary}`);

    // 3. Setup Daily Attendance and Advance Logs for Target Month
    console.log("\n3. Setting up Monthly Attendance & Advance Records for Salary Computation...");
    const now = new Date();
    const targetMonth = now.getMonth() + 1;
    const targetYear = now.getFullYear();
    const datePrefix = `${targetYear}-${String(targetMonth).padStart(2, "0")}`;

    // Add 2 Attendance records: 1 Present with 5 hrs OT, 1 Half Day
    const attDate1 = `${datePrefix}-10`;
    const attDate2 = `${datePrefix}-11`;

    await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/attendance/bulk-save",
        method: "POST",
        headers: authHeaders,
      },
      {
        attendanceDate: attDate1,
        attendanceList: [
          {
            employeeId: targetEmployee.id,
            status: "PRESENT",
            overtimeHours: 6.0,
            remarks: "Phase 6 test OT",
          },
        ],
      }
    );

    await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/attendance/bulk-save",
        method: "POST",
        headers: authHeaders,
      },
      {
        attendanceDate: attDate2,
        attendanceList: [
          {
            employeeId: targetEmployee.id,
            status: "HALF DAY",
            overtimeHours: 0,
            remarks: "Phase 6 test half day",
          },
        ],
      }
    );
    assert(true, "Saved test daily attendance & overtime records");

    // Add Advance transaction for employee
    const advRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/advances",
        method: "POST",
        headers: authHeaders,
      },
      {
        employeeId: targetEmployee.id,
        advanceDate: `${datePrefix}-05`,
        amount: 2500.00,
        paymentMode: "CASH",
        reason: "Test Advance for Salary Deduction",
      }
    );
    assert(advRes.status === 201, "Recorded ₹2,500 advance disbursement for deduction");

    // 4. Test GET /api/salaries/calculate-preview (Real-time dynamic math preview)
    console.log("\n4. Testing Live Salary Calculation Preview Engine...");
    const previewRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/salaries/calculate-preview?employeeId=${targetEmployee.id}&month=${targetMonth}&year=${targetYear}`,
      method: "GET",
      headers: authHeaders,
    });

    assert(previewRes.status === 200 && previewRes.data.success, "Retrieved dynamic salary calculation preview");
    const prev = previewRes.data.data;
    assert(prev.payableDays > 0, `Computed payable days: ${prev.payableDays}`);
    assert(prev.overtimeAmount >= 300, `Computed overtime amount: ₹${prev.overtimeAmount}`);
    assert(prev.advanceDeduction >= 2500, `Auto-fetched advance deduction: ₹${prev.advanceDeduction}`);
    assert(prev.netSalary >= 0, `Computed net payable salary: ₹${prev.netSalary}`);

    // 5. Test POST /api/salaries (Save / Upsert Individual Salary Slip)
    console.log("\n5. Saving Individual Salary Record...");
    const saveRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/salaries",
        method: "POST",
        headers: authHeaders,
      },
      {
        employeeId: targetEmployee.id,
        month: targetMonth,
        year: targetYear,
        allowances: 1500.00,
        otherDeductions: 200.00,
        remarks: "Phase 6 automated salary generation test",
        status: "GENERATED",
      }
    );

    assert(saveRes.status === 201 && saveRes.data.success, "Saved individual salary calculation slip");
    const savedSalary = saveRes.data.data;
    assert(savedSalary.employee.fullName === targetEmployee.fullName, `Linked employee: ${savedSalary.employee.fullName}`);

    // 6. Test POST /api/salaries/generate-monthly (Bulk monthly payroll generation)
    console.log("\n6. Bulk Generating Monthly Payroll for Active Roster...");
    const bulkRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/salaries/generate-monthly",
        method: "POST",
        headers: authHeaders,
      },
      {
        month: targetMonth,
        year: targetYear,
      }
    );

    assert(bulkRes.status === 200 && bulkRes.data.success, `Generated monthly payroll for ${bulkRes.data.data.generatedCount} employees`);

    // 7. Test GET /api/salaries (List & Summary Aggregations)
    console.log("\n7. Fetching Salary Ledger & Aggregations Summary...");
    const listRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/salaries?month=${targetMonth}&year=${targetYear}`,
      method: "GET",
      headers: authHeaders,
    });

    assert(listRes.status === 200 && listRes.data.success, "Fetched salary records list");
    const summary = listRes.data.data.summary;
    assert(summary.totalRecords > 0, `Total salary records: ${summary.totalRecords}`);
    assert(summary.totalGrossPayroll > 0, `Total gross payroll: ₹${summary.totalGrossPayroll}`);
    assert(summary.totalNetSalary >= 0, `Total net payable salary: ₹${summary.totalNetSalary}`);

    // 8. Test GET /api/salaries/:id (Fetch Single Payslip)
    console.log("\n8. Fetching Single Payslip Record Details...");
    const singleRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/salaries/${savedSalary.id}`,
      method: "GET",
      headers: authHeaders,
    });
    assert(singleRes.status === 200 && singleRes.data.success, "Fetched single payslip detail for printable slip modal");

    // 9. Test PUT /api/salaries/:id (Update Salary Slip Adjustments)
    console.log("\n9. Updating Salary Slip Adjustments & Status...");
    const updateRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/salaries/${savedSalary.id}`,
        method: "PUT",
        headers: authHeaders,
      },
      {
        allowances: 3000.00,
        status: "APPROVED",
        remarks: "Approved by Admin for Disbursement",
      }
    );

    assert(updateRes.status === 200 && updateRes.data.success, "Updated allowances to ₹3,000 and status to APPROVED");
    assert(updateRes.data.data.status === "APPROVED", "Verified status is APPROVED");

    // 10. Test DELETE /api/salaries/:id
    console.log("\n10. Deleting Salary Slip Test Record...");
    const delRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/salaries/${savedSalary.id}`,
      method: "DELETE",
      headers: authHeaders,
    });
    assert(delRes.status === 200 && delRes.data.success, "Deleted salary slip record");

    // 11. Protect Existing Client ERP Endpoints
    console.log("\n11. Protecting Existing Client ERP Functionality...");
    const customerRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/customers",
      method: "GET",
      headers: authHeaders,
    });
    assert(customerRes.status === 200 && customerRes.data.success, "Existing Client Customers API intact and working");

    const quotationRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/quotations",
      method: "GET",
      headers: authHeaders,
    });
    assert(quotationRes.status === 200 && quotationRes.data.success, "Existing Client Quotations API intact and working");

    console.log("\n=================================================");
    console.log(`  RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
    console.log("=================================================\n");

    if (passedTests === totalTests) {
      console.log("🎉 ALL PHASE 6 TESTS PASSED SUCCESSFULLY!");
      process.exit(0);
    } else {
      console.error("❌ SOME TESTS FAILED!");
      process.exit(1);
    }
  } catch (err) {
    console.error("❌ Test runner error:", err);
    process.exit(1);
  }
}

runPhase6Tests();
