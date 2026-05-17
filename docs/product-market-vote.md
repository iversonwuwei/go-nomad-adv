# Go Nomad ADV service interest PRD

## Objective

`go-nomad-adv` is a standalone service explanation and audience evaluation web project for deciding which China-market digital nomad services Go Nomad should build first.

The first release should help a visitor complete three simple actions in one session:

1. understand what services Go Nomad may provide from one-sentence descriptions
2. mark which services they would use or want to learn more about
3. optionally leave audience profile and contact details so Go Nomad can estimate real audience size

All submissions are persisted to a local SQLite database inside the project so this workflow can run independently from `go-nomad-api`.

## Product Direction

- The page should not feel like a long research questionnaire.
- The visitor should first understand the service offer, then decide whether to participate.
- Service options should be grouped by stage: P0 for near-term services, P1 for later audience-specific services, and P2 for long-term network or product capabilities.
- The useful signal is service interest plus audience/contact volume, not a complex ranking exercise.

## Service Groups

### P0: first possible services

- departure readiness and destination decision support
- visa stay and tax-risk reminders
- remote work approval and communication pack

### P1: audience-specific expansion

- income and cross-border payment structure
- family digital nomad route planning

### P2: network and tool capabilities

- trusted local resource and city partner network
- personal digital nomad planning workspace

## Target Users

- Chinese freelancers and creators preparing to work from overseas
- remote employees employed by Chinese or cross-border companies
- founders and small teams exploring lower-tax or multi-country operating setups
- families considering school, insurance, healthcare, and residence options
- consultants, local partners, coworking operators, and city-node resource owners
- HR, finance, or operations managers evaluating remote-work compliance support

## MVP Scope

- one public responsive page with one-sentence service descriptions
- service groups split by P0, P1, and P2 stage
- lightweight service interest selection
- audience fields limited to segment, target region, and main blocker
- optional contact method, contact value, note, consent, and follow-up preference
- aggregate interest and audience counts visible after load and after submission
- server-side input checks with no dependency on existing API services

## Non-Goals

- real payment collection
- identity login or account creation
- lead deduplication across existing Go Nomad backend tables
- CRM export or admin dashboard
- legal, tax, immigration, or employment advice delivery
- booking, scheduling, or claiming that a service request has been accepted

## Success Signals

- visitors select at least one service they would use or want to learn more about
- contactable sample count grows enough to validate a real audience pool
- audience segment distribution shows which group is large enough to prioritize
- blocker distribution shows which problem deserves the first product workflow
- P0/P1/P2 service interest distribution shows which stage should receive resources first

## Delivery And Rollback

- The project is additive under `go-nomad-adv` and does not alter existing Go Nomad runtime services.
- The SQLite file is local runtime state under `.data/` and can be deleted to reset the data.
- Rollback is removing the `go-nomad-adv` route/process or hiding links to it; collected SQLite data can be archived separately.
