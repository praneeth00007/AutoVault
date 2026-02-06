/**
 * ABS Loan Data Validation Logic - Industry Grade
 */

export function validateLoanData(rawRows) {
    const loans = [];
    const errors = [];
    const warnings = [];

    if (!Array.isArray(rawRows) || rawRows.length === 0) {
        return { isValid: false, loans: [], errors: ["No data provided."], warnings: [] };
    }

    rawRows.forEach((row, index) => {
        const rowNum = index + 1;
        try {
            // 1. Required Fields presence check
            if (!row.loan_id) throw new Error(`Row ${rowNum}: Missing loan_id`);

            // 2. Numeric Parsing & Strict Range Check
            const principal = parseFloat(row.principal_outstanding);
            if (isNaN(principal) || principal <= 0) throw new Error(`Row ${rowNum}: Positive principal required`);

            const rate = parseFloat(row.interest_rate_annual);
            if (isNaN(rate) || rate < 0) throw new Error(`Row ${rowNum}: Interest rate must be positive`);
            if (rate > 30.0) warnings.push(`Row ${rowNum}: High Interest Rate (>30%)`);

            const term = parseInt(row.remaining_term_months, 10);
            if (isNaN(term) || term <= 0) throw new Error(`Row ${rowNum}: Term must be > 0`);
            if (term > 84) warnings.push(`Row ${rowNum}: Unusually long term (${term} months)`);

            const fico = parseInt(row.fico_bucket, 10);
            if (isNaN(fico) || fico < 300 || fico > 850) throw new Error(`Row ${rowNum}: Valid FICO (300-850) required`);

            // 3. Enum Validation
            const validTypes = ["ICE", "EV", "Hybrid"];
            let vType = row.vehicle_type?.trim();
            if (!validTypes.includes(vType)) {
                warnings.push(`Row ${rowNum}: Unknown vehicle type '${vType}', defaulting to ICE`);
                vType = "ICE";
            }

            const validStatus = ["current", "30dpd", "60dpd", "90+dpd", "default"];
            const pStatus = row.payment_status?.trim().toLowerCase();
            if (!validStatus.includes(pStatus)) throw new Error(`Row ${rowNum}: Invalid payment_status. Allowed: ${validStatus.join(", ")}`);

            // 4. Construct
            const loan = {
                loan_id: String(row.loan_id),
                origination_date: String(row.origination_date),
                remaining_term_months: term,
                principal_outstanding: principal,
                interest_rate_annual: rate,
                fico_bucket: fico,
                ltv: parseFloat(row.ltv) || 0,
                dti: parseFloat(row.dti) || 0,
                vehicle_type: vType,
                vehicle_age_years: parseInt(row.vehicle_age_years, 10) || 0,
                payment_status: pStatus
            };

            loans.push(loan);

        } catch (e) {
            errors.push(e.message);
        }
    });

    return {
        isValid: errors.length === 0,
        loans,
        errors,
        warnings
    };
}
export const SAMPLE_LOANS = [
    {
        loan_id: "L_SOLO_001",
        origination_date: "2024-04-01",
        remaining_term_months: 48,
        principal_outstanding: 55000.00,
        interest_rate_annual: 4.9,
        fico_bucket: 820,
        ltv: 60.0,
        dti: 15.0,
        vehicle_type: "EV",
        vehicle_age_years: 0,
        payment_status: "current"
    },
    {
        loan_id: "L_ABS_9921",
        origination_date: "2023-11-15",
        remaining_term_months: 60,
        principal_outstanding: 28500.00,
        interest_rate_annual: 5.25,
        fico_bucket: 720,
        ltv: 85.0,
        dti: 28.0,
        vehicle_type: "ICE",
        vehicle_age_years: 2,
        payment_status: "current"
    },
    {
        loan_id: "L_ABS_9922",
        origination_date: "2024-01-10",
        remaining_term_months: 36,
        principal_outstanding: 15400.00,
        interest_rate_annual: 8.50,
        fico_bucket: 640,
        ltv: 95.0,
        dti: 35.0,
        vehicle_type: "ICE",
        vehicle_age_years: 5,
        payment_status: "30dpd"
    },
    {
        loan_id: "L_ABS_9923",
        origination_date: "2023-08-20",
        remaining_term_months: 72,
        principal_outstanding: 42100.00,
        interest_rate_annual: 4.15,
        fico_bucket: 780,
        ltv: 70.0,
        dti: 12.0,
        vehicle_type: "Hybrid",
        vehicle_age_years: 1,
        payment_status: "current"
    }
];
