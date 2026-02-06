# iExec TEE ABS iApp

An Asset-Backed Securities (ABS) calculator running inside an iExec Trusted Execution Environment (TEE).
This application processes encrypted auto loan data to generate securitization metrics without ever exposing the raw loan-level data.

## Privacy & Security

All loan-level data is encrypted using iExec DataProtector.

Computation occurs inside an iExec Trusted Execution Environment (TEE).

No borrower-level data is ever revealed to the blockchain, iExec workers, or users.

Only aggregate, securitization-ready metrics are returned.

The computation is verifiable on-chain via iExec task execution.

## Inputs

The application expects an encrypted dataset containing loan-level data. The dataset should be a JSON file (e.g., `auto_loan_pool.json`) with the following schema per row:

```json
{
  "loan_id": "string",
  "origination_date": "YYYY-MM-DD",
  "remaining_term_months": "int",
  "principal_outstanding": "float", 
  "interest_rate_annual": "float",
  "fico_bucket": "int",           
  "ltv": "float",                 
  "dti": "float",                 
  "vehicle_type": "ICE | EV | Hybrid",
  "vehicle_age_years": "int",
  "payment_status": "current | 30dpd | 60dpd | default"
}
```

The application supports **Bulk Processing**, allowing multiple protected datasets (representing different pools or loan segments) to be processed in a single execution.

## Outputs

The application writes a `result.json` file to the encrypted output directory.

Example Output:
```json
{
  "pool_summary": {
    "loan_count": 1000,
    "total_principal_usd": 18400000,
    "weighted_avg_interest_rate": 7.1,
    "weighted_avg_life_years": 3.2
  },

  "credit_risk": {
    "base_default_rate_pct": 2.1,
    "stress_default_rate_pct": 4.0,
    "fico_distribution": {
      "300-579": 8,
      "580-669": 22,
      "670-739": 41,
      "740+": 29
    },
    "ltv_distribution": {
      "<80%": 55,
      "80-100%": 35,
      ">100%": 10
    }
  },

  "cashflow_projection": {
    "expected_annual_principal": 6200000,
    "expected_annual_interest": 1300000,
    "net_excess_spread_pct": 2.4
  },

  "recommended_tranche_structure": {
    "senior_pct": 80,
    "mezzanine_pct": 15,
    "equity_pct": 5
  },

  "confidence": "MEDIUM",

  "privacy_guarantee": {
    "raw_loan_data_exposed": false,
    "execution_environment": "iExec TEE",
    "verifiable_task": true
  }
}
```

## Quick Start (Developer)

1. **Build the TEE Image**:
   ```bash
   docker build -t your-docker-user/abs-iapp:1.0.0 .
   ```
2. **Sconify (if using Scone)**:
   Follow iExec guidelines for sconifying the image.
   
3. **Deploy & Run**:
   Use `iapp deploy` and `iapp run`.

## License

MIT
