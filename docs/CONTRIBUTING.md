# Contributing to AutoVault

Thank you for considering contributing to **AutoVault**! 🎉  
We’re building a **confidential underwriting and risk analytics engine** for Automobile Asset-Backed Securities (ABS) on iExec, and every contribution helps make decentralized, private ABS assessment a reality.

Whether you're fixing a bug, improving docs, adding a feature, or suggesting better risk modeling practices — your help is welcome.

## Code of Conduct

We follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md).  
Please be kind, respectful, and mindful that this project deals with sensitive financial data and asset-level privacy.

## Ways to Contribute

- Reporting bugs or privacy/security concerns  
- Suggesting new risk metrics or ABS use cases  
- Improving documentation  
- Writing or improving tests  
- Fixing typos or UX issues in the frontend  
- Refactoring code for better readability/privacy  
- Adding support for new loan-level factors (with determinism in mind)

## Development Setup

### 1. Prerequisites
- Node.js ≥ 18  
- npm ≥ 9  
- Git  
- Docker  
- MetaMask or another Web3 wallet (for local testing)

### 2. Fork & Clone
```bash
git clone https://github.com/autovault/autovault.git
cd autovault
```

### 3. Install Dependencies

**Frontend**:
```bash
cd frontend
npm install
```

**iApp (TEE Engine)**:
```bash
cd IAPP
# Follow instructions in IAPP/README.md for setup
```

### 4. Run Locally
```bash
# In frontend directory
npm run dev
# Opens http://localhost:5173
```

You should now see the AutoVault dashboard. Connect a wallet (preferably on Arbitrum Sepolia testnet) to test the full flow.

**Common issues**:
- If TEE tasks fail → check you're on the correct chain and have testnet tokens.
- Wallet connection stuck → clear cache or try incognito mode.

## Coding & Privacy Standards

- **Language**: TypeScript (Frontend), Python (TEE Engine)
- **Styling**: Vanilla CSS or Tailwind CSS as configured
- **Privacy Rules** — **MUST follow**:
  - **Never** `console.log` or log any user-provided data (loan tapes, borrower details, etc.)
  - Do not store sensitive data in localStorage/sessionStorage without encryption
  - Use `@iexec/dataprotector` correctly for client-side encryption
  - Minimize data sent to the frontend — most logic lives in the TEE
- **Naming**: Use `camelCase` for variables/functions, `PascalCase` for types/interfaces
- **Comments**: Explain **why** (not just what) when logic is non-obvious, especially around risk math or privacy

## Commit Message Convention

We loosely follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add delinquency distribution analysis
fix: prevent leakage of loan-level details in logs
docs: update architecture diagram
chore: upgrade dependencies
refactor: optimize pool aggregation logic
test: add unit tests for expected loss calculation
```

## Branch Naming

- `feature/short-description`  
- `fix/issue-123-description`  
- `docs/update-readme`  
- `chore/upgrade-deps`

## Submitting a Pull Request (PR)

1. Create a branch from `main`:
   ```bash
   git checkout -b feature/your-cool-feature
   ```

2. Make your changes

3. Commit with clear messages (see convention above)

4. Push:
   ```bash
   git push origin feature/your-cool-feature
   ```

5. Open a Pull Request against `main`

### PR Checklist
- [ ] My code follows the coding & privacy standards above
- [ ] I verified no sensitive data is logged to console or network
- [ ] I tested the feature with a connected wallet (preferably on Arbitrum Sepolia)
- [ ] I added/updated tests if relevant
- [ ] I updated documentation (README, inline comments) if needed
- [ ] My PR description explains **what** changed and **why**

## Reporting Bugs or Security Issues

- **Security vulnerabilities** → **Do NOT** open a public issue.  
  → Follow instructions in [SECURITY.md](SECURITY.md)  
  → Email: security@autovault.eth

- **Regular bugs / UX issues** → Open an issue with clear steps to reproduce, expected vs. actual behavior, and screenshots.

## Getting Help / Questions

- Most of the errors are solved by reading  **[Errors](errors.md)**
- Open a **Discussion** on GitHub
- Tag maintainers in issues/PRs if you need guidance

## Thank You!

Your contributions — big or small — help build a more private and fair financial future for asset-backed securities.  
We appreciate you! ❤️

Happy coding,  
The AutoVault Team
