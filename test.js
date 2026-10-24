const fs = require("fs");
eval(fs.readFileSync("engine.js", "utf8"));
const exp = JSON.parse(fs.readFileSync("expected.json", "utf8"));
const fns = { stay: stayTruth, grace: graceTruth, fee: feeTruth, leave: leaveTruth };
let fail = 0;
for (const c of exp.cases) {
  const got = JSON.stringify(fns[c.fn](...c.args));
  if (got !== JSON.stringify(c.expect)) { fail++; console.log("MISMATCH", c.fn, c.args, "\n got:", got, "\n exp:", JSON.stringify(c.expect)); }
}
const ERRS = ["the entry time must be a real time as HH:MM in 24-hour form",
  "the exit time must be a real time as HH:MM in 24-hour form",
  "the exit time must be after the entry time",
  "the grace minutes must be from 0 to 120 with no decimal places",
  "the first-hour price must be from 1 to 99999 cents with no decimal places",
  "the increment must be from 1 to 120 minutes with no decimal places",
  "the increment price must be from 1 to 99999 cents with no decimal places",
  "the daily maximum must be from 1 to 999999 cents with no decimal places"];
for (const [fn, args] of exp.errors) {
  let threw = null;
  try { fns[fn](...args); } catch (e) { threw = e.message; }
  if (!threw || !ERRS.includes(threw)) { fail++; console.log("ERRCASE FAIL", fn, args, "->", threw); }
}
console.log(fail ? `${fail} FAILURES` : "all green");
process.exit(fail ? 1 : 0);
