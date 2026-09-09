import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { zodToJsonSchema } from 'zod-to-json-schema';
import {
  AnalyzeImageResponseSchema,
  GeometrySpecSchema,
  normalizeRawAiPayload,
} from '../../../types/geometrySpecSchema';
import { validateGeometrySpec } from '../../../geometry/validator';

export const runtime = 'nodejs';

// Set of verified live models on OpenRouter that accept multimodal image inputs
const VISION_CAPABLE_MODELS = new Set([
  'google/gemma-4-31b-it:free',
  'google/gemma-4-26b-a4b-it:free',
  'dots-studio/dots-3-note-preview:free',
  'thinkingmachines/inkling:free',
  'thinkingmachines/inkling-small:free',
  'nex-agi/nex-n2.5-pro:free',
  'nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free',
]);

// Models that officially support OpenAI-compatible response_format: { type: "json_schema" }
const STRUCTURED_OUTPUT_MODELS = new Set([
  'google/gemini-2.0-flash-001',
  'google/gemini-flash-1.5-8b',
  'openai/gpt-4o-mini',
  'openai/gpt-4o',
]);

function isVisionCapable(model: string): boolean {
  return (
    VISION_CAPABLE_MODELS.has(model) ||
    model.includes('vision') ||
    model.includes('gemini') ||
    model.includes('vl')
  );
}

function supportsStructuredOutput(model: string): boolean {
  return STRUCTURED_OUTPUT_MODELS.has(model);
}

function sanitizeJsonString(str: string): string {
  return str
    .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
    .replace(/\/\/[^\n\r]*/g, '') // remove single-line comments
    .replace(/,\s*([\]}])/g, '$1') // remove trailing commas
    .replace(/:\s*"([^"]*)"\s*\|\s*"[^"]*"/g, ': "$1"') // fix echoed TS unions
    .replace(/"([^"]+)"\s*=\s*/g, '"$1": ') // fix = instead of :
    .replace(/"([^"]+)"\s+"([^"]+)"/g, '"$1": "$2"') // fix missing colon
    .replace(/"([^"]+)"\s+([0-9truefalsenull]+)/g, '"$1": $2')
    .trim();
}

export function extractAndParseJson(rawText: string): any {
  if (!rawText || typeof rawText !== 'string') {
    throw new Error('Empty or non-string response received from AI model');
  }

  // 1. Remove markdown code fences and think blocks
  let text = rawText
    .replace(/<think>[\s\S]*?<\/think>/gi, '')
    .replace(/^Thinking Process:[\s\S]*?(?=\n\n\{|\n\{|\{)/i, '')
    .replace(/```json/gi, '')
    .replace(/```/g, '')
    .trim();

  // 2. Direct parse attempt
  try {
    return JSON.parse(sanitizeJsonString(text));
  } catch {
    // Proceed to robust balanced-brace extraction
  }

  // 3. Balanced brace parser: extracts complete, self-contained JSON objects { ... }
  const candidates: string[] = [];
  let inString = false;
  let escape = false;
  let depth = 0;
  let startIndex = -1;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];

    if (inString) {
      if (escape) {
        escape = false;
      } else if (char === '\\') {
        escape = true;
      } else if (char === '"' || char === "'") {
        inString = false;
      }
    } else {
      if (char === '"' || char === "'") {
        inString = true;
      } else if (char === '{') {
        if (depth === 0) {
          startIndex = i;
        }
        depth++;
      } else if (char === '}') {
        depth--;
        if (depth === 0 && startIndex !== -1) {
          candidates.push(text.substring(startIndex, i + 1));
          startIndex = -1;
        }
      }
    }
  }

  // Sort candidates by length (largest/most complete first)
  candidates.sort((a, b) => b.length - a.length);

  for (const candidate of candidates) {
    const sanitized = sanitizeJsonString(candidate);
    try {
      return JSON.parse(sanitized);
    } catch {
      // Try relaxed JS object parsing (for unquoted keys or single quotes)
      try {
        const fn = new Function(`return (${sanitized})`);
        const result = fn();
        if (result && typeof result === 'object') {
          return JSON.parse(JSON.stringify(result));
        }
      } catch {
        // Try next candidate
      }
    }
  }

  // 4. Last-ditch greedy slice
  const firstBrace = text.indexOf('{');
  const lastBrace = text.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    const substring = sanitizeJsonString(text.substring(firstBrace, lastBrace + 1));
    try {
      return JSON.parse(substring);
    } catch {
      try {
        const fn = new Function(`return (${substring})`);
        const result = fn();
        if (result && typeof result === 'object') {
          return JSON.parse(JSON.stringify(result));
        }
      } catch (e: any) {
        throw new Error(`JSON parse error: ${e.message}`);
      }
    }
  }

  throw new Error('No valid JSON object could be extracted from AI response');
}

