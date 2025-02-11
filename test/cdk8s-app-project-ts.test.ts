import { Cdk8sTypeScriptApp } from "../src/cdk8s";
import { YamlFile } from "../src/yaml";
import { synthSnapshot } from "./util";

test("test if cdk8s synth is possible", () => {
  const project = new Cdk8sTypeScriptApp({
    cdk8sVersion: "1.0.0-beta.18",
    name: "project",
    defaultReleaseBranch: "main",
    releaseWorkflow: true,
    constructsVersion: "3.3.75",
  });

  const output = synthSnapshot(project);

  // expect a synth script
  expect(output["package.json"].scripts.synth).toContain("npx projen synth");

  // expect a synth task
  expect(output[".projen/tasks.json"].tasks.synth.steps).toStrictEqual([
    {
      exec: "cdk8s synth",
    },
  ]);

  // expect an import task
  expect(output[".projen/tasks.json"].tasks.import.steps).toStrictEqual([
    {
      exec: "cdk8s import -o src/imports",
    },
  ]);

  // expect cdk8s.yaml to contain the k8s import
  expect(output["cdk8s.yaml"].split("\n")).toStrictEqual([
    `# ${YamlFile.PROJEN_MARKER}`,
    "",
    "language: typescript",
    "app: node lib/main.js",
    "imports:",
    "  - k8s",
    "",
  ]);

  // expect postcompile step to contain synth
  expect(
    output[".projen/tasks.json"].tasks["post-compile"].steps
  ).toStrictEqual([{ spawn: "synth" }]);

  expect(output["package.json"].dependencies).toStrictEqual({
    cdk8s: "^1.0.0-beta.18",
    constructs: "^3.3.75",
  });
});

test("adding cdk8sImports", () => {
  const project = new Cdk8sTypeScriptApp({
    cdk8sVersion: "1.0.0-beta.18",
    name: "project",
    defaultReleaseBranch: "main",
    releaseWorkflow: true,
    constructsVersion: "3.3.75",
    k8sSpecVersion: "1.20.0",
    cdk8sImports: ["github:crossplane/crossplane@0.14.0"],
  });

  // WHEN
  const output = synthSnapshot(project);

  // THEN
  expect(output[".projen/tasks.json"].tasks.import.steps).toStrictEqual([
    {
      exec: "cdk8s import -o src/imports",
    },
  ]);
  expect(output["cdk8s.yaml"].split("\n")).toStrictEqual([
    `# ${YamlFile.PROJEN_MARKER}`,
    "",
    "language: typescript",
    "app: node lib/main.js",
    "imports:",
    "  - k8s@1.20.0",
    "  - github:crossplane/crossplane@0.14.0",
    "",
  ]);
});

test("constructs version undefined", () => {
  const project = new Cdk8sTypeScriptApp({
    cdk8sVersion: "1.0.0-beta.11",
    name: "project",
    defaultReleaseBranch: "main",
    releaseWorkflow: true,
  });

  const output = synthSnapshot(project);

  expect(output["package.json"].dependencies).toStrictEqual({
    cdk8s: "^1.0.0-beta.11",
    constructs: "^3.2.34",
  });
});

test("constructs version pinning", () => {
  const project = new Cdk8sTypeScriptApp({
    cdk8sVersion: "1.0.0-beta.18",
    name: "project",
    defaultReleaseBranch: "main",
    releaseWorkflow: true,
    constructsVersion: "3.3.75",
    constructsVersionPinning: true,
  });

  const output = synthSnapshot(project);

  expect(output["package.json"].dependencies).toStrictEqual({
    cdk8s: "^1.0.0-beta.18",
    constructs: "3.3.75",
  });
});

test("cdk8sPlusVersion undefined", () => {
  const project = new Cdk8sTypeScriptApp({
    cdk8sVersion: "1.0.0-beta.11",
    name: "project",
    defaultReleaseBranch: "main",
    releaseWorkflow: true,
    constructsVersion: "3.3.75",
  });

  const output = synthSnapshot(project);

  expect(output["package.json"].dependencies).toStrictEqual({
    cdk8s: "^1.0.0-beta.11",
    constructs: "^3.3.75",
  });
});

test("cdk8sPlusVersion defined", () => {
  const project = new Cdk8sTypeScriptApp({
    cdk8sVersion: "1.0.0-beta.11",
    name: "project",
    defaultReleaseBranch: "main",
    releaseWorkflow: true,
    constructsVersion: "3.3.75",
  });

  const output = synthSnapshot(project);

  expect(output["package.json"].dependencies).toStrictEqual({
    cdk8s: "^1.0.0-beta.11",
    constructs: "^3.3.75",
  });
});

test("cdk8sPlusVersion pinning", () => {
  const project = new Cdk8sTypeScriptApp({
    cdk8sVersion: "1.0.0-beta.11",
    name: "project",
    defaultReleaseBranch: "main",
    cdk8sPlusVersionPinning: true,
    releaseWorkflow: true,
    constructsVersion: "3.3.75",
  });

  const output = synthSnapshot(project);

  expect(output["package.json"].dependencies).toStrictEqual({
    cdk8s: "^1.0.0-beta.11",
    constructs: "^3.3.75",
  });
});
