---
title: Privacy Policy
layout: default
permalink: /privacy/
---

# Privacy Policy — Wandercoin

_Effective: 2026-05-14_

Wandercoin is a currency-conversion app built with privacy in mind. We do
not collect, store, transmit, or sell any personal information.

## What we collect

**Nothing.** Wandercoin has no accounts, no login, no analytics, no
crash-reporting SDK, no advertising network, and no third-party
trackers. We do not have a server-side database of users.

## What stays on your device

The following data is kept locally on your device through the operating
system's standard key-value storage and never leaves the device:

- Your selected currencies (FROM and TO).
- Your favorites list.
- Your last entered amount.
- Your theme and decimal preferences.
- Cached exchange rates and historical-rate series.

This local data is deleted when you tap "Reset cache" in the Settings
screen or when you uninstall the app.

## What is sent over the internet

The app makes two kinds of unauthenticated HTTPS requests:

1. **Exchange-rate API** — [`api.frankfurter.dev`](https://frankfurter.dev).
   An open-source service that exposes European Central Bank reference
   rates. The request contains only the currency pair you are looking at
   and, for charts, the date range. No personal data is included.
2. **App updates (over-the-air)** — `u.expo.dev`. The Expo platform may
   deliver minor JavaScript updates to the app without a new App Store
   release. The request contains only the app version, platform, and a
   randomly generated install identifier — no user data.

Both endpoints are operated by third parties: the Frankfurter API is
hosted by its open-source maintainers, and the over-the-air channel is
operated by [Expo](https://expo.dev/). Their own data handling is
described on their respective websites.

## Children's privacy

The app is suitable for all ages and does not knowingly collect data
from anyone, including children under 16.

## Your rights

We do not process personal data, so the rights under the GDPR
(Articles 15 to 22, including access, rectification, erasure, and
objection) do not directly apply — there is no data on our side to
access, correct, or delete.

If you still have a question or concern about how the app works, contact
us using the address listed in the [Impressum](/wandercoin/impressum/).

## Changes to this policy

We may update this policy if the app changes. The "Effective" date at
the top reflects the latest version. The version history is publicly
available in the source repository at
<https://github.com/pagl400/wandercoin>.
