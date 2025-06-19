const typeDefs = `
    scalar JSON

    type RenderTarget {
        name: String!
        template: String!
    }

    type RenderResult {
        name: String!
        html: String!
    }

    type Query {
        renderTargets: [RenderTarget!]!
    }

    type Mutation {
        render(name: String!, data: JSON): RenderResult!
    }
`;

export default typeDefs;
