import assert from "node:assert/strict";
import test from "node:test";
import { ocrQuery } from "../lib/product-ocr";

test("prefers the product variant over a promotional banner", () => {
  assert.equal(ocrQuery("MASALA |\n~ MUNCH\nNOW TASTIER!\nMade with Dal, Corn & Rice"), "MASALA MUNCH");
  assert.equal(ocrQuery("MASALA |\n(Munch\nSAR $=\nNOW TASTIER!"), "MASALA Munch");
});

test("does not turn OCR noise into a product query", () => {
  assert.equal(ocrQuery("NOW TASTIERT y Made with Dal Corn Rice y\n7 Nd EN yA Yih p 3B"), "");
});
