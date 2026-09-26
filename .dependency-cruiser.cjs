module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      from: {},
      to: {
        circular: true,
      },
    },
    {
      name: "api-domain-stays-pure",
      severity: "error",
      from: {
        path: "^apps/api/src/modules/[^/]+/domain/",
      },
      to: {
        path: [
          "^apps/api/src/modules/[^/]+/(use-cases|ports|adapters|interfaces)/",
          "^@nestjs/",
          "^react",
          "^@tiptap/",
          "^prosemirror-",
          "^yjs$",
          "^y-",
          "^@hocuspocus/",
          "^yorkie-js-sdk",
          "^@prisma/",
          "^prisma$",
          "^aws-sdk",
          "^@aws-sdk/",
          "^ioredis$",
          "^redis$",
        ].join("|"),
      },
    },
    {
      name: "api-use-cases-do-not-use-adapters",
      severity: "error",
      from: {
        path: "^apps/api/src/modules/[^/]+/use-cases/",
      },
      to: {
        path: "^apps/api/src/modules/[^/]+/(adapters|interfaces)/",
      },
    },
    {
      name: "api-use-cases-do-not-import-database",
      severity: "error",
      from: {
        path: "^apps/api/src/modules/[^/]+/use-cases/",
      },
      to: {
        path: "^apps/api/src/database/",
      },
    },
    {
      name: "web-does-not-import-api-source",
      severity: "error",
      from: {
        path: "^apps/web/src/",
      },
      to: {
        path: "^apps/api/src/",
      },
    },
    {
      name: "editor-does-not-import-other-apps",
      severity: "error",
      from: {
        path: "^apps/editor/src/",
      },
      to: {
        path: "^apps/(api|collab|web)/",
      },
    },
    {
      name: "web-imports-feature-public-api",
      severity: "error",
      from: {
        path: "^apps/web/src/",
        pathNot: "^apps/web/src/features/",
      },
      to: {
        path: "^apps/web/src/features/[^/]+/.+",
      },
    },
    {
      name: "contracts-do-not-import-apps",
      severity: "error",
      from: {
        path: "^packages/contracts/src/",
      },
      to: {
        path: "^apps/",
      },
    },
  ],
  options: {
    doNotFollow: {
      path: "node_modules",
    },
    tsPreCompilationDeps: true,
    tsConfig: {
      fileName: "tsconfig.json",
    },
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["import", "require", "node", "default"],
    },
  },
};
