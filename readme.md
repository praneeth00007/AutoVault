
---

# AutoVault: Confidential ABS Underwriting on iExec

## 🚀 Overview

**AutoVault** is a privacy-first underwriting and analytics engine for **Automobile Asset-Backed Securities (ABS)** built on **iExec Confidential Computing**.

It enables issuers, structurers, and analysts to compute **loan-level and pool-level ABS risk metrics** from sensitive off-chain loan tape data **without exposing raw borrower information, asset details, or proprietary underwriting logic** to the frontend, blockchain, or infrastructure operators.

All computations are executed inside a **Trusted Execution Environment (TEE)**, ensuring that only **aggregate, audit-ready ABS outputs** are revealed to the user.

> *The code moves to the data, executes securely, and only ABS analytics come out.*

---

## 🔐 Why Confidential Computing?

Traditional smart contracts and off-chain services cannot safely process **loan-level ABS data**.

On public blockchains, all inputs and intermediate states are transparent by default.
Off-chain servers, while private, require participants to fully trust the operator with **complete loan tapes and underwriting logic**.

Automobile ABS underwriting fundamentally relies on **highly sensitive data**, including:

* borrower credit attributes and performance
* loan balances, APRs, and remaining terms
* delinquency and default states
* collateral and vehicle information

Revealing this data to a DApp backend, blockchain nodes, or third-party analytics providers introduces **severe privacy, compliance, and business risks**.

Confidential Computing addresses this by enabling computation over encrypted data inside **hardware-enforced Trusted Execution Environments (TEE)**:

* Raw loan-level data is never visible to the frontend after submission
* Decryption occurs only inside a remotely attested enclave
* Node operators and infrastructure providers cannot inspect data or logic
* Only final, aggregate ABS metrics are released, encrypted for the user

In **AutoVault**, confidential computing is not an optimization — it is a **hard requirement**.
Without TEEs, the system would either:

* expose sensitive loan tape data, or
* rely on a trusted centralized underwriting backend

Both are incompatible with decentralized RWA and on-chain finance.

By combining **iExec DataProtector** and **TEE execution**, AutoVault demonstrates how **institution-grade ABS underwriting** can be built **without sacrificing privacy or decentralization**.

---

## 🏗️ Architecture

AutoVault separates **data confidentiality** from **computation logic** using iExec’s TEE-based execution model.

### High-Level Architecture

The system decouples **Compute** from **Visibility** using Intel SGX enclaves.

