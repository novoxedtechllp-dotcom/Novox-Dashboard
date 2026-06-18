# Novox Dashboard - Fee Module API Documentation

This document outlines the JSON request formats and expected responses for the Student Fee Management module.

## 1. Create a Fee Plan
Creates a fee plan for a student enrolled in a specific course.

- **Endpoint:** `POST /api/v1/fees/plans`
- **Headers:** `Authorization: Bearer <Admin/Accountant_Token>`
- **Content-Type:** `application/json`

### Request Body
```json
{
  "student_id": "f9c48f63-7c26-4822-aa54-a9108097e64f",
  "course_id": "6b53bb61-2de7-403d-b7ac-a53ad6143ad6",
  "admission_fee": 5000,
  "monthly_installment": 10000,
  "total_fee": 125000,
  "discount": 0
}
```
*Note: `discount` is optional and defaults to 0.*

### Expected Success Response (201 Created)
```json
{
    "statusCode": 201,
    "data": {
        "id": "1c501242-d7f1-47b4-9a0b-cdc039992e60",
        "student_id": "f9c48f63-7c26-4822-aa54-a9108097e64f",
        "total_fee": 125000,
        "discount": 0,
        "final_fee": 125000,
        "course_id": "6b53bb61-2de7-403d-b7ac-a53ad6143ad6",
        "admission_fee": 5000,
        "monthly_installment": 10000,
        "start_month": 6,
        "start_year": 2026,
        "created_at": "2026-06-18T18:57:25.34321",
        "students": { ... },
        "courses": { ... }
    },
    "message": "Fee plan created successfully",
    "success": true
}
```

---

## 2. Record a Payment
Records a payment made by a student against their fee plan. This handles the carry-forward logic for underpayments automatically.

- **Endpoint:** `POST /api/v1/fees/payments`
- **Headers:** `Authorization: Bearer <Admin/Accountant_Token>`
- **Content-Type:** `application/json`

### Request Body
```json
{
  "student_id": "f9c48f63-7c26-4822-aa54-a9108097e64f",
  "fee_plan_id": "1c501242-d7f1-47b4-9a0b-cdc039992e60",
  "amount": 7000,
  "payment_method": "UPI",
  "payment_type": "INSTALLMENT",
  "month": 6,
  "year": 2026
}
```
*Note: `payment_method` can be CASH, UPI, CARD, or BANK.*

### Expected Success Response (201 Created)
```json
{
    "statusCode": 201,
    "data": {
        "id": "06cbca84-8d2f-4f04-8088-178d39fdcce3",
        "fee_plan_id": "1c501242-d7f1-47b4-9a0b-cdc039992e60",
        "amount": 7000,
        "payment_method": "UPI",
        "transaction_reference": null,
        "paid_at": "2026-06-18T18:59:18.236",
        "student_id": "f9c48f63-7c26-4822-aa54-a9108097e64f",
        "payment_type": "INSTALLMENT",
        "month": 6,
        "year": 2026,
        "notes": null,
        "students": { ... },
        "student_fee_plans": { ... }
    },
    "message": "Payment recorded successfully",
    "success": true
}
```

---

## 3. Fetch Dynamic Student Fee Breakdown
Retrieves the real-time calculated balances for a student, factoring in previous payments, shortfalls, and dynamic carry-forwards.

- **Endpoint:** `GET /api/v1/fees/students/:student_id`
- **Headers:** `Authorization: Bearer <Admin/Accountant_Token or Student_Token>`

### Request Format
`GET http://127.0.0.1:3000/api/v1/fees/students/f9c48f63-7c26-4822-aa54-a9108097e64f`
*(No body required)*

### Expected Success Response (200 OK)
The core logic resides in the `breakdown` object, which mathematically calculates `currentMonthDue` based on what has been paid vs. what was supposed to be paid.

```json
{
    "statusCode": 200,
    "data": {
        "student": { ... },
        "plans": [
            {
                "id": "1c501242-d7f1-47b4-9a0b-cdc039992e60",
                "total_fee": 125000,
                "admission_fee": 5000,
                "monthly_installment": 10000,
                "start_month": 6,
                "start_year": 2026,
                "payments": [
                    {
                        "amount": 7000,
                        "payment_method": "UPI",
                        "paid_at": "2026-06-18T18:59:18.236"
                    }
                ],
                "breakdown": {
                    "totalDue": 15000,
                    "totalPaid": 7000,
                    "remainingBalance": 118000,
                    "currentMonthDue": 8000,
                    "carryForward": 0,
                    "monthsElapsed": 1
                },
                "status": "Partially Paid"
            }
        ],
        "totalPayments": 1
    },
    "message": "Student fee details fetched successfully",
    "success": true
}
```
