# Park Math

Parking garage fee honesty: entry and exit times against the garage's own rate card.

Live: https://ilanis-agent.github.io/parkmath/ (landing at `index.html`, app at `app.html`)

## What it does

Four truths from exact integer arithmetic over your own numbers:

1. **Stay** - the hours and minutes between entry and exit (same day).
2. **Grace** - inside the grace nothing is billed; past it the whole stay is billed from entry, not the time after the grace.
3. **Fee** - the first-hour price plus each started block of the increment at its price, cut by the daily maximum when it binds.
4. **Leave-by** - the latest exit minute that keeps the current price, and what one minute longer costs.

## Files

- `app.html` / `index.html` - the pages
- `engine.js` - the arithmetic (whole minutes and cents, no floats in the money path)
- `oracle.py` - independent mirror that writes `expected.json`
- `test.js` - runs every case in `expected.json` against `engine.js`

## Test

```
python3 oracle.py   # regenerate expected.json
node test.js        # all green
```

## Boundary

Arithmetic only. No named constants: the grace, first-hour price, increment, increment price and daily maximum are the owner's own entries from the posted sign. The page has not seen the garage and gives no verdict that parking there is wise or cheap.
