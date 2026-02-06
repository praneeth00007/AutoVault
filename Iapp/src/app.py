import json
import os
import math
import zipfile
import sys

# -----------------------------------------------------------------------------
# Configuration & Constants
# -----------------------------------------------------------------------------

# Output directory (standard iExec)
IEXEC_OUT = os.getenv('IEXEC_OUT', '/iexec_out')
IEXEC_IN = os.getenv('IEXEC_IN', '/iexec_in')

# -----------------------------------------------------------------------------
# Global Constants
# -----------------------------------------------------------------------------
RECOVERY_RATE = 0.40  
STRESS_FACTOR = 2.0  # Stress multiplier for credit risk models


# -----------------------------------------------------------------------------
# Helper Functions
# -----------------------------------------------------------------------------

def load_dataset(filename):
    """
    Locates and reads the JSON data from the encrypted dataset (ZIP).
    Returns a list of 'loan_lists'. 
    - If input is single pool: returns [ [loans...] ]
    - If input is multi pool: returns [ [loans_A...], [loans_B...] ]
    """
    filepath = os.path.join(IEXEC_IN, filename)
    if not os.path.exists(filepath):
        print(f"Error: Dataset file {filepath} not found.")
        return []

    try:
        with zipfile.ZipFile(filepath, 'r') as z:
            # Try to find specific file
            target_file = 'auto_loan_pool.json'
            if target_file not in z.namelist():
                # Fallback: find any .json file
                json_files = [f for f in z.namelist() if f.endswith('.json')]
                if json_files:
                    target_file = json_files[0]
                else:
                    target_file = z.namelist()[0]
            
            with z.open(target_file) as f:
                data = json.load(f)
                
                # Case 1: Standard Single Pool {"loans": [...]}
                if isinstance(data, dict) and 'loans' in data and isinstance(data['loans'], list):
                    return [data['loans']]
                
                # Case 2: Array of Loans (Single Pool)
                if isinstance(data, list) and len(data) > 0 and 'loan_id' in data[0]:
                    return [data]

                # Case 3: Explicit Multi-Pool {"pools": [ {"loans": ...}, ... ]}
                if isinstance(data, dict) and 'pools' in data and isinstance(data['pools'], list):
                    extracted_pools = []
                    for p in data['pools']:
                        if 'loans' in p: extracted_pools.append(p['loans'])
                    return extracted_pools

                # Case 4: Array of Pools [ {"loans": ...}, ... ]
                if isinstance(data, list) and len(data) > 0 and 'loans' in data[0]:
                    extracted_pools = []
                    for p in data:
                        if 'loans' in p: extracted_pools.append(p['loans'])
                    return extracted_pools
                    
                return [] # Unknown format
    except Exception as e:
        print(f"Error reading dataset {filename}: {e}")
        return []

# -----------------------------------------------------------------------------
# ABS Financial Logic (Industry Grade)
# -----------------------------------------------------------------------------

def validate_loan(loan):
    """
    Validates a single loan record against strict industry rules.
    """
    required_fields = [
        "principal_outstanding", "interest_rate_annual", "remaining_term_months",
        "payment_status", "fico_bucket"
    ]
    warnings = []
    
    for f in required_fields:
        if f not in loan:
            return False, [f"Missing field: {f}"]
            
    # Logic Checks
    if loan['principal_outstanding'] < 0: return False, ["Negative Principal"]
    if loan['remaining_term_months'] <= 0: return False, ["Term <= 0"]
    if loan['interest_rate_annual'] > 30.0: warnings.append("High Interest Rate (>30%)")
    
    return True, warnings

def calculate_aggregates(loans):
    """
    Computes rigorous Pool Composition Aggregates.
    """
    if not loans: return None
    
    total_principal = sum(l['principal_outstanding'] for l in loans)
    count = len(loans)
    if total_principal == 0: return {"loan_count": count, "error": "Zero Principal Pool"}

    # Weighted Averages
    wair = 0.0
    wam = 0.0 # Weighted Avg Maturity
    
    for l in loans:
        weight = l['principal_outstanding'] / total_principal
        wair += l['interest_rate_annual'] * weight
        wam += l['remaining_term_months'] * weight
        
    # Geographic or Vehicle Concentration (Simulated if data missing)
    # real world would check for state concentration limits (e.g. max 20% TX)

    return {
        "loan_count": count,
        "total_principal_usd": round(total_principal, 2),
        "weighted_avg_interest_rate": round(wair, 4),
        "weighted_avg_remaining_term_months": round(wam, 2),
        "weighted_avg_life_years": round(wam / 12.0 * 0.6, 2) # Estimate WAL as ~60% of WAM for amortizing assets
    }

