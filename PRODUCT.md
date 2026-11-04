# Product

## Platform

web

## Stack

React 19 + TypeScript (strict) + Vite + Tailwind CSS v4, Motion for interface animation. Backend: Vercel serverless functions under `api/` talking to Neon PostgreSQL through `@neondatabase/serverless`. Chosen by the user in the brief, not delegated.

## Users

Guests of the gender-reveal celebration of Danna and Oscar: family and close friends, mostly Spanish-speaking, mostly on mid-range Android and iPhone. They receive one general WhatsApp link, open it standing, sitting or in a car, usually with one hand and uneven signal. Secondary users: Danna and Oscar, who own the link and edit event facts in one config file.

## Product Purpose

A single public link that replaces a printed invitation with something worth opening: a tender, pastel, one-column invitation that gives the date, place, time and a prediction vote the guests can actually take part in. Success means a guest reads the whole thing without being told to, understands where and when to arrive, and leaves a prediction with their name. There is no checkout, no account and no funnel.

## Positioning

Not a card with animation bolted on, and not a landing page for an event. It is a small illustrated keepsake: two rabbits exchange pastel balloons over a white page, while the invitation and the vote sit in one calm column beneath. Nothing in the visual language codes the answer; the page treats both predictions with the same weight.

## Operating Context

Opened cold from WhatsApp, on mobile data, with no prior context and no login. Shared as one link with an Open Graph preview. Guests may return later to check results; the same browser must not vote twice. The organisers close the vote at some point before the celebration through a documented server-side procedure, never a public control. The real event facts are now in `src/config/event.ts`: Danna and Oscar, Sunday 15 November 2026 at 2:30 pm, Finca mis sueños DJ, Corregimiento Borrero Ayerbe / KM 30, dress code white or beige.

## Capabilities and Constraints

- One vertical invitation: rabbits and balloons, Niño/Niña title, invitation copy, parents, date, place, address, time, dress code, and the prediction vote.
- Vote: one prediction per browser, enforced server-side with an HttpOnly identifier cookie, an HMAC hash in Postgres, and a UNIQUE constraint. The guest also writes a name; it accompanies the prediction, is stored in `votes.guest_name`, stays hidden until the scheduled reveal, and is then shown with the prediction.
- Six interface states plus a technical error state: loading, open, selected, submitting, recorded, closed, error.
- Results are aggregated counts and percentages only, real data only, empty state when no votes exist. No names, no individual rows, no IP addresses in the aggregate results.
- On **15 November 2026 at 3:00 p. m. Colombia**, `/api/reveal` publishes each guest name with their prediction, alphabetically. The server clock is the only authority; before that moment the endpoint returns no names, in production and preview. Local development may preview it with the server-only dev flag.
- Vote can be closed by an organiser procedure persisted in Postgres; guests then see results and a closed message.
- No RSVP button is shipped: no WhatsApp number was provided, and no number is invented. The prediction is the participation path.
- The address links to Google Maps (a search with the real name and address, no invented coordinates). There is still no verified Maps URL; no calendar feature is shipped.
- Mobile-first. The page must stay fully usable with the API unreachable, with reduced motion, and without WebGL.
- No admin panel, no guest auth, no real-time infrastructure (results are read on load and after a vote).

## Brand Commitments

The user pinned the emotional register (ternura, emoción, expectativa, elegancia, cercanía, celebración) and a pastel palette: white ground, rose `#E8928A`, blue `#A9BFE8`, balloon pinks `#F0A0A8` / `#F6BCC1`, balloon blues `#A8C0E8` / `#BFD2F2`, girl button `#F5B3AA`, boy button `#A9BFE8`, deep-tinted labels on the pastel buttons, stars `#F6C9CC` / `#C9D6F0`, gold `#F2C46D`. No gradients, no unnecessary colors. Typography: Sacramento for the emotional voice, Montserrat 400/500 for everything else with 0.04em letter spacing. The page must not be split into pink and blue halves. No emoji as illustration. The baby's gender is never revealed or hinted.

## Evidence on Hand

Real event facts supplied by the organisers: Danna and Oscar, Sunday 15 November 2026, 2:30 pm, Finca mis sueños DJ, Corregimiento Borrero Ayerbe / KM 30. No photography, logo or custom typeface is owned. The rabbit illustrations are project assets derived from the supplied SVGs; the stars, the «o» between Niño and Niña and the filets are authored SVG/CSS. Fonts are Google Fonts (Sacramento, Montserrat). If a WhatsApp number or Maps URL is provided later, it can be added to the config; until then, neither is invented.

## Product Principles

1. The invitation is a gift, not a funnel: no urgency, no growth mechanics, nowhere to "convert".
2. Composure over spectacle. Motion earns its place by making the rabbits and balloons breathe, then gets out of the way of the text.
3. The secret stays whole. Every visual decision must work identically for either answer.
4. Mobile at hand, in poor light, on a slow connection is the real device; desktop is the generous version of the same column.
5. Honest data. Empty means empty, closed means closed, an error says so and offers a way back. The name is user-provided, never presented as identity verification, and remains hidden until the scheduled reveal.

## Accessibility & Inclusion

Keyboard reachable throughout, visible focus, semantic landmarks and headings, described decorative art marked `aria-hidden`, `prefers-reduced-motion` honoured with a still, complete composition, vote confirmation and errors announced through live regions, labelled name field with `aria-invalid`, and no interaction that depends on WebGL. Functional text now meets AA on white: body copy and primary data in `#4F679C` (5.6:1), secondary data and labels in `#5A72A8` (4.8:1), large display words in `#7190CF` / `#D3786E` (3.1:1), small accent labels in `#B25A51` / `#7A2E28` / `#334B7A`, focus in ink. The original pastels (`#A9BFE8`, `#E8928A`) stay in the illustration, the stars and the button fills.
