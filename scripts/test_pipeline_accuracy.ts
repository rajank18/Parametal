import fs from 'fs';
import path from 'path';
import { GeometrySpecSchema, AnalyzeImageResponseSchema } from '../types/geometrySpecSchema';
import {
  generateGeometry,
  convertSculpturalParamsToSpec,
  UnknownTopologyError,
  MissingGeometrySpecError,
  InvalidGeometrySpecError,
} from '../geometry/engine';
import { validateGeometrySpec } from '../geometry/validator';
import { GeometrySpec } from '../types/design';

console.log('===============================================================');
console.log('    PARAMETAL STUDIO: PIPELINE ACCURACY & RELIABILITY TEST     ');
console.log('===============================================================\n');

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} - ${detail || 'Assertion failed'}`);
  }
}

// =========================================================================
// PART 1: FAIL-FAST ERROR HANDLING TESTS (No Silent Fallbacks)
// =========================================================================
console.log('--- TEST GROUP 1: Fail-Fast & Silent Fallback Elimination ---');

// 1.1 Unknown topology must throw UnknownTopologyError
try {
  const badTopologySpec: any = {
    topology: 'random_mystery_shape',
    objectType: 'table',
    confidence: 0.9,
    dimensions: { width: 500, depth: 500, height: 500 },
    components: [{ type: 'prismatic_slab', dimensions: [500, 20, 500] }],
  };
  generateGeometry(badTopologySpec);
  assert(false, '1.1 Unknown topology throws UnknownTopologyError', 'Did not throw');
} catch (err: any) {
  assert(
    err instanceof UnknownTopologyError,
    '1.1 Unknown topology throws UnknownTopologyError',
    `Expected UnknownTopologyError, got: ${err.name}`
  );
}

// 1.2 Missing geometrySpec must throw MissingGeometrySpecError
try {
  const emptyParams: any = {
    objectName: 'Old Legacy Vessel',
    height: 500,
  };
  convertSculpturalParamsToSpec(emptyParams);
  assert(false, '1.2 Missing geometrySpec throws MissingGeometrySpecError', 'Did not throw');
} catch (err: any) {
  assert(
    err instanceof MissingGeometrySpecError,
    '1.2 Missing geometrySpec throws MissingGeometrySpecError',
    `Expected MissingGeometrySpecError, got: ${err.name}`
  );
}

// 1.3 Invalid geometrySpec bounds must throw InvalidGeometrySpecError
try {
  const invalidBoundsSpec: any = {
    topology: 'prismatic_assembly',
    objectType: 'table',
    confidence: 0.9,
    dimensions: { width: -100, depth: NaN, height: Infinity },
    components: [{ type: 'prismatic_slab', dimensions: [500, 20, 500] }],
  };
  generateGeometry(invalidBoundsSpec);
  assert(false, '1.3 Invalid dimensions throw InvalidGeometrySpecError', 'Did not throw');
} catch (err: any) {
  assert(
    err instanceof InvalidGeometrySpecError,
    '1.3 Invalid dimensions throw InvalidGeometrySpecError',
    `Expected InvalidGeometrySpecError, got: ${err.name}`
  );
}

// =========================================================================
// PART 2: ZOD SCHEMA & TOPOLOGY MANIFEST VALIDATION
// =========================================================================
console.log('\n--- TEST GROUP 2: Fixture Manifest & Zod Schema Validation ---');

const manifestPath = path.join(__dirname, 'fixtures', 'manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

const fixtureGenerators: Record<string, () => GeometrySpec> = {
  'fixture-01-table': () => ({
    topology: 'prismatic_assembly',
    objectType: 'table',
    confidence: 0.96,
    dimensions: { width: 1200, depth: 600, height: 450 },
    components: [
      { type: 'prismatic_slab', role: 'tabletop', dimensions: [1200, 25, 600], position: [0, 437.5, 0] },
      { type: 'support_legs', role: 'table_legs', style: 'four_corner', legHeight: 425, legWidth: 40, legDepth: 40, inset: 50 },
    ],
  }),
  'fixture-02-desk': () => ({
    topology: 'prismatic_assembly',
    objectType: 'table',
    confidence: 0.95,
    dimensions: { width: 900, depth: 500, height: 720 },
    components: [
      { type: 'prismatic_slab', role: 'desktop', dimensions: [900, 25, 500], position: [0, 707.5, 0] },
      { type: 'support_legs', role: 'desk_legs', style: 'four_corner', legHeight: 695, legWidth: 35, legDepth: 35, inset: 40 },
    ],
  }),
  'fixture-03-laptop': () => ({
    topology: 'prismatic_assembly',
    objectType: 'electronics',
    confidence: 0.97,
    dimensions: { width: 320, depth: 220, height: 180 },
    components: [
      { type: 'prismatic_slab', role: 'keyboard_base', dimensions: [320, 15, 220], position: [0, 7.5, 0] },
      { type: 'prismatic_slab', role: 'display_lid', dimensions: [320, 8, 200], position: [0, 100, -90], rotation: [-20, 0, 0] },
    ],
  }),
  'fixture-04-bench': () => ({
    topology: 'prismatic_assembly',
    objectType: 'seating',
    confidence: 0.93,
    dimensions: { width: 1400, depth: 400, height: 450 },
    components: [
      { type: 'prismatic_slab', role: 'bench_seat', dimensions: [1400, 30, 400], position: [0, 435, 0] },
      { type: 'support_legs', role: 'blade_legs', style: 'blade', legHeight: 420, legWidth: 30, legDepth: 360, inset: 80 },
    ],
  }),
  'fixture-05-vase': () => ({
    topology: 'revolved',
    objectType: 'container',
    confidence: 0.98,
    dimensions: { width: 220, depth: 220, height: 480 },
    components: [
      {
        type: 'revolved_body',
        role: 'vase_body',
        height: 480,
        baseRadius: 60,
        waistRadius: 110,
        neckRadius: 40,
        profilePoints: [{ yRatio: 0.0, rRatio: 0.55 }, { yRatio: 0.4, rRatio: 1.0 }, { yRatio: 0.8, rRatio: 0.36 }, { yRatio: 1.0, rRatio: 0.45 }],
      },
    ],
  }),
  'fixture-06-bottle': () => ({
    topology: 'revolved',
    objectType: 'container',
    confidence: 0.99,
    dimensions: { width: 80, depth: 80, height: 280 },
    components: [
      {
        type: 'revolved_body',
        role: 'bottle_body',
        height: 280,
        baseRadius: 40,
        waistRadius: 40,
        neckRadius: 15,
        profilePoints: [{ yRatio: 0.0, rRatio: 1.0 }, { yRatio: 0.65, rRatio: 1.0 }, { yRatio: 0.8, rRatio: 0.38 }, { yRatio: 1.0, rRatio: 0.38 }],
      },
    ],
  }),
  'fixture-07-bowl': () => ({
    topology: 'revolved',
    objectType: 'container',
    confidence: 0.94,
    dimensions: { width: 300, depth: 300, height: 120 },
    components: [
      {
        type: 'revolved_body',
        role: 'bowl_body',
        height: 120,
        baseRadius: 70,
        waistRadius: 150,
        neckRadius: 150,
        profilePoints: [{ yRatio: 0.0, rRatio: 0.45 }, { yRatio: 0.5, rRatio: 0.85 }, { yRatio: 1.0, rRatio: 1.0 }],
      },
    ],
  }),
  'fixture-08-teapot': () => ({
    topology: 'revolved',
    objectType: 'container',
    confidence: 0.96,
    dimensions: { width: 240, depth: 160, height: 200 },
    components: [
      {
        type: 'revolved_body',
        role: 'teapot_body',
        height: 200,
        baseRadius: 80,
        waistRadius: 120,
        neckRadius: 60,
        hasHandle: true,
        handleWidth: 60,
        hasSpout: true,
        spoutLength: 70,
        hasLid: true,
        lidKnobRadius: 12,
      },
    ],
  }),
  'fixture-09-ribbon-chair': () => ({
    topology: 'continuous_sheet',
    objectType: 'seating',
    confidence: 0.92,
    dimensions: { width: 620, depth: 780, height: 820 },
    components: [
      {
        type: 'bent_sheet',
        role: 'continuous_ribbon_shell',
        width: 620,
        thickness: 3.0,
        profilePoints: [[20, 280], [20, -260], [420, -300], [380, 40], [780, 260], [810, 290]],
      },
    ],
  }),
  'fixture-10-sheet-table': () => ({
    topology: 'continuous_sheet',
    objectType: 'table',
    confidence: 0.91,
    dimensions: { width: 450, depth: 450, height: 500 },
    components: [
      {
        type: 'bent_sheet',
        role: 'c_table_shell',
        width: 450,
        thickness: 3.0,
        profilePoints: [[20, 200], [20, -200], [480, -200], [480, 200]],
      },
    ],
  }),
  'fixture-11-partition': () => ({
    topology: 'continuous_sheet',
    objectType: 'partition',
    confidence: 0.97,
    dimensions: { width: 2000, depth: 300, height: 2100 },
    components: [
      {
        type: 'repeated_module',
        role: 'curved_panel_matrix',
        rows: 4,
        columns: 4,
        rowSpacing: 500,
        columnSpacing: 450,
        module: {
          type: 'curved_sheet_panel',
          width: 380,
          height: 480,
          thickness: 2.0,
          horizontalCurvature: 90,
          verticalCurvature: 60,
        },
      },
    ],
  }),
  'fixture-12-curved-panel': () => ({
    topology: 'continuous_sheet',
    objectType: 'wall_mounted',
    confidence: 0.94,
    dimensions: { width: 600, depth: 80, height: 900 },
    components: [
      {
        type: 'curved_sheet_panel',
        role: 'acoustic_panel',
        width: 600,
        height: 900,
        thickness: 2.0,
        horizontalCurvature: 80,
        verticalCurvature: 30,
      },
    ],
  }),
};

manifest.forEach((item: any) => {
  const genFn = fixtureGenerators[item.id];
  if (!genFn) {
    assert(false, `Fixture ${item.id}`, 'Missing generator');
    return;
  }

  const spec = genFn();

  // 1. Validate against Zod schema
  const zodResult = GeometrySpecSchema.safeParse(spec);
  assert(zodResult.success, `Zod validation for ${item.name} (${item.expectedTopology})`, zodResult.error?.message);

  // 2. Validate topology match
  assert(spec.topology === item.expectedTopology, `Topology match for ${item.name}`, `Expected ${item.expectedTopology}, got ${spec.topology}`);

  // 3. Validate geometry compilation
  try {
    const { result, validation } = generateGeometry(spec);
    assert(validation.valid && result.parts.length > 0, `3D Compilation for ${item.name} (${result.parts.length} parts)`);
  } catch (err: any) {
    assert(false, `3D Compilation for ${item.name}`, err.message);
  }
});

// =========================================================================
// SUMMARY SCOREBOARD
// =========================================================================
console.log('\n===============================================================');
const accuracy = ((passedTests / totalTests) * 100).toFixed(1);
console.log(`TOTAL TESTS: ${totalTests} | PASSED: ${passedTests} | ACCURACY: ${accuracy}%`);
console.log('===============================================================');

if (passedTests === totalTests) {
  console.log('\n>>> ALL PIPELINE RELIABILITY & FAIL-FAST TESTS PASSED (100%) <<<');
  process.exit(0);
} else {
  console.error(`\n>>> PIPELINE TESTS FAILED (${totalTests - passedTests} failures) <<<`);
  process.exit(1);
}
