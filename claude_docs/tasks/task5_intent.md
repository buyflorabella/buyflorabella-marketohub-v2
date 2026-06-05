# Task 5 Intent: Hydrogen Deployment Architecture Assessment for Shopify Oxygen

## Background

We currently maintain a Hydrogen storefront codebase that is being actively developed on a VPS-based development environment.

Repository under review:

https://github.com/buyflorabella/hydrogen-frontend-v7

The project recently underwent a workflow restructuring that introduced:

* Dedicated development work trees
* Dedicated production work trees
* Controlled deployment scripts
* A VPS-hosted development workflow that allows rapid development and testing

The current workflow functions well for VPS-based development and deployment.

However, our strategic objective is to migrate the Hydrogen storefront into Shopify's native deployment ecosystem using GitHub integration and Shopify Oxygen.

Before implementation work begins, we need a comprehensive assessment of the repository and deployment architecture.

---

## Problem Statement

The current codebase contains both frontend and backend functionality that was designed around our VPS deployment model.

We need to determine whether the current repository structure is directly compatible with Shopify Oxygen deployment patterns, or whether architectural changes are required.

There is concern that Shopify may expect a different repository structure, deployment workflow, build output, or branch strategy than our current VPS-oriented workflow.

At this stage we do not want implementation work.

We want a detailed evaluation and design document that determines the best path forward.

---

## Primary Objectives

Perform a comprehensive review of the repository and answer the following questions.

### 1. Shopify Compatibility Assessment

Determine:

* Can this repository be deployed directly to Shopify Oxygen?
* Are there structural issues that would prevent deployment?
* Are there backend components that cannot run in Oxygen?
* Are there VPS-specific assumptions embedded in the codebase?
* Are there services that would need to be externalized?

Document all findings.

---

### 2. Repository Structure Assessment

Review:

* Current directory structure
* Build process
* Deployment process
* Work tree strategy
* Branch strategy
* Environment variable strategy
* Backend service integration

Determine whether the repository organization aligns with current Shopify Hydrogen best practices.

---

### 3. Deployment Architecture Options

Evaluate multiple deployment approaches.

#### Option A — Deployment Build Transformation

Maintain the current development workflow.

At deployment time:

* Build or transform the repository into the format required by Shopify.
* Generate deployment artifacts.
* Place the required Shopify-compatible structure into a deployment branch.
* Deploy from that branch.

Assess:

* Complexity
* Maintainability
* Risks
* Automation requirements

---

#### Option B — Branch-Based Shopify Deployment Model

Maintain current VPS development workflows.

However:

* Introduce a dedicated Shopify deployment branch.
* Keep development work occurring in development branches/work trees.
* Generate and commit Shopify-compatible output into a deployment branch.
* Connect Shopify to that deployment branch.

Assess:

* Complexity
* Maintainability
* Risks
* Long-term viability

---

#### Option C — Alternative Approaches

Identify any superior approaches that may better align with Shopify Hydrogen and Oxygen best practices.

Do not limit analysis to the options above.

Recommend alternative architectures if appropriate.

---

## Work Tree and Branch Strategy Review

Review our current workflow pattern.

Current concepts include:

* Development work tree
* Production work tree
* Deployment scripts
* Branch-based promotion

Determine:

* Whether this workflow should remain intact
* Whether Shopify deployment should become an additional deployment target
* Whether a dedicated Shopify work tree should exist
* Whether build validation environments should be introduced

Provide recommendations.

---

## Deliverables

Produce a Design Document containing:

### Executive Summary

High-level findings and recommendations.

### Current Architecture Review

Assessment of the existing repository.

### Shopify Compatibility Analysis

Identification of blockers and compatibility concerns.

### Deployment Options Analysis

Detailed comparison of all evaluated approaches.

### Branch and Work Tree Strategy

Recommended Git workflow.

### Risk Assessment

Technical and operational risks.

### Recommended Architecture

Preferred path forward with rationale.

### Implementation Roadmap

Phased migration plan.

---

## Constraints

* Do not modify code.
* Do not implement changes.
* Focus on architecture, deployment strategy, and migration planning.
* Base conclusions on repository evidence.
* Clearly separate facts, assumptions, and unknowns.
* Challenge assumptions where appropriate.

The purpose of this task is to determine the safest and most maintainable method for deploying this repository into Shopify Oxygen while preserving our existing development workflow where practical.
