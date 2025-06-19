<div align="center">
  <img src="media/logos/brand/rendini.svg" alt="Rendini Logo" width="200"/>
</div>

# Rendini

> **Rendini** is a next‑generation **web rendering‑as‑a‑service platform**, unifying how web
> applications, pages, and "components" are discovered, composed, and rendered across build‑time,
> server‑side, and client‑side lifecycles—independent of framework or deployment target.

---

## 🌟 Project Overview

Rendini’s mission is to make rendering **portable, predictable, and performant**:

| Challenge                                     | Rendini Solution                                                       |
| --------------------------------------------- | ---------------------------------------------------------------------- |
| Mixed tech stacks (React, Vue, Svelte…)       | Framework‑agnostic component contracts & pluggable renderer strategies |
| Multiple render moments (build, edge, client) | Declarative “render anywhere” lifecycle                                |
| Slow iteration, fragmented infra              | Single registry + API for discovery, composition, and delivery         |

> **Status (α‑preview)** – Active R&D. Core spec drafts, APIs, and proofs‑of‑technology (PoTs) are
> evolving rapidly. See the [Roadmap](#-roadmap).

---

## 🚧 Proof‑of‑Technology (PoT): Nunjucks Renderer

The **Rendini Nunjucks Renderer** demonstrates:

- Automatic discovery of `*.njk` page templates in `src/pages/`
- REST and GraphQL endpoints for listing and rendering pages
- Container & Kubernetes deployment workflow

It is **not** the full Rendini platform—just the first stepping stone.

---

## 🚀 Quick Start

### Prerequisites

- Install [`git`](https://git-scm.com/downloads) for source control.
- Install [`gh`, the GitHub CLI](https://cli.github.com/), for GitHub interactions.
- Install tooling that supports `docker` and `docker compose` for containers. Examples:
  - Servers and some operating systems can simply install these as utility middleware tools without
    a "Desktop" bundled installation.
  - [Rancher Desktop](https://rancherdesktop.io/)
  - [Podman Desktop](https://podman-desktop.io/)
  - [Docker Desktop](https://www.docker.com/products/docker-desktop/) _\*May require a paid license
    in many circumstances._
- Install [`tilt` for container orchestration](https://tilt.dev/install)
- Install [GNU `make` for command simplification](https://www.gnu.org/software/make/) _\*Windows
  users see note._

> [!TIP] Windows with Git BASH
>
> Windows users are encouraged to use ["Git for Windows"](https://gitforwindows.org/) with Git BASH
> and the emulated Mintty, POSIX-compatible terminal. After installing Git BASH, install GNU `make`
> support by following [this answer](https://stackoverflow.com/a/66525071) (review the guide's
> comments). This ensures "enough" consistency with \*nix and macOS platforms. While it may be
> possible to use other `make` alternatives on Windows, this Git BASH integration is the currently
> known and supported solution.

### Running Rendini

In the future, explicit "Contributor" steps will be separated from how to use Rendini.

1. Open a POSIX-compatible terminal.
2. Navigate to a file system directory to store the Rendini project code.
3. Execute the following commands:

```bash
gh repo clone rendini-oss/rendini -- --depth=1
# Or...
# git clone https://github.com/rendini-oss/rendini.git --depth=1
cd rendini
make # Install the system.
# Or...
# make dev # Start the system.
```

#### Running Rendini in VS Code

1. Open a blank project window and the terminal.
2. Navigate to a file system directory to store the Rendini project code.
3. Clone the repository with the command `gh repo clone rendini-oss/rendini -- --depth=1`
4. Install the recommended extensions.
5. Install Rendini with the command `make`.
6. Start Rendini with the command `make dev`.
7. Experiment with the VS Code command pallette by using the command "Makefile: Clean and build the
   target ALL".

---

## 🛠 REST API

- **List templates**

```bash
curl http://localhost:3000/api/render-targets
```

- **Render a template**

```bash
curl -X POST http://localhost:3000/api/render \
     -H "Content-Type: application/json" \
     -d '{"name":"home","data":{"user":"World"}}'
```

---

## 🔎 GraphQL API

Rendini provides a GraphQL API with GraphiQL interface for easier exploration and testing.

- **Endpoint**

```text
GET/POST /graphql
```

- **GraphiQL Interface**

Navigate to `http://localhost:3000/graphiql` in your browser to use the interactive GraphiQL
interface.

- **Sample Query**

```graphql
query {
  renderTargets {
    name
    template
  }
}
```

- **Sample Mutation**

```graphql
mutation {
  render(name: "about", data: { team: "Engineering" }) {
    html
  }
}
```

---

## 🌱 Contributing

Rendini welcomes feedback and contributions.

| Audience            | Start Here                                                                                |
| ------------------- | ----------------------------------------------------------------------------------------- |
| First‑time visitors | Try the PoT and open issues with questions or ideas.                                      |
| Developers          | Explore code, file issues, submit small PRs.                                              |
| Contributors        | Read [GOVERNANCE.md](GOVERNANCE.md) and sign the [CLA](CONTRIBUTOR_LICENSE_AGREEMENT.md). |

Please open a GitHub issue before large refactors or feature work.

---

## 📍 Roadmap

- [ ] Publish formal Rendini specification (v0 draft)
- [ ] Add multi‑framework render demos (React, Vue, Svelte)
- [ ] Automated tests & CI
- [ ] Launch documentation site
- [ ] CLI & SDK tooling
- [ ] Community outreach & events

---

## ⚖ License & Governance

- Code: **[Apache 2.0](LICENSE)**
- Contributions: **[Contributor License Agreement](CONTRIBUTOR_LICENSE_AGREEMENT.md)**
- Governance: **[GOVERNANCE.md](GOVERNANCE.md)**
- Trademark: **[TRADEMARKS.md](TRADEMARKS.md)** (“Rendini” is a registered mark)

---

## 🙋‍♀️ Questions or Feedback?

Open an issue at <https://github.com/your-org/rendini-nunjucks/issues/new>.

**Thank you for helping shape the future of web rendering with Rendini!**
