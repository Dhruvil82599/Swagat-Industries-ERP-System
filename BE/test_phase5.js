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

async function runPhase5Tests() {
  console.log("=================================================");
  console.log("  SWAGAT ERP - PHASE 5 INTEGRATION TEST SUITE");
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

    // 2. Fetch Active Employees
    console.log("\n2. Fetching Active Employee Roster...");
    const empRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/employees?status=active",
      method: "GET",
      headers: authHeaders,
    });

    assert(empRes.status === 200 && empRes.data.data.employees.length > 0, "Active employees roster fetched");
    const targetEmployee = empRes.data.data.employees[0];
    console.log(`   Selected Target Employee: ${targetEmployee.fullName} (${targetEmployee.employeeCode})`);

    // 3. Test Invalid Advance Creation (Validation Errors)
    console.log("\n3. Testing Backend Input Validation Controls...");
    const invalidRes1 = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/advances",
        method: "POST",
        headers: authHeaders,
      },
      { employeeId: targetEmployee.id, amount: -500, paymentMode: "CASH" }
    );
    assert(invalidRes1.status === 400 && !invalidRes1.data.success, "Rejected negative advance amount (-500)");

    const invalidRes2 = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/advances",
        method: "POST",
        headers: authHeaders,
      },
      { employeeId: 99999, amount: 1000, paymentMode: "CASH" }
    );
    assert(invalidRes2.status === 404 && !invalidRes2.data.success, "Rejected non-existent employee ID (99999)");

    // 4. Create Valid Employee Advance Transactions
    console.log("\n4. Creating Valid Employee Advance Transactions...");
    const today = new Date().toISOString().split("T")[0];

    const createRes1 = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/advances",
        method: "POST",
        headers: authHeaders,
      },
      {
        employeeId: targetEmployee.id,
        advanceDate: today,
        amount: 3500.50,
        paymentMode: "CASH",
        reason: "Festival Advance",
        remarks: "Test advance disbursement via Cash",
      }
    );

    assert(createRes1.status === 201 && createRes1.data.success, "Recorded Cash Advance of ₹3,500.50");
    const advance1 = createRes1.data.data;

    const createRes2 = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: "/api/advances",
        method: "POST",
        headers: authHeaders,
      },
      {
        employeeId: targetEmployee.id,
        advanceDate: today,
        amount: 2500.00,
        paymentMode: "UPI",
        reason: "Medical Expense Advance",
        remarks: "Test advance disbursement via UPI GPay",
      }
    );

    assert(createRes2.status === 201 && createRes2.data.success, "Recorded UPI Advance of ₹2,500.00");
    const advance2 = createRes2.data.data;

    // 5. Fetch All Advances & Validate Summary Aggregations
    console.log("\n5. Fetching Advances List & Verifying Calculations...");
    const listRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: "/api/advances",
      method: "GET",
      headers: authHeaders,
    });

    assert(listRes.status === 200 && listRes.data.success, "Fetched advance ledger records list");
    const advancesList = listRes.data.data.advances;
    const summary = listRes.data.data.summary;
    assert(advancesList.length >= 2, `Advancement ledger contains ${advancesList.length} records`);
    assert(summary.totalAmount > 0, `Total advance summary computed: ₹${summary.totalAmount}`);

    // 6. Update Advance Record
    console.log("\n6. Updating Advance Transaction...");
    const updateRes = await makeRequest(
      {
        hostname: "localhost",
        port: 5000,
        path: `/api/advances/${advance1.id}`,
        method: "PUT",
        headers: authHeaders,
      },
      {
        employeeId: targetEmployee.id,
        advanceDate: today,
        amount: 4000.00,
        paymentMode: "BANK_TRANSFER",
        reason: "Updated Festival Advance",
        remarks: "Updated amount to ₹4,000 via Bank Transfer",
      }
    );

    assert(updateRes.status === 200 && updateRes.data.success, "Updated advance amount to ₹4,000.00 and mode to BANK_TRANSFER");
    assert(updateRes.data.data.amount === 4000, "Verified updated amount is 4000");

    // 7. Employee Summary Route Test
    console.log("\n7. Fetching Employee Advance Summary Route...");
    const empSummaryRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/advances/employee-summary/${targetEmployee.id}`,
      method: "GET",
      headers: authHeaders,
    });

    assert(empSummaryRes.status === 200 && empSummaryRes.data.success, `Retrieved summary for ${targetEmployee.fullName}`);
    assert(empSummaryRes.data.data.summary.totalAdvancesCount >= 2, "Verified total advance transactions count in employee summary");

    // 8. Delete Advance Test Record
    console.log("\n8. Deleting Test Advance Record...");
    const deleteRes = await makeRequest({
      hostname: "localhost",
      port: 5000,
      path: `/api/advances/${advance2.id}`,
      method: "DELETE",
      headers: authHeaders,
    });

    assert(deleteRes.status === 200 && deleteRes.data.success, "Deleted test advance transaction");

    // 9. Existing Functionality Protection Check (Client ERP Endpoints)
    console.log("\n9. Protecting Existing Client ERP Functionality...");
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
      console.log("🎉 ALL PHASE 5 TESTS PASSED SUCCESSFULLY!");
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

runPhase5Tests();
