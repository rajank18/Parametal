import { GeometrySpec } from '../types/design';
import { generateGeometry } from '../geometry/engine';
import { validateGeometrySpec } from '../geometry/validator';

console.log('=== RUNNING GEOMETRY ENGINE DETERMINISTIC TESTS ===\n');

// 1. Vase (revolved)
const vaseSpec: GeometrySpec = {
  topology: 'revolved',
  objectType: 'container',
  confidence: 0.98,
  dimensions: { width: 220, depth: 220, height: 480 },
  materialType: 'aluminum',
  components: [
    {
      type: 'revolved_body',
      role: 'vase_body',
      height: 480,
      baseRadius: 60,
      waistRadius: 110,
      neckRadius: 40,
      profilePoints: [
        { yRatio: 0.0, rRatio: 0.6 },
        { yRatio: 0.35, rRatio: 1.0 },
        { yRatio: 0.75, rRatio: 0.4 },
        { yRatio: 1.0, rRatio: 0.5 },
      ],
      hasHandle: false,
      hasSpout: false,
      hasLid: false,
    },
  ],
};

const res1 = generateGeometry(vaseSpec);
console.log('Test 1 (Vase -> revolved):', {
  valid: res1.validation.valid,
  partsCount: res1.result.parts.length,
  parts: res1.result.parts.map((p) => p.name),
});
if (!res1.validation.valid || res1.result.parts.length === 0) {
  throw new Error('Test 1 Failed');
}

// 2. Rectangular Table (prismatic_assembly)
const tableSpec: GeometrySpec = {
  topology: 'prismatic_assembly',
  objectType: 'table',
  confidence: 0.96,
  dimensions: { width: 1400, depth: 750, height: 740 },
  materialType: 'mild_steel',
  components: [
    {
      type: 'prismatic_slab',
      role: 'top_slab',
      dimensions: [1400, 30, 750],
      position: [0, 725, 0],
    },
    {
      type: 'support_legs',
      role: 'corner_legs',
      style: 'four_corner',
      legHeight: 710,
      legWidth: 40,
      legDepth: 40,
      inset: 60,
    },
  ],
};

const res2 = generateGeometry(tableSpec);
console.log('Test 2 (Table -> prismatic_assembly):', {
  valid: res2.validation.valid,
  partsCount: res2.result.parts.length,
  parts: res2.result.parts.map((p) => p.name),
});
if (!res2.validation.valid || res2.result.parts.length < 5) {
  throw new Error('Test 2 Failed');
}

// 3. Sheet-Metal Table (continuous_sheet)
const sheetTableSpec: GeometrySpec = {
  topology: 'continuous_sheet',
  objectType: 'table',
  confidence: 0.92,
  dimensions: { width: 500, depth: 500, height: 520 },
  materialType: 'mild_steel',
  components: [
    {
      type: 'bent_sheet',
      role: 'c_shape_shell',
      width: 500,
      thickness: 3.0,
      profilePoints: [
        [20, 200],
        [20, -200],
        [500, -200],
        [500, 200],
      ],
    },
  ],
};

const res3 = generateGeometry(sheetTableSpec);
console.log('Test 3 (Sheet Table -> continuous_sheet):', {
  valid: res3.validation.valid,
  partsCount: res3.result.parts.length,
  parts: res3.result.parts.map((p) => p.name),
});
if (!res3.validation.valid || res3.result.parts.length === 0) {
  throw new Error('Test 3 Failed');
}

// 4. Curved Sheet Chair (continuous_sheet)
const chairSpec: GeometrySpec = {
  topology: 'continuous_sheet',
  objectType: 'seating',
  confidence: 0.94,
  dimensions: { width: 650, depth: 800, height: 850 },
  materialType: 'galvanized',
  components: [
    {
      type: 'bent_sheet',
      role: 'sculptural_ribbon_seat',
      width: 650,
      thickness: 3.0,
      profilePoints: [
        [20, 300],
        [20, -280],
        [420, -320],
        [380, 50],
        [800, 280],
        [830, 310],
      ],
    },
  ],
};

const res4 = generateGeometry(chairSpec);
console.log('Test 4 (Curved Chair -> continuous_sheet):', {
  valid: res4.validation.valid,
  partsCount: res4.result.parts.length,
  parts: res4.result.parts.map((p) => p.name),
});
if (!res4.validation.valid || res4.result.parts.length === 0) {
  throw new Error('Test 4 Failed');
}

// 5. Modular Curved Partition (continuous_sheet)
const partitionSpec: GeometrySpec = {
  topology: 'continuous_sheet',
  objectType: 'partition',
  confidence: 0.97,
  dimensions: { width: 2200, depth: 300, height: 2100 },
  materialType: 'custom',
  components: [
    {
      type: 'repeated_module',
      role: 'modular_screen_matrix',
      rows: 4,
      columns: 5,
      rowSpacing: 500,
      columnSpacing: 420,
      module: {
        type: 'curved_sheet_panel',
        width: 360,
        height: 460,
        thickness: 2.0,
        horizontalCurvature: 100,
        verticalCurvature: 50,
      },
      stagger: true,
      rotationVariation: 12,
    },
  ],
};

const res5 = generateGeometry(partitionSpec);
console.log('Test 5 (Modular Partition -> continuous_sheet):', {
  valid: res5.validation.valid,
  partsCount: res5.result.parts.length,
  postsCount: res5.result.parts.filter((p) => p.name.includes('Post')).length,
  panelsCount: res5.result.parts.filter((p) => p.name.includes('Panel')).length,
});
if (!res5.validation.valid || res5.result.parts.length !== 25) {
  throw new Error(`Test 5 Failed (expected 25 parts [20 panels + 5 posts], got ${res5.result.parts.length})`);
}

// 6. Validation Error Handling
const badSpec: any = {
  topology: 'invalid_topology',
  dimensions: { width: -100, depth: NaN, height: Infinity },
  components: [],
};
const valResult = validateGeometrySpec(badSpec);
console.log('Test 6 (Validator Error Detection):', {
  valid: valResult.valid,
  expectedErrorsCount: valResult.errors.length,
  errors: valResult.errors,
});
if (valResult.valid || valResult.errors.length < 3) {
  throw new Error('Test 6 Failed to catch invalid spec');
}

console.log('\n>>> ALL 6 GEOMETRY ENGINE TESTS PASSED PERFECTLY! <<<');
