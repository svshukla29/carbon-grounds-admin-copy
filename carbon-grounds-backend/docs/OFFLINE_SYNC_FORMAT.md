# Offline Data Sync — Format Reference

This document describes exactly how field data collected offline (no internet, e.g. in the field with the farmer) should be sent to the server once a connection is available. It exists to answer the meeting feedback: *"instructions on different formats data can sent on offline mode."*

There is one sync endpoint. It accepts a **batch** — any number of plots and trees collected while offline — in a single request.

## Endpoint

```
POST /api/sync/all
Authorization: Bearer <farmer's access token>
Content-Type: application/json
```

The access token is the same one the farmer app already gets from logging in (`POST /api/auth/verify-otp` or `POST /api/auth/complete-signup`). All data in a sync batch is attributed to whichever farmer's token is used — there is no `farmerId` field in the body.

## Why a "clientId" exists

While offline, the app has no real database ID for a new plot yet — the server hasn't seen it. So the app makes up its own temporary ID (a `clientId`, e.g. a locally generated UUID or even a simple counter like `"plot-1"`) and uses that to link a tree to "the plot I just created," all before either has touched the server.

When the batch is finally sent, the server creates the real records and returns a map from every `clientId` you sent to the real server-side UUID. The app then replaces its local temporary IDs with the real ones and can safely delete the offline copies.

## Request body

```json
{
  "instances": [
    {
      "clientId": "plot-1",
      "areaAcres": 2.5,
      "irrigationType": "Rainfed",
      "monitoringFrequency": "ANNUAL",
      "gpsLat": 21.2787,
      "gpsLng": 81.8661,
      "boundaryGeojson": { "type": "Polygon", "coordinates": [[[81.866, 21.278], [81.867, 21.278], [81.867, 21.279], [81.866, 21.279], [81.866, 21.278]]] }
    }
  ],
  "plantingUnits": [
    {
      "clientInstanceId": "plot-1",
      "speciesId": "6e2b1e2a-....-uuid-of-species",
      "dbhCm": 12.5,
      "heightM": 4.2,
      "plantingDate": "2024-07-01",
      "gpsLat": 21.2787,
      "gpsLng": 81.8661
    }
  ]
}
```

Both `instances` and `plantingUnits` are optional arrays — send only what was actually collected. A batch can contain just new trees on an *existing* (already-synced) plot, just new plots with no trees yet, or both together.

### `instances[]` — a plot (farm/planting site)

| Field | Type | Required | Notes |
|---|---|---|---|
| `clientId` | string | Yes | App-generated temporary ID for this plot. Must be unique within this one batch. |
| `areaAcres` | number | Yes | Plot area in acres. |
| `irrigationType` | string | No | Free text, e.g. `"Rainfed"`, `"Drip"`. Defaults to `"Rainfed"` server-side if omitted. |
| `monitoringFrequency` | string | No | One of `"ANNUAL"`, `"SEMI_ANNUAL"`, `"QUARTERLY"`. Defaults to `"ANNUAL"`. |
| `gpsLat` / `gpsLng` | number | No | Plot's own GPS point (decimal degrees). |
| `boundaryGeojson` | GeoJSON object | No | Polygon/MultiPolygon boundary if the app captured a walked perimeter. |

### `plantingUnits[]` — one tree

| Field | Type | Required | Notes |
|---|---|---|---|
| `clientInstanceId` | string | Yes | **Either** the `clientId` of a plot in this same batch (for a brand-new plot), **or** the real server UUID of a plot that was already synced earlier (for adding trees to an existing plot). The server checks the batch's own `clientId`s first, then falls back to treating it as a real UUID. |
| `speciesId` | UUID | Yes | Must be a real species ID from `GET /api/species` (species must be synced/known to the app beforehand — this list doesn't change often, so it can be cached on the device at install time). |
| `dbhCm` | number | No | Trunk diameter at breast height, in cm. |
| `heightM` | number | No | Tree height, in metres. |
| `plantingDate` | string | No | ISO date, `YYYY-MM-DD`. |
| `gpsLat` / `gpsLng` | number | No | This specific tree's GPS point. Defaults to the plot's location if omitted. |

## Response

```json
{
  "success": true,
  "instanceIdMap": { "plot-1": "a1b2c3d4-....-real-uuid" },
  "createdInstances": 1,
  "createdPlantingUnits": 1,
  "errors": []
}
```

- `instanceIdMap` — replace every local `clientId` in the app's offline store with its matching real UUID, then it's safe to drop the offline copy of that plot.
- `success` is `false` if `errors` is non-empty — this is a **partial-success** design: valid rows are still created even if some rows in the same batch failed (e.g. one tree referenced a `speciesId` that doesn't exist). Check `errors[]` and only retry the rows that actually failed, not the whole batch.
- Each entry in `errors[]` has `{ clientId, type: "instance" | "plantingUnit", message }` so the app can flag exactly which offline record needs fixing before resending.

## Practical guidance for the field app

1. Collect plots and trees offline exactly as done today, but generate a local `clientId` string for every new plot the moment it's created on-device (before any server contact).
2. When a tree is added under a plot that was *also* created offline in the same session, set that tree's `clientInstanceId` to the plot's local `clientId` — not a real UUID (it doesn't exist yet).
3. When a tree is added under a plot that was already synced on a previous connection, use that plot's real UUID directly as `clientInstanceId`.
4. Batch everything collected since the last successful sync into one `POST /api/sync/all` call once online.
5. On response: update local records using `instanceIdMap`, then inspect `errors[]` — anything not listed there succeeded.
6. Retry only the specific rows named in `errors[]`; a mistaken `speciesId` or missing required field are the most likely causes and are fixable on-device before resending.

## What this does not cover

- Photos (tree/farmer) are uploaded separately via `POST /api/tree-photos` and `POST /api/farmer-photos` (multipart form uploads) — they are not part of this JSON batch format and should be queued and sent once each corresponding plot/tree UUID is known (i.e. after this sync response comes back).
- Tree growth measurements taken during later monitoring visits use their own endpoint, `POST /api/tree-measurements`, and are not part of this initial plot/tree creation batch.
