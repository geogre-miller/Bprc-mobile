import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { PNG } from "pngjs";
import { compareScreenshots } from "../../qa/visual-diff.mjs";

test("visual diff records advisory mismatch regions and comparison evidence", () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), "bprc-visual-"));
  const reference = path.join(root, "reference.png");
  const actual = path.join(root, "actual.png");
  const diff = path.join(root, "diff.png");
  const comparison = path.join(root, "comparison.png");
  const refPng = new PNG({ width: 64, height: 64, colorType: 6 });
  const actualPng = new PNG({ width: 64, height: 64, colorType: 6 });
  refPng.data.fill(255);
  actualPng.data.fill(255);
  for (let y = 8; y < 24; y += 1) {
    for (let x = 8; x < 24; x += 1) {
      const offset = (y * 64 + x) * 4;
      actualPng.data[offset] = 0;
      actualPng.data[offset + 1] = 0;
      actualPng.data[offset + 2] = 0;
    }
  }
  fs.writeFileSync(reference, PNG.sync.write(refPng));
  fs.writeFileSync(actual, PNG.sync.write(actualPng));

  const result = compareScreenshots({ reference, actual, diffOutput: diff, comparisonOutput: comparison });
  assert.equal(result.ok, true);
  assert.equal(result.informationalOnly, true);
  assert.ok(result.mismatchPixels > 0);
  assert.ok(result.candidateMismatchRegions.length > 0);
  assert.equal(fs.existsSync(diff), true);
  assert.equal(PNG.sync.read(fs.readFileSync(comparison)).width, 192);
});
