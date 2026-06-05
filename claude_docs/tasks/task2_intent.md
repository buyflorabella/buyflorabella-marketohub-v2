# Task 2 Intent — Migrate Hydrogen Frontend into Platform-Template Workflow

**Date:** 2026-06-04  
**Mode:** PLAN — no code changes yet

---

## User Intent (verbatim capture)

> the intent of this iteration is to take this existing code base which is in the hydrogen
> front end V7 area imported into a new GitHub repo
> https://github.com/buyflorabella/buyflorabella-marketohub-v2.git
>
> I really want to hijack the platform template build pattern whereby there is a react
> front end and python back end so the ideas that will adopt all of the script management
> and nice development workflow that platform template has
>
> the idea is to stand up a new code base as the first thing to receive the code
>
> we probably should work with the Claude in the operations folder in
> /opt/operations/site-management so that it can be the authoritative source for Port
> assignments. the idea for this iteration is to come up with the plan to integrate the
> code from here hijack put it over there including the whole deployment of the platform
> template and dealing with the operations ansible
>
> so really what we're trying to accomplish is get this code base into our existing
> development workflow. we understand Shopify is its own Beast but the goal is to stand
> up the exact same code with zero changes because react is react
>
> I want somewhat of a pre-flight validation knowing that that is one of the requirements
> is that there's no code changes so we need to kind of like do it — beyond to get diff
> just a file diff to make sure that the files are the same once we get it over there
> into the so-called platform template structure
>
> in the document kind of detail the fact that we're going to be using the dev worktree
> in order to actually do code and push to Dev versus prod Etc
>
> annotate a little bit about how we can run this locally and this will suit ourselves
> fine for development. previewing it without breaking the existing Shopify site is
> something we may need a little guidance on so put that into this document as well as
> far as when we're ready to deploy again — how do we preview it in production Shopify
> the hydrogen app in the Shopify admin?
>
> so yeah that's kind of what the Big Blocks are — have a back-end administrative
> interface that we could potentially hook into in the future. we're not going to use it
> because really the back end in this case is Shopify so really all we really need to do
> is use the management scripts to stand up Shopify hydrogen headless as is in the first
> iteration.
>
> the second iteration is going to be to evaluate the user login and user account
> management code that was built into the original design because what happened in the
> original design was we spun up what we thought was some sort of hydrogen standard code
> base and it was a very good skeletal framework — it did have login and all that stuff
> working just not in the look and feel of the site but during the development cycle we
> moved a lot of the functionality for login and user account management into the react
> code and it's somewhat custom so we're evaluating whether or not we a) attempt to fix
> or just work with the existing code base as is or b) start from scratch basically using
> hydrogen base react whatever that code is and then do an integration exercise importing
> and integrating the existing look and feel into that skeleton so that we have the
> authoritative login and account management working
>
> currently there's no directory on the system to receive the target git repo so we need
> to make that as part of the deployment
>
> goal of this intent is to see the plan to get our code initially committed into this
> GitHub repo as is and use the management scripts that stand it up and see it working
> on the server
>
> probably some pre-flight checks are to deal with the certs because we're dealing with
> a Dev setup and then also talk to us about any Shopify configurations that need to be
> checked in order that the callback URLs etc for oauth are working given the fact that
> we're going to have a new domain name for development which is going to be
> frontend.dev.buyflorabella.boardmansgame.com and ultimately
> buyflorabella.boardmansgame.com
>
> write the plan

---

## Summary Goals

1. **Iteration 1:** Migrate `frontend/hydrogen-frontend-v7/` as-is into `buyflorabella-marketohub-v2` GitHub repo, wrapped in platform-template management script structure. Stand it up on the server, see it running, zero code changes to Hydrogen source.
2. **Iteration 2 (future):** Evaluate login/account management — fix in-place vs. rebuild from Hydrogen skeleton + UI integration.

## Key Constraints

- Zero changes to Hydrogen source files during migration
- File diff validation required before calling migration complete
- Use operations `/opt/operations/site-management` as authoritative port source
- Adopt platform-template worktree pattern (dev/prod)
- Target domains: `frontend.dev.buyflorabella.boardmansgame.com` (dev), `buyflorabella.boardmansgame.com` (prod)