def calculate_credit_risk(loans):
    """
    Computes Standardized Credit Risk Metrics based on FICO & Delinquency.
    Implements a simple Probability of Default (PD) x Loss Given Default (LGD) model.
    """
    total_principal = sum(l['principal_outstanding'] for l in loans)
    if total_principal == 0: return None
    
    # 1. Delinquency Buckets (alphabetically ordered for determinism)
    delinq_buckets = {"30dpd": 0.0, "60dpd": 0.0, "90+dpd": 0.0, "current": 0.0, "default": 0.0}
    
    # 2. Base Expected Loss Model
    # Matrix: FICO vs Status -> PD
    expected_loss_sum = 0.0
    stress_loss_sum = 0.0
    
    lgd = 0.60 # Loss Given Default (40% Recovery)
    
    for l in loans:
        bal = l['principal_outstanding']
        status = l.get('payment_status', 'current').lower()
        fico = l.get('fico_bucket', 600)
        
        # Aggregation
        if status in delinq_buckets: 
            delinq_buckets[status] += bal
        else:
            delinq_buckets["default"] += bal # Treat unknown as default
            
        # PD Lookup (Simplified Industry Curves)
        base_pd = 0.015 # 1.5% base
        if fico < 600: base_pd = 0.08
        elif fico < 700: base_pd = 0.04
        elif fico >= 750: base_pd = 0.005
        
        # Outcome adjustment
        if status == '30dpd': base_pd *= 2.5
        elif status == '60dpd': base_pd *= 5.0
        elif status in ['default', '90+dpd']: base_pd = 1.0 # Certain Standard Default
        
        expected_l = bal * base_pd * lgd
        stress_l = bal * min(base_pd * STRESS_FACTOR, 1.0) * min(lgd * 1.2, 1.0) # Higher PD and higher LGD
        
        expected_loss_sum += expected_l
        stress_loss_sum += stress_l

    # Distributions
    fico_bins = {"<600": 0, "600-699": 0, "700-799": 0, "800+": 0}
    for l in loans:
        f = l.get('fico_bucket', 0)
        if f >= 800: fico_bins["800+"] += 1
        elif f >= 700: fico_bins["700-799"] += 1
        elif f >= 600: fico_bins["600-699"] += 1
        else: fico_bins["<600"] += 1

    return {
        "delinquency_breakdown_usd": delinq_buckets,
        "base_expected_loss_pct": round((expected_loss_sum / total_principal) * 100, 2),
        "stress_expected_loss_pct": round((stress_loss_sum / total_principal) * 100, 2),
        "fico_distribution_count": fico_bins,
        "weighted_avg_fico": int(sum(l.get('fico_bucket',0)*l['principal_outstanding'] for l in loans)/max(total_principal, 1))
    }

def calculate_cashflow(pool_metrics):
    """
    projects Cashflows using a Month-by-Month Amortization Engine (Single Note Approximation)
    """
    if not pool_metrics or "error" in pool_metrics: return None
    
    bal = pool_metrics['total_principal_usd']
    rate = pool_metrics['weighted_avg_interest_rate'] / 100.0
    term = int(pool_metrics['weighted_avg_remaining_term_months'])
    
    if term == 0: return {"error": "Term is zero"}
    
    # PMT Calculation
    monthly_rate = rate / 12.0
    if monthly_rate > 0:
        pmt = (bal * monthly_rate) / (1 - (1 + monthly_rate)**(-term))
    else:
        pmt = bal / term
        
    total_interest = 0.0
    total_principal_repaid = 0.0
    
    # Simulate 12 months for "Annual" projection
    for _ in range(12):
        if bal <= 0: break
        intr = bal * monthly_rate
        prin = pmt - intr
        if prin > bal: prin = bal
        
        total_interest += intr
        total_principal_repaid += prin
        bal -= prin

    # Excess Spread
    # Yield - (Generic Cost of Funds 5% + Servicing 1%)
    cost_of_funds = 0.05
    servicing = 0.01
    net_spread = max(0, rate - cost_of_funds - servicing)

    return {
        "projected_annual_principal": float(f"{total_principal_repaid:.2f}"),
        "projected_annual_interest": float(f"{total_interest:.2f}"),
        "gross_yield_pct": float(f"{rate * 100:.2f}"),
        "net_excess_spread_pct": float(f"{net_spread * 100:.2f}")
    }

def recommend_tranche_structure(credit_metrics):
    """
    Determines Tranche Sizes based on Excess Spread & Stress Loss.
    Logic: Equity Tranche must cover Stress Loss. Mezzanine covers 50% remaining gap.
    """
    if not credit_metrics: return None
    
    stress_loss = credit_metrics['stress_expected_loss_pct'] # e.g. 4.5%
    
    # Industry Standard: Senior needs AAA rating logic (often > 10% enhancement for Prime Auto)
    # Our simple logic:
    # Equity = Stress Loss + buffer (1%)
    # Mezz = 2 * Stress Loss (Simplified)
    
    equity = math.ceil(stress_loss + 1.0)
    mezz = math.ceil(stress_loss * 2.0)
    senior = 100 - equity - mezz
    
    # Safety clamp
    if senior < 50: 
        senior = 50
        mezz = 30
        equity = 20
        
    return {
        "senior_class_a_pct": senior,
        "mezzanine_class_b_pct": mezz,
        "equity_class_c_pct": equity,
        "rating_implied": "AAA (Senior)" if stress_loss < 5.0 else "AA (Senior)"
    }