function cleanAiOutput(rawText: string): string {
  try {
    const parsed = extractAndParseJson(rawText);
    return JSON.stringify(parsed);
  } catch {
    return rawText
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();
  }
}

export async function POST(req: NextRequest) {
  console.log('=== [AI 2-STEP PIPELINE] Step 1: Incoming Request ===');
  try {
    const { imageBase64 } = await req.json();

    if (!imageBase64) {
      console.error('[AI 2-STEP PIPELINE] Error: imageBase64 missing in request body');
      return NextResponse.json(
        { error: 'Missing imageBase64 in request body' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      console.error('[AI 2-STEP PIPELINE] Error: OPENROUTER_API_KEY not configured');
      return NextResponse.json(
        { error: 'OPENROUTER_API_KEY is not configured in server environment variables.' },
        { status: 500 }
      );
    }

    const requestedVisionModel = process.env.OPENROUTER_IMG_DESC || 'dots-studio/dots-3-note-preview:free';
    const requestedGenModel = process.env.OPENROUTER_GEN || 'nvidia/nemotron-3.5-lightning:free';
    const enableSelfConsistency = process.env.ENABLE_SELF_CONSISTENCY === 'true';

    const normalizedImageUrl = imageBase64.startsWith('data:')
      ? imageBase64
      : `data:image/jpeg;base64,${imageBase64}`;

    // =========================================================================
    // STEP 1: Vision Model Inspection & 10-Point Structural Decomposition
    // =========================================================================
    console.log(`[AI 2-STEP PIPELINE] Step 1: Querying Vision Model (${requestedVisionModel})...`);

    const visionSystemPrompt = `You are an expert 3D CAD Vision Inspector & Structural Topology Classifier.
Analyze the uploaded image and perform a detailed 10-point structural decomposition:

1. Major Physical Components: Identify all distinct parts (e.g. tabletop slab, leg frame, bent shell, screen, shelves).
2. Planar vs Bent vs Curved: Specify which components are flat, bent, or double-curved.
3. Component Connectivity: How are parts attached or supported?
4. Bend Locations: Where do bends or transitions start and end?
5. Cutouts & Openings: Are there openings or voids?
6. Symmetry: Is the object bilateral, rotational_y, or asymmetric?
7. Repetition & Modularity: Are there repeated rows/columns of panels or slats?
8. Structural Integrity: Which components support load?
9. Real-world Dimensions: Estimate width, depth, and height in millimeters.
10. Topology Classification:
    - "revolved": ONLY for rotationally symmetric round bodies (vases, bowls, teapots, bottles, cylindrical cups).
    - "prismatic_assembly": For objects made of boxes, flat slabs, rectangular tops, shelves, legs, frames, desks, laptops, benches.
    - "continuous_sheet": For thin sheet metal furniture formed with bends, folds, continuous ribbons, or modular curved panels.

Output your analysis as clean JSON:
{
  "topology": "prismatic_assembly",
  "objectType": "table",
  "confidence": 0.95,
  "dimensions": { "width": 900, "depth": 500, "height": 720 },
  "features": "Detailed description of physical parts",
  "components": [
    { "type": "prismatic_slab", "role": "top", "dimensions": [900, 25, 500] },
    { "type": "support_legs", "role": "legs", "style": "four_corner", "legHeight": 695 }
  ],
  "material": "mild_steel"
}`;

    let visionRawText = '';
    try {
      const visionRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Parametal Studio',
        },
        body: JSON.stringify({
          model: requestedVisionModel,
          max_tokens: 3000,
          reasoning: { max_tokens: 600 },
          messages: [
            { role: 'system', content: visionSystemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Analyze this photo and immediately output the 10-point structural decomposition in JSON.' },
                {
                  type: 'image_url',
                  image_url: { url: normalizedImageUrl },
                },
              ],
            },
          ],
          temperature: 0.1,
        }),
      });

      if (visionRes.ok) {
        const vData = await visionRes.json();
        const msg = vData.choices?.[0]?.message;
        let extractedDesc = '';

        if (typeof msg?.content === 'string' && msg.content.trim()) {
          extractedDesc = msg.content;
        } else if (typeof msg?.reasoning === 'string' && msg.reasoning.trim()) {
          extractedDesc = msg.reasoning;
        } else if (Array.isArray(msg?.reasoning_details) && msg.reasoning_details.length > 0) {
          extractedDesc = msg.reasoning_details.map((r: any) => r.text || '').join(' ');
        } else {
          extractedDesc = typeof vData.choices?.[0]?.text === 'string' ? vData.choices[0].text : '';
        }

        // Try extracting pure JSON from Step 1 if available
        try {
          const parsedVision = extractAndParseJson(extractedDesc);
          visionRawText = JSON.stringify(parsedVision, null, 2);
        } catch {
          // If no clean JSON block, strip reasoning preamble
          visionRawText = extractedDesc
            .replace(/<think>[\s\S]*?<\/think>/gi, '')
            .replace(/^Thinking Process:[\s\S]*?(?=\n\n[A-Z0-9]|\{)/i, '')
            .replace(/```json/gi, '')
            .replace(/```/g, '')
            .trim();
        }

        console.log('[AI 2-STEP PIPELINE] Step 1 Success! Vision Summary:', visionRawText.substring(0, 300));
      } else {
        const errTxt = await visionRes.text();
        console.warn(`[AI 2-STEP PIPELINE] Vision model ${requestedVisionModel} returned (${visionRes.status}): ${errTxt}`);
      }
    } catch (vErr: any) {
      console.warn('[AI 2-STEP PIPELINE] Vision model fetch exception:', vErr?.message || vErr);
    }

    // =========================================================================
    // STEP 2: Generator Model (Parametric GeometrySpec Construction)
    // =========================================================================
    console.log(`[AI 2-STEP PIPELINE] Step 2: Querying Generator Model (${requestedGenModel})...`);

    const genSystemPrompt = `You are a professional 3D CAD parametric geometry generator AI for Parametal Studio.
Translate visual analysis into a mathematically sound, strongly-typed "GeometrySpec" JSON.

==================================================
TOPOLOGY RULES & COMPONENT TYPES:
==================================================
1. "revolved": Use ONLY for rotationally symmetric vessels (vases, cups, bowls, teapots).
   Component: { "type": "revolved_body", "height": number, "baseRadius": number, "waistRadius": number, "neckRadius": number, "profilePoints": [{ "yRatio": 0.0..1.0, "rRatio": 0.0..1.0 }] }

2. "prismatic_assembly": Use for orthogonal assemblies (desks, tables, laptops, cabinets, benches).
   Components:
   - { "type": "prismatic_slab", "role": "top"|"shelf"|"screen", "dimensions": [width, height/thickness, depth], "position": [x, y, z] }
   - { "type": "support_legs", "role": "legs", "style": "four_corner"|"u_frame"|"pedestal"|"blade"|"hairpin", "legHeight": number, "legWidth": number, "legDepth": number, "inset": number }
   - { "type": "frame_post", "role": "frame", "height": number, "positions": [[x, y, z], ...] }

3. "continuous_sheet": Use for thin sheet metal furniture with bends, folds, continuous sweeps, or modular panels.
   Components:
   - { "type": "bent_sheet", "role": "shell", "width": number, "thickness": 1.5 - 3.0, "profilePoints": [[y1, z1], [y2, z2], ...] }
   - { "type": "curved_sheet_panel", "role": "panel", "width": number, "height": number, "thickness": number, "horizontalCurvature": number, "verticalCurvature": number }
   - { "type": "repeated_module", "rows": number, "columns": number, "rowSpacing": number, "columnSpacing": number, "module": { "type": "curved_sheet_panel", "width": number, "height": number, "thickness": number, "horizontalCurvature": number, "verticalCurvature": number } }

==================================================
CRITICAL INSTRUCTION ON EXAMPLES:
==================================================
The examples below illustrate JSON SCHEMA SHAPE ONLY.
DO NOT copy the numeric values (e.g. 900, 500, 720) unless they match the inspected image.
Every dimension and coordinate MUST be accurately estimated from the actual photo.

--- Example A (Prismatic Work Desk) ---
{
  "activeCategory": "sculptural",
  "sculpturalParameters": {
    "objectName": "Minimalist Work Desk",
    "materialType": "mild_steel",
    "geometrySpec": {
      "topology": "prismatic_assembly",
      "objectType": "table",
      "confidence": 0.95,
      "dimensions": { "width": 900, "depth": 500, "height": 720 },
      "components": [
        { "type": "prismatic_slab", "role": "desktop_slab", "dimensions": [900, 25, 500], "position": [0, 707.5, 0] },
        { "type": "support_legs", "role": "desk_legs", "style": "four_corner", "legHeight": 695, "legWidth": 35, "legDepth": 35, "inset": 40 }
      ]
    }
  }
}

--- Example B (Continuous Sheet Ribbon Chair) ---
{
  "activeCategory": "sculptural",
  "sculpturalParameters": {
    "objectName": "Sculptural Ribbon Sheet Chair",
    "materialType": "aluminum",
    "geometrySpec": {
      "topology": "continuous_sheet",
      "objectType": "seating",
      "confidence": 0.92,
      "dimensions": { "width": 620, "depth": 780, "height": 820 },
      "components": [
        {
          "type": "bent_sheet",
          "role": "continuous_ribbon_shell",
          "width": 620,
          "thickness": 3.0,
          "profilePoints": [[20, 280], [20, -260], [420, -300], [380, 40], [780, 260], [810, 290]]
        }
      ]
    }
  }
}

--- Example C (Revolved Ceramic Vessel) ---
{
  "activeCategory": "sculptural",
  "sculpturalParameters": {
    "objectName": "Fluted Ceramic Vase",
    "materialType": "custom",
    "geometrySpec": {
      "topology": "revolved",
      "objectType": "container",
      "confidence": 0.98,
      "dimensions": { "width": 220, "depth": 220, "height": 480 },
      "components": [
        {
          "type": "revolved_body",
          "role": "vase_body",
          "height": 480,
          "baseRadius": 60,
          "waistRadius": 110,
          "neckRadius": 40,
          "profilePoints": [{ "yRatio": 0.0, "rRatio": 0.55 }, { "yRatio": 0.4, "rRatio": 1.0 }, { "yRatio": 0.8, "rRatio": 0.36 }, { "yRatio": 1.0, "rRatio": 0.45 }]
        }
      ]
    }
  }
}

Return ONLY raw, valid JSON.`;

    const candidateModels = Array.from(
      new Set([
        requestedGenModel,
        'google/gemma-4-31b-it:free',
        'google/gemma-4-26b-a4b-it:free',
        'nvidia/nemotron-3-super-120b-a12b:free',
        'thinkingmachines/inkling:free',
        'dots-studio/dots-3-note-preview:free',
        'nvidia/nemotron-3-ultra-550b-a55b:free',
        'cohere/north-mini-code:free',
        'nex-agi/nex-n2.5-pro:free',
        'nex-agi/nex-n2.5-mini:free',
        'nvidia/nemotron-3.5-lightning:free',
      ])
    );

    // Helper to query LLM for Step 2
    async function queryGenerator(
      modelName: string,
      customUserPrompt?: string,
      repairHistory?: any[]
    ): Promise<{ rawText: string; model: string }> {
      const isVision = isVisionCapable(modelName);
      const isStructured = supportsStructuredOutput(modelName);

      let userContent: any;
      if (customUserPrompt) {
        userContent = customUserPrompt;
      } else if (isVision) {
        userContent = [
          {
            type: 'text',
            text: visionRawText
              ? `Visual Inspection Data: ${visionRawText}\n\nMap this object into the exact parametric GeometrySpec JSON.`
              : 'Analyze this photo and output the exact parametric GeometrySpec JSON.',
          },
          {
            type: 'image_url',
            image_url: { url: normalizedImageUrl },
          },
        ];
      } else {
        userContent = visionRawText
          ? `Visual Inspection Data: ${visionRawText}\n\nMap this object into the exact parametric GeometrySpec JSON.`
          : 'Analyze this object and output estimated 3D parametric variables in JSON.';
      }

      const messages: any[] = [{ role: 'system', content: genSystemPrompt }];

      if (repairHistory && repairHistory.length > 0) {
        messages.push(...repairHistory);
      } else {
        messages.push({ role: 'user', content: userContent });
      }

      const reqBody: any = {
        model: modelName,
        max_tokens: 1500,
        temperature: 0.1,
        messages,
      };

      if (isStructured) {
        const jsonSchemaObj = zodToJsonSchema(AnalyzeImageResponseSchema as any, 'AnalyzeImageResponse');
        reqBody.response_format = {
          type: 'json_schema',
          json_schema: { name: 'AnalyzeImageResponse', schema: jsonSchemaObj },
        };
      }

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'http://localhost:3000',
          'X-Title': 'Parametal Studio',
        },
        body: JSON.stringify(reqBody),
      });

      if (!res.ok) {
        const errTxt = await res.text();
        throw new Error(`OpenRouter API error (${res.status}): ${errTxt}`);
      }

      const data = await res.json();
      const choiceMsg = data.choices?.[0]?.message;
      let rawText = '';

      if (typeof choiceMsg?.content === 'string') {
        rawText = choiceMsg.content;
      } else if (Array.isArray(choiceMsg?.content)) {
        rawText = choiceMsg.content.map((c: any) => c.text || '').join('');
      } else if (typeof choiceMsg?.reasoning === 'string') {
        rawText = choiceMsg.reasoning;
      }

      return { rawText, model: modelName };
    }

    // =========================================================================
    // EXECUTION & REPAIR LOOP (Max 2 repair attempts across the request)
    // =========================================================================
    let currentModelIndex = 0;
    let successfulModel = '';
    let parsedData: any = null;
    let validatedGeometrySpec: any = null;
    let repairAttempts = 0;
    const MAX_REPAIRS = 2;
    let lastValidationError = '';
    let rateLimitMessage = '';

    while (currentModelIndex < candidateModels.length) {
      const activeModel = candidateModels[currentModelIndex];
      console.log(`[AI 2-STEP PIPELINE] Trying generator model: "${activeModel}"...`);

      try {
        let genResult = await queryGenerator(activeModel);
        successfulModel = genResult.model;

        // Parse & Validate Loop with up to MAX_REPAIRS
        let currentRaw = genResult.rawText;
        let isValid = false;

        while (repairAttempts <= MAX_REPAIRS && !isValid) {
          try {
            const rawJson = extractAndParseJson(currentRaw);
            const normalizedJson = normalizeRawAiPayload(rawJson);

            // Validate against full Zod schema
            const zodParsed = AnalyzeImageResponseSchema.safeParse(normalizedJson);

            if (!zodParsed.success) {
              const errorMessages = zodParsed.error.issues
                .map((i: any) => `${i.path.join('.')}: ${i.message}`)
                .join('; ');
              throw new Error(`Schema validation failed: ${errorMessages}`);
            }

            const candidateSpec = zodParsed.data.sculpturalParameters?.geometrySpec;
            if (candidateSpec) {
              // Also run engine validation checks
              const engineVal = validateGeometrySpec(candidateSpec as any);
              if (!engineVal.valid) {
                throw new Error(`Geometry engine bounds validation failed: ${engineVal.errors.join('; ')}`);
              }
              validatedGeometrySpec = candidateSpec;
            }

            parsedData = zodParsed.data;
            isValid = true;
            console.log(`[AI 2-STEP PIPELINE] Success with model "${activeModel}" (Repairs: ${repairAttempts})!`);
          } catch (valErr: any) {
            lastValidationError = valErr?.message || 'Invalid JSON / GeometrySpec structure';
            console.warn(`[AI 2-STEP PIPELINE] Validation error on attempt ${repairAttempts}: ${lastValidationError}`);

            if (repairAttempts < MAX_REPAIRS) {
              repairAttempts++;
              console.log(`[AI 2-STEP PIPELINE] Triggering Repair Attempt #${repairAttempts} on model "${activeModel}"...`);

              const repairMessages = [
                {
                  role: 'user',
                  content: visionRawText
                    ? `Visual Inspection Data: ${visionRawText}\n\nOutput the GeometrySpec JSON.`
                    : 'Output the GeometrySpec JSON for this object.',
                },
                { role: 'assistant', content: currentRaw },
                {
                  role: 'user',
                  content: `Your previous JSON response was invalid with the following error:\n"${lastValidationError}"\n\nPlease fix the error and return ONLY valid, compliant JSON matching the GeometrySpec schema.`,
                },
              ];

              const repairRes = await queryGenerator(activeModel, undefined, repairMessages);
              currentRaw = repairRes.rawText;
            } else {
              break;
            }
          }
        }

        if (isValid) {
          break; // Successfully got a validated spec!
        }
      } catch (fetchErr: any) {
        const errMsg = fetchErr?.message || String(fetchErr);
        console.warn(`[AI 2-STEP PIPELINE] Model "${activeModel}" failed:`, errMsg);
        if (errMsg.includes('Rate limit exceeded') || errMsg.includes('429')) {
          rateLimitMessage = 'OpenRouter free-tier daily rate limit (50 requests/day) has been reached for this API key. Please wait for the daily reset or add credits at openrouter.ai.';
        }
      }

      currentModelIndex++;
    }

    if (!parsedData) {
      if (rateLimitMessage) {
        return NextResponse.json(
          { error: rateLimitMessage },
          { status: 429 }
        );
      }

      return NextResponse.json(
        {
          error: `AI output failed validation after repair attempts. Last error: ${lastValidationError}`,
        },
        { status: 422 }
      );
    }

    // =========================================================================
    // CONFIDENCE GATING & SELF-CONSISTENCY
    // =========================================================================
    const specConfidence = validatedGeometrySpec?.confidence ?? 1.0;
    let isLowConfidence = specConfidence < 0.6;

    if (isLowConfidence && currentModelIndex + 1 < candidateModels.length) {
      console.log(`[AI 2-STEP PIPELINE] Low confidence (${specConfidence}) detected. Trying fallback verification model...`);
      try {
        const fallbackModel = candidateModels[currentModelIndex + 1];
        const secondGen = await queryGenerator(fallbackModel);
        const secondJson = extractAndParseJson(secondGen.rawText);
        const secondNormalized = normalizeRawAiPayload(secondJson);
        const secondParsed = AnalyzeImageResponseSchema.safeParse(secondNormalized);

        if (secondParsed.success && secondParsed.data.sculpturalParameters?.geometrySpec) {
          const secondSpec = secondParsed.data.sculpturalParameters.geometrySpec;
          if (secondSpec.confidence >= specConfidence) {
            parsedData = secondParsed.data;
            validatedGeometrySpec = secondSpec;
            isLowConfidence = secondSpec.confidence < 0.6;
          }
        }
      } catch (retryErr) {
        console.warn('[AI 2-STEP PIPELINE] Low-confidence retry pass skipped:', retryErr);
      }
    }

    // Optional self-consistency voting check
    if (enableSelfConsistency && currentModelIndex + 1 < candidateModels.length) {
      try {
        const scModel = candidateModels[currentModelIndex + 1];
        const scRes = await queryGenerator(scModel);
        const scJson = extractAndParseJson(scRes.rawText);
        const scNormalized = normalizeRawAiPayload(scJson);
        const scParsed = AnalyzeImageResponseSchema.safeParse(scNormalized);

        if (scParsed.success && scParsed.data.sculpturalParameters?.geometrySpec) {
          const scSpec = scParsed.data.sculpturalParameters.geometrySpec;
          if (scSpec.topology !== validatedGeometrySpec?.topology) {
            console.warn(
              `[Self-Consistency Warning] Primary model (${successfulModel}) topology: "${validatedGeometrySpec?.topology}" vs Second model (${scModel}) topology: "${scSpec.topology}"`
            );
          }
        }
      } catch (scErr) {
        console.warn('[AI 2-STEP PIPELINE] Self-consistency verification check skipped:', scErr);
      }
    }

    // Save debug log file locally
    const debugFilePath = path.join(process.cwd(), 'ai_debug_response.json');
    try {
      fs.writeFileSync(
        debugFilePath,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            visionRawText,
            successfulModel,
            repairAttempts,
            isLowConfidence,
            finalData: parsedData,
          },
          null,
          2
        )
      );
    } catch (fsErr) {
      console.error('[AI 2-STEP PIPELINE] Failed to write debug log file:', fsErr);
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      lowConfidence: isLowConfidence,
      modelUsed: successfulModel,
      repairAttempts,
    });
  } catch (error: any) {
    console.error('[AI 2-STEP PIPELINE] Unhandled Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image with AI model' },
      { status: 500 }
    );
  }
}
