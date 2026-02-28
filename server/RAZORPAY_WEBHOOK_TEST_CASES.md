# Razorpay Webhook Integration Test Cases

This file will contain at least 50 test cases for the new webhook-based payment confirmation flow. It will be filled after implementation.

---

## Test Case Template

- **Test Case ID:**
- **Scenario:**
- **Input:**
- **Expected Result:**
- **Actual Result:**
- **Status:**

---

## Test Cases


| Test Case ID | Scenario | Input | Expected Result |
|--------------|----------|-------|----------------|
| TC01 | Valid payment.captured webhook, registration exists, unpaid | Valid signature, orderId matches unpaid registration | Registration marked paid, status confirmed |
| TC02 | Valid payment.captured webhook, registration already paid | Valid signature, orderId matches already paid registration | No change, idempotent |
| TC03 | Valid payment.captured webhook, registration does not exist | Valid signature, orderId not in DB | No registration updated, no error |
| TC04 | Invalid webhook signature | Invalid signature | 400 error, "Invalid webhook signature" |
| TC05 | Malformed JSON body | Invalid JSON | 400 error, "Invalid JSON body" |
| TC06 | payment.failed event | Valid signature, event = payment.failed | No registration updated |
| TC07 | payment.refunded event | Valid signature, event = payment.refunded | No registration updated |
| TC08 | payment.captured, missing orderId | Valid signature, orderId missing | No registration updated |
| TC09 | payment.captured, missing payment.id | Valid signature, payment.id missing | No registration updated |
| TC10 | payment.captured, missing email | Valid signature, email missing | Registration still updated if orderId matches |
| TC11 | payment.captured, registration with null universityId | Valid signature, orderId matches, universityId null | Registration marked paid, universityId remains null |
| TC12 | payment.captured, registration with valid universityId | Valid signature, orderId matches, universityId set | Registration marked paid, universityId unchanged |
| TC13 | payment.captured, registration with extra fields | Valid signature, extra fields in payload | Registration marked paid, extra fields ignored |
| TC14 | payment.captured, registration with status cancelled | Valid signature, registration status cancelled | Registration marked paid, status set to confirmed |
| TC15 | payment.captured, registration with status pending | Valid signature, registration status pending | Registration marked paid, status set to confirmed |
| TC16 | payment.captured, registration with status confirmed | Valid signature, registration status confirmed | No change, idempotent |
| TC17 | payment.captured, registration with isPaid true | Valid signature, isPaid already true | No change, idempotent |
| TC18 | payment.captured, registration with isPaid false | Valid signature, isPaid false | Registration marked paid |
| TC19 | payment.captured, registration with missing eventId | Valid signature, registration missing eventId | Registration marked paid, eventId remains missing |
| TC20 | payment.captured, registration with invalid eventId | Valid signature, registration eventId invalid | Registration marked paid, eventId unchanged |
| TC21 | payment.captured, registration with missing paymentId | Valid signature, registration missing paymentId | paymentId set from webhook |
| TC22 | payment.captured, registration with existing paymentId | Valid signature, registration paymentId set | paymentId overwritten from webhook |
| TC23 | payment.captured, registration with missing orderId | Valid signature, registration missing orderId | No registration updated |
| TC24 | payment.captured, registration with duplicate orderId | Valid signature, multiple registrations with same orderId | Only first found updated |
| TC25 | payment.captured, registration with null fields | Valid signature, registration fields null | Registration marked paid |
| TC26 | payment.captured, registration with all fields valid | Valid signature, all fields valid | Registration marked paid |
| TC27 | payment.captured, registration with long email | Valid signature, long email | Registration marked paid |
| TC28 | payment.captured, registration with special chars in email | Valid signature, special chars | Registration marked paid |
| TC29 | payment.captured, registration with unicode chars | Valid signature, unicode chars | Registration marked paid |
| TC30 | payment.captured, registration with empty string fields | Valid signature, empty strings | Registration marked paid |
| TC31 | payment.captured, registration with whitespace fields | Valid signature, whitespace | Registration marked paid |
| TC32 | payment.captured, registration with numeric fields | Valid signature, numeric fields | Registration marked paid |
| TC33 | payment.captured, registration with boolean fields | Valid signature, boolean fields | Registration marked paid |
| TC34 | payment.captured, registration with array fields | Valid signature, array fields | Registration marked paid |
| TC35 | payment.captured, registration with object fields | Valid signature, object fields | Registration marked paid |
| TC36 | payment.captured, registration with null paymentId | Valid signature, paymentId null | paymentId set from webhook |
| TC37 | payment.captured, registration with null orderId | Valid signature, orderId null | No registration updated |
| TC38 | payment.captured, registration with null email | Valid signature, email null | Registration marked paid |
| TC39 | payment.captured, registration with null status | Valid signature, status null | status set to confirmed |
| TC40 | payment.captured, registration with null isPaid | Valid signature, isPaid null | isPaid set to true |
| TC41 | payment.captured, registration with null eventId | Valid signature, eventId null | Registration marked paid |
| TC42 | payment.captured, registration with null universityId | Valid signature, universityId null | Registration marked paid |
| TC43 | payment.captured, registration with valid universityId | Valid signature, universityId valid | Registration marked paid |
| TC44 | payment.captured, registration with invalid universityId | Valid signature, universityId invalid | Registration marked paid |
| TC45 | payment.captured, registration with missing universityId | Valid signature, universityId missing | Registration marked paid |
| TC46 | payment.captured, registration with missing college | Valid signature, college missing | Registration marked paid |
| TC47 | payment.captured, registration with missing department | Valid signature, department missing | Registration marked paid |
| TC48 | payment.captured, registration with missing batchYear | Valid signature, batchYear missing | Registration marked paid |
| TC49 | payment.captured, registration with missing phone | Valid signature, phone missing | Registration marked paid |
| TC50 | payment.captured, registration with all optional fields missing | Valid signature, only required fields | Registration marked paid |
| TC51 | payment.captured, registration with all optional fields present | Valid signature, all fields present | Registration marked paid |
