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

```bash
gh repo clone https://github.com/your-org/rendini-nunjucks -- --depth=1
# Or...
# git clone https://github.com/your-org/rendini-nunjucks.git --depth=1
make # Install the system.
# Or...
# make up # Start the system.
```

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
