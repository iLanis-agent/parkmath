// Park Math engine: parking garage fee honesty - entry and exit times against the garage's own rate card: the stay, the grace truth, the step-bracket fee with the daily cap, and the leave-by minute that keeps the price where it is. Exact integers, half-up never needed (all arithmetic is in whole minutes and cents). No named constants; every rate is the owner's own entry from the posted sign.
function _i(t, err, digits, lo, hi) {
  t = typeof t === "string" ? t.trim() : "";
  if (!new RegExp("^[0-9]{1," + digits + "}$").test(t)) throw new Error(err);
  var v = parseInt(t, 10);
  if (v < lo || v > hi) throw new Error(err);
  return v;
}
function _pl(n, one, many) { return n + (n === 1 ? one : many); }
function _v(n, one, many) { return n === 1 ? one : many; }
function _m(c) { return "$" + Math.floor(c / 100) + "." + String(c % 100).padStart(2, "0"); }
var _E = "the entry time must be a real time as HH:MM in 24-hour form";
var _X = "the exit time must be a real time as HH:MM in 24-hour form";
var _O = "the exit time must be after the entry time";
var _G = "the grace minutes must be from 0 to 120 with no decimal places";
var _F = "the first-hour price must be from 1 to 99999 cents with no decimal places";
var _K = "the increment must be from 1 to 120 minutes with no decimal places";
var _P = "the increment price must be from 1 to 99999 cents with no decimal places";
var _D = "the daily maximum must be from 1 to 999999 cents with no decimal places";
function _t(t, err) {
  t = typeof t === "string" ? t.trim() : "";
  var m = /^([0-9]{2}):([0-9]{2})$/.exec(t);
  if (!m) throw new Error(err);
  var h = +m[1], mi = +m[2];
  if (h > 23 || mi > 59) throw new Error(err);
  return h * 60 + mi;
}
function _hm(m) {
  var h = Math.floor(m / 60) % 24, mi = m % 60;
  var ap = h < 12 ? "AM" : "PM", h12 = h % 12 === 0 ? 12 : h % 12;
  return h12 + ":" + String(mi).padStart(2, "0") + " " + ap;
}
function _dur(min) {
  var h = Math.floor(min / 60), m = min % 60;
  if (h === 0) return _pl(m, " minute", " minutes");
  if (m === 0) return _pl(h, " hour", " hours");
  return _pl(h, " hour", " hours") + " and " + _pl(m, " minute", " minutes");
}
function _stay(entry, exit) {
  var e = _t(entry, _E), x = _t(exit, _X);
  if (x <= e) throw new Error(_O);
  return x - e;
}
function _fee(stay, g, f, k, pk, d) {
  if (stay <= g) return 0;
  var u = stay <= 60 ? f : f + Math.ceil((stay - 60) / k) * pk;
  return u < d ? u : d;
}
function _rate(g, f, k, pk, d) {
  g = _i(g, _G, 3, 0, 120); f = _i(f, _F, 5, 1, 99999);
  k = _i(k, _K, 3, 1, 120); pk = _i(pk, _P, 5, 1, 99999); d = _i(d, _D, 6, 1, 999999);
  return [g, f, k, pk, d];
}
function stayTruth(entry, exit) {
  var s = _stay(entry, exit);
  return "From " + _hm(_t(entry, _E)) + " to " + _hm(_t(exit, _X)) + " the stay is " + _dur(s) + ".";
}
function graceTruth(entry, exit, grace) {
  var s = _stay(entry, exit), g = _i(grace, _G, 3, 0, 120);
  if (g === 0) return "With no grace the whole stay is billed from " + _hm(_t(entry, _E)) + ".";
  if (s <= g) return "The stay sits inside the " + _pl(g, " minute", " minutes") + " of grace, so nothing is billed.";
  return "Past the " + _pl(g, " minute", " minutes") + " of grace the whole stay is billed, not the " + _dur(s - g) + " after it.";
}
function feeTruth(entry, exit, grace, first, kmin, kprice, dmax) {
  var s = _stay(entry, exit), r = _rate(grace, first, kmin, kprice, dmax);
  var g = r[0], f = r[1], k = r[2], pk = r[3], d = r[4];
  if (s <= g) return "Inside the grace the stay is free: " + _m(0) + ".";
  var u = s <= 60 ? f : f + Math.ceil((s - 60) / k) * pk;
  if (s <= 60 && f >= d) return "The " + _m(d) + " daily maximum cuts even the first hour to " + _m(d) + ".";
  if (s <= 60) return "The stay fits the first hour: " + _m(f) + ", under the " + _m(d) + " daily maximum.";
  var pre = "At " + _m(f) + " for the first hour and " + _m(pk) + " for each started block of " + _pl(k, " minute", " minutes") + " after it, the stay bills " + _m(u);
  if (u <= d) return pre + ", under the " + _m(d) + " daily maximum.";
  return pre + ", so the " + _m(d) + " daily maximum cuts it to " + _m(d) + ".";
}
function leaveTruth(entry, exit, grace, first, kmin, kprice, dmax) {
  var s = _stay(entry, exit), r = _rate(grace, first, kmin, kprice, dmax);
  var g = r[0], f = r[1], k = r[2], pk = r[3], d = r[4];
  var e = _t(entry, _E);
  var cur = _fee(s, g, f, k, pk, d);
  if (s <= g) return "Leave by " + _hm(e + g) + " and the stay is free; a minute longer and it is " + "" + _m(_fee(g + 1, g, f, k, pk, d)) + ".";
  var u = s <= 60 ? f : f + Math.ceil((s - 60) / k) * pk;
  if (u > d) return "The " + _m(d) + " daily maximum already holds; leave any time before midnight and the price stays " + _m(d) + ".";
  var be = s <= 60 ? 60 : 60 + Math.ceil((s - 60) / k) * k;
  return "Leave by " + _hm(e + be) + " and the price stays " + _m(cur) + "; a minute longer and it is " + "" + _m(_fee(be + 1, g, f, k, pk, d)) + ".";
}