[![](https://mermaid.ink/img/pako:eNqFVG1P2zAQ_isnI_YpjRrSFxqkSQPKVAk2RMqQlk7IJE5qNbUjxxntKP995zgDF20jH9zz-bnnHt-d-0RSmTESkULRagmXNwsB-NXNg3Xc1kzdT8VPrqRYM6EhMR5wPD9shPkyrliquRQwP3313s6SC8RqJjK0HfgdLUumLaG1u0NELsQbITORK1pr1aS6UQwSPt2w9I33XSlXVK2Yrkqaso7A8TjR1_JMJqcMJaWyUXBaynSVLikXDia-ipOYpYppJBG0YE4x_naBM7muGs3uL-kW75t0W2i37wq_kyhTJfPptDPhC7bNCeOfqqq7ElpwKQue_kdMrKVCyZB0hsM0u76IE7PA_plDc3iItxHC6qyt73YGvd7HXeDjbKRqW2n4ADEvxK5r7R7qyIdrU3L4qjKm6p3bBgu0qw2Fno8xhgzmGwSb7thzJ6zlDX106XQJ54yWLtCuZt_iBj7Mab2CueJFwdSuK2qX1BbY4IY-XLCWj2q6a0uzjzHCPqNCOwioDafCzWjagkxw04gah7XmWSv0X_lGPsTNw5pruGF1U2r3Cg7MNAZr12icIFfVXo3HPnzj7PGFycJeGhjrbclFYfdpSev6nOWApeQCcl6W0UGe5x4-Lbli0UEYhp3de-SZXkZBtTlxYjGpZ5vlOT3xjHoPS-JZ8Z4ph9fOVpvohHj4v8MzEuELZh5ZM7WmZkueDPeC6CW-qgWJ0MyQdkEW4hljKiq-S7n-E6ZkUyxJlNOyxl1TZVSzc05x0l8hOL1MnclGaBIdtwwkeiIbEgWjiT8ejifHYX8yCgb9EE-3JOoFw6E_6o_740kwGAb9MHj2yK82aeCPB8fDCR4eBZMR_g6efwP0SqkU?type=png)](https://mermaid.live/edit#pako:eNqFVG1P2zAQ_isnI_YpjRrSFxqkSQPKVAk2RMqQlk7IJE5qNbUjxxntKP995zgDF20jH9zz-bnnHt-d-0RSmTESkULRagmXNwsB-NXNg3Xc1kzdT8VPrqRYM6EhMR5wPD9shPkyrliquRQwP3313s6SC8RqJjK0HfgdLUumLaG1u0NELsQbITORK1pr1aS6UQwSPt2w9I33XSlXVK2Yrkqaso7A8TjR1_JMJqcMJaWyUXBaynSVLikXDia-ipOYpYppJBG0YE4x_naBM7muGs3uL-kW75t0W2i37wq_kyhTJfPptDPhC7bNCeOfqqq7ElpwKQue_kdMrKVCyZB0hsM0u76IE7PA_plDc3iItxHC6qyt73YGvd7HXeDjbKRqW2n4ADEvxK5r7R7qyIdrU3L4qjKm6p3bBgu0qw2Fno8xhgzmGwSb7thzJ6zlDX106XQJ54yWLtCuZt_iBj7Mab2CueJFwdSuK2qX1BbY4IY-XLCWj2q6a0uzjzHCPqNCOwioDafCzWjagkxw04gah7XmWSv0X_lGPsTNw5pruGF1U2r3Cg7MNAZr12icIFfVXo3HPnzj7PGFycJeGhjrbclFYfdpSev6nOWApeQCcl6W0UGe5x4-Lbli0UEYhp3de-SZXkZBtTlxYjGpZ5vlOT3xjHoPS-JZ8Z4ph9fOVpvohHj4v8MzEuELZh5ZM7WmZkueDPeC6CW-qgWJ0MyQdkEW4hljKiq-S7n-E6ZkUyxJlNOyxl1TZVSzc05x0l8hOL1MnclGaBIdtwwkeiIbEgWjiT8ejifHYX8yCgb9EE-3JOoFw6E_6o_740kwGAb9MHj2yK82aeCPB8fDCR4eBZMR_g6efwP0SqkU)
---

### Execution Flow

1. **Client-side Data Protection**
   ABS loan tape data (CSV / JSON) is encrypted locally in the browser using the **iExec DataProtector SDK**.

2. **On-chain Coordination**
   The encrypted dataset is registered on-chain as **Protected Data**.
   The user authorizes a specific AutoVault iExec iApp to process this data.

3. **Confidential Execution**
   A TEE-enabled worker retrieves and decrypts the data **inside a secure enclave** after remote attestation.

4. **Result Delivery**
   The underwriting logic runs entirely in a protected environment and outputs **only aggregate ABS analytics**, such as:

   * pool summary metrics
   * credit quality indicators
   * delinquency distribution
   * expected loss estimates
   * cashflow and yield summaries

At no point is raw loan-level data exposed.

---
## UML Sequence Diagram  

[![](https://mermaid.ink/img/pako:eNqVVttu4zYQ_RWCwC4cwE5hx1c9LOC1nUXazQWWsy0KvzDSWCYskSpJJfEGAfoR_cL9kh1SkiNbdtP6ydScuZ6ZIV9oIEOgHtXwVwYigClnkWLJUhD8scxIkSUPoIpzYKQi97o8p0wZHvCUCUPurwjTZIwa31gWG3KppDAgwjrydxbHYCzaWiqOdZg__c1i-OwZAnuoIyZrxoXzqh64UVlCfEhlzNkRn1Jt0BdiF7NZeWr4X_44W4ocbbiJoRL_j7__IRMpVjwEYTiLnYiMP_vkXoSgnhQ3XETkMpZPpJEHiaZ35j58IHdrpoG0PXKnpIHAkK-SCbJgKZApM0WQNygi8hHysjaxjF6p6EIoda3jnX6uahVanz5Zjfs0liysOGhM_G_kF_Krf3tzVkNPYh5syJLOM3GQomDxVnO9pIXOFWpg6T2S5mHYuBuFQfyO0pw9j_g8EqQxE4HapkWmFlxgc1SrtGbBzGQKqpacpDTwsUwJa351d-mfdlkUCELnj9xcLk77RNDiuWrKdZBH5hBxbZCDfWM50mFaRekOvI3DUIHWNdI7HvmibN_ZvsgMl4LMebQ2-j3SO470XJeP05SMg8A52KcjsoBc9G905AjbuWup-HdmA_n_1bnLHmKu10Uo5FaF5fzvlaYQu9ghrJXkwtvvtV1l3ivJxZFRxGE40N9rVRvIjql6zxZ5XTMTrPN0NGlMAQ1PFFSLtMvPGXaIq-myGrGyrBK5IoXNVqtFxnor3DKosP8ZO0xoK65aRr7cJsLiaW0ZWzC9KfhxggpiKp-Em4hiRCA83Ac1lTkYxeERcC0GCgwm6V_7Z6fsQz55rq8xViy2dRWzx5PmcX287UvXrQ3LjNsiuHn1KVfjKFIQMSzftY0wwMDmXG-amJDWTTJher3CtXpSv1wSc9Do-QBUEOFnDwkvIbhOxsaANuyg4f4rfTMRFuQdmw8Zx4454qODTB_rHSeeyCTFoTsyHF2vjHQKMccp2L43FV03FUeV3kZhBdjhOWZ_AvJ-rnfUbWbSzNSRUC040hTg9ti-wcoNUCXf3T2VgGwCaInrNGZbrJmMd-x_JJZ-pCxJmE2CNmmkeEg9vNOhSRNQCbNH-mLtLalZQwJL6uHfkKmNva1eUQcv-j-lTEo1JbNoTb0VizWesjTEhiteN7uvCuxdPpGZMNQbXfScEeq90GfqtTrD0fmg3x62u_1eb9hpW_EWv4_anfPhaNQd9oftYWd0MXxt0u_Ocee83-72-u1ebzDojwaDXrdJIeT4aLrOX1nusfX6EyOgC8E?type=png)](https://mermaid.live/edit#pako:eNqVVttu4zYQ_RWCwC4cwE5hx1c9LOC1nUXazQWWsy0KvzDSWCYskSpJJfEGAfoR_cL9kh1SkiNbdtP6ydScuZ6ZIV9oIEOgHtXwVwYigClnkWLJUhD8scxIkSUPoIpzYKQi97o8p0wZHvCUCUPurwjTZIwa31gWG3KppDAgwjrydxbHYCzaWiqOdZg__c1i-OwZAnuoIyZrxoXzqh64UVlCfEhlzNkRn1Jt0BdiF7NZeWr4X_44W4ocbbiJoRL_j7__IRMpVjwEYTiLnYiMP_vkXoSgnhQ3XETkMpZPpJEHiaZ35j58IHdrpoG0PXKnpIHAkK-SCbJgKZApM0WQNygi8hHysjaxjF6p6EIoda3jnX6uahVanz5Zjfs0liysOGhM_G_kF_Krf3tzVkNPYh5syJLOM3GQomDxVnO9pIXOFWpg6T2S5mHYuBuFQfyO0pw9j_g8EqQxE4HapkWmFlxgc1SrtGbBzGQKqpacpDTwsUwJa351d-mfdlkUCELnj9xcLk77RNDiuWrKdZBH5hBxbZCDfWM50mFaRekOvI3DUIHWNdI7HvmibN_ZvsgMl4LMebQ2-j3SO470XJeP05SMg8A52KcjsoBc9G905AjbuWup-HdmA_n_1bnLHmKu10Uo5FaF5fzvlaYQu9ghrJXkwtvvtV1l3ivJxZFRxGE40N9rVRvIjql6zxZ5XTMTrPN0NGlMAQ1PFFSLtMvPGXaIq-myGrGyrBK5IoXNVqtFxnor3DKosP8ZO0xoK65aRr7cJsLiaW0ZWzC9KfhxggpiKp-Em4hiRCA83Ac1lTkYxeERcC0GCgwm6V_7Z6fsQz55rq8xViy2dRWzx5PmcX287UvXrQ3LjNsiuHn1KVfjKFIQMSzftY0wwMDmXG-amJDWTTJher3CtXpSv1wSc9Do-QBUEOFnDwkvIbhOxsaANuyg4f4rfTMRFuQdmw8Zx4454qODTB_rHSeeyCTFoTsyHF2vjHQKMccp2L43FV03FUeV3kZhBdjhOWZ_AvJ-rnfUbWbSzNSRUC040hTg9ti-wcoNUCXf3T2VgGwCaInrNGZbrJmMd-x_JJZ-pCxJmE2CNmmkeEg9vNOhSRNQCbNH-mLtLalZQwJL6uHfkKmNva1eUQcv-j-lTEo1JbNoTb0VizWesjTEhiteN7uvCuxdPpGZMNQbXfScEeq90GfqtTrD0fmg3x62u_1eb9hpW_EWv4_anfPhaNQd9oftYWd0MXxt0u_Ocee83-72-u1ebzDojwaDXrdJIeT4aLrOX1nusfX6EyOgC8E)
---

## 📂 Project Structure

```text
AutoVault/
├── frontend/              # React + Vite frontend
├── IAPP/                  # iExec TEE application (Python)
├── docs/                  # Documentation and references
└── README.md              # Project overview
```

---

## 🛠️ Components

### 1. Frontend

Built with **React 18** and **Vite**.

Responsibilities:

* Wallet connection using `@web3-onboard`
* Client-side encryption via `@iexec/dataprotector`
* Uploading and protecting ABS loan tape data
* Triggering confidential underwriting execution
* Monitoring execution status and fetching results

The frontend never accesses decrypted loan data after submission.

---

### 2. TEE iApp (Confidential ABS Engine)

The core underwriting logic resides in the `IAPP` directory.

* **Language**: Python
* **Execution**: Runs inside a Trusted Execution Environment
* **Logic**: Deterministic ABS underwriting and aggregation
* **Output**: A single JSON file containing audit-ready ABS metrics

The application:

* performs no network calls
* uses deterministic computation only
* exposes no intermediate data

---

## 🚀 Setup and Usage

### Prerequisites

* Node.js (v18+)
* Docker
* iExec CLI and iApp CLI
* Wallet funded on Arbitrum Sepolia

---

### 1. iApp (ABS Underwriting Engine)

```bash
cd IAPP
npm install -g @iexec/iapp-generator
npm install -g iexec
iapp wallet import
```

Create mock protected data for testing:

```bash
iapp mock --protectedData
```

Test locally:

```bash
iapp test --protectedData <mock-name>
```

Deploy the application:

```bash
iapp deploy --tee
```

Publish to the marketplace:

```bash
iexec app publish <APP_ADDRESS> --price 0 --tag tee,scone
```

---

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

---

### 3. Connecting Frontend to the iApp

```ts
const RESOURCE_APP_ADDRESS = "0xYourAutoVaultAppAddress";
const WORKERPOOL_ADDRESS = "0xb967057a21dc6a66a29721d96b8aa7454b7c383f";
```

Execution parameters must match the deployed app’s **TEE and SCONE configuration**.

---

## 🧪 How It Works

1. Loan tape data is encrypted in the browser
2. Encrypted data is registered as Protected Data
3. Execution permission is granted to the AutoVault iApp
4. Confidential ABS analytics run inside a TEE
5. Encrypted, aggregate results are returned and decrypted locally

Raw borrower and loan data is never revealed.

---

## ⚡ Key Design Choices

* Hardware-backed confidentiality using TEEs
* Client-side encryption before any on-chain interaction
* Deterministic execution for auditability
* Minimal output surface to reduce data leakage

---

## 🔮 Roadmap

### Phase 1 — MVP (Completed)

* Confidential ABS underwriting engine
* End-to-end encrypted loan tape processing
* Pool-level analytics and risk outputs

### Phase 2 — Advanced Risk Analysis

* Stress scenarios and sensitivity analysis
* Tranche-aware cashflow modeling

### Phase 3 — RWA & DeFi Integration

* ABS tokenization workflows
* On-chain investor analytics
* Confidential rating and audit pipelines

---

## 🆘 Troubleshooting

Common deployment and execution issues, along with their resolutions, are documented here:

👉 **docs/errors.md**

---

*Built for the iExec Hack4Privacy Hackathon — Confidential DeFi & RWA Track.*

---