# -----------------------------------------------------------------------------
# Main Execution
# -----------------------------------------------------------------------------

def compute_full_analysis(loans):
    """
    Runs the full suite of ABS calculations on a given list of loans.
    """
    if not loans:
        return None

    pool_summary = calculate_aggregates(loans)
    credit_risk = calculate_credit_risk(loans)
    cashflow = calculate_cashflow(pool_summary)
    tranche = recommend_tranche_structure(credit_risk)
    
    return {
        "pool_summary": pool_summary,
        "credit_risk": credit_risk,
        "cashflow_projection": cashflow,
        "recommended_tranche_structure": tranche
    }

def main():
    print("Starting TEE ABS iApp...")
    
    result_path = os.path.join(IEXEC_OUT, 'result.json')
    computed_json = {}

    try:
        final_output = {}
        individual_results = []
        all_loans_aggregated = []
        
        # 1. Check for Bulk Processing (DataProtector Bulk standard)
        bulk_size = int(os.getenv("IEXEC_BULK_SLICE_SIZE", "0"))
        
        if bulk_size > 0:
            print(f"Processing in Bulk Mode: {bulk_size} datasets.")
            
            for i in range(1, bulk_size + 1):
                filename = os.getenv(f'IEXEC_DATASET_{i}_FILENAME')
                if filename:
                    print(f"Loading dataset {i}: {filename}")
                    pool_list = load_dataset(filename)
                    
                    if pool_list:
                         for p_idx, loans in enumerate(pool_list):
                            if loans:
                                # Compute result for each pool found in the file
                                dataset_res = compute_full_analysis(loans)
                                dataset_res["dataset_index"] = i
                                dataset_res["internal_pool_index"] = p_idx
                                dataset_res["dataset_name"] = filename
                                individual_results.append(dataset_res)
                                all_loans_aggregated.extend(loans)
                else:
                    print(f"Warning: IEXEC_DATASET_{i}_FILENAME not set.")
            
            final_output = {
                "execution_mode": "BULK_STANDARD",
                "datasets_processed": bulk_size,
                "individual_results": individual_results,
                "aggregated_pool_analysis": compute_full_analysis(all_loans_aggregated)
            }
            
        else:
            # Standard Single Dataset Mode (which might contain multiple pools!)
            print("Processing in Single Dataset Mode.")
            filename = os.getenv('IEXEC_DATASET_FILENAME')
            
            if filename:
                print(f"Loading single dataset: {filename}")
                pool_list = load_dataset(filename)
                
                if pool_list:
                    for p_idx, loans in enumerate(pool_list):
                        if loans:
                            dataset_res = compute_full_analysis(loans)
                            dataset_res["dataset_index"] = 0
                            dataset_res["internal_pool_index"] = p_idx
                            dataset_res["dataset_name"] = filename
                            individual_results.append(dataset_res)
                            all_loans_aggregated.extend(loans)
            
            if individual_results:
                final_output = {
                   "execution_mode": "SINGLE_FILE_MULTIPOOL",
                   "pools_found": len(individual_results),
                   "individual_results": individual_results,
                   "aggregated_pool_analysis": compute_full_analysis(all_loans_aggregated)
                }
            else:
                 final_output = {"error": "No valid loan data found."}

        # Common Metadata
        final_output["confidence"] = "MEDIUM"
        final_output["privacy_guarantee"] = {
            "raw_loan_data_exposed": False,
            "execution_environment": "iExec TEE",
            "verifiable_task": True
        }

        # 4. Write Output
        if not os.path.exists(IEXEC_OUT):
            os.makedirs(IEXEC_OUT)

        with open(result_path, 'w') as f:
            json.dump(final_output, f, indent=2, sort_keys=True, ensure_ascii=True)
        
        print(f"Result written to {result_path}")
        computed_json = {"deterministic-output-path": result_path}

    except Exception as e:
        print(f"Execution Error: {e}")
        import traceback
        traceback.print_exc()
        computed_json = {
            "deterministic-output-path": IEXEC_OUT,
            "error-message": str(e)
        }
        
    finally:
        if not os.path.exists(IEXEC_OUT):
            os.makedirs(IEXEC_OUT)
            
        with open(os.path.join(IEXEC_OUT, 'computed.json'), 'w') as f:
            json.dump(computed_json, f, sort_keys=True, ensure_ascii=True)
        print("computed.json written.")

if __name__ == '__main__':
    main()
