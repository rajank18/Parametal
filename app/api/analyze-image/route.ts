import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

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

    const requestedVisionModel = process.env.OPENROUTER_IMG_DESC || 'meta-llama/llama-3.2-11b-vision-instruct';
    const requestedGenModel = process.env.OPENROUTER_GEN || 'google/gemini-2.0-flash-001';

    // 1. Query Vision Model (OPENROUTER_IMG_DESC) to inspect image geometry & structural decomposition
    console.log(`[AI 2-STEP PIPELINE] Step 1: Querying Vision Model (${requestedVisionModel})...`);

    const visionSystemPrompt = `You are a 3D CAD Vision Inspector & Structural Topology Classifier.
Analyze the uploaded photo and output a JSON structural decomposition of the object.

Answer these 10 structural questions:
1. Major physical components? (e.g. tabletop, base plate, screen, legs, bent shell, frame, repeated panels)
2. Which components are flat vs bent vs curved?
3. How do components connect to each other?
4. Where do bends or curves begin/end?
5. Where are openings/cutouts?
6. Is the object symmetric? (bilateral, rotational_y, or none)
7. Is there repetition or modularity? (rows, columns of panels/slats)
8. Which components are structural supports?
9. Real-world dimensions in millimeters [width, depth, height]?
10. Topology classification:
    - "revolved": ONLY for rotationally symmetric round bodies (vases, bottles, cups, bowls, cylindrical vessels).
    - "prismatic_assembly": For objects built from boxes, flat slabs, rectangular tops, shelves, legs, frames, laptops, desks, credenzas.
    - "continuous_sheet": For objects made of bent, folded, or curved thin sheet metal (sculptural sheet chairs, bent sheet tables, modular curved partition screens).

Example JSON output:
{
  "topology": "prismatic_assembly",
  "objectType": "table",
  "confidence": 0.95,
  "dimensions": { "width": 1200, "depth": 600, "height": 450 },
  "features": "Rectangular tabletop slab with 4 corner legs",
  "components": [
    { "type": "prismatic_slab", "role": "tabletop", "dimensions": [1200, 25, 600] },
    { "type": "support_legs", "role": "corner_legs", "style": "four_corner", "legHeight": 425, "legWidth": 35, "legDepth": 35 }
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
          max_tokens: 800,
          reasoning: { max_tokens: 0 },
          messages: [
            { role: 'system', content: visionSystemPrompt },
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Decompose the physical structure and classify topology of this object in JSON.' },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                  },
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

        // Clean up extracted description
        visionRawText = extractedDesc
          .replace(/<think>[\s\S]*?<\/think>/gi, '')
          .replace(/```json/gi, '')
          .replace(/```/g, '')
          .trim();

        console.log('[AI 2-STEP PIPELINE] Step 1 Success! Vision Description:', visionRawText.substring(0, 300));
      } else {
        const errTxt = await visionRes.text();
        console.warn(`[AI 2-STEP PIPELINE] Vision model ${requestedVisionModel} failed (${visionRes.status}): ${errTxt}`);
      }
    } catch (vErr: any) {
      console.warn('[AI 2-STEP PIPELINE] Vision model fetch error:', vErr?.message || vErr);
    }

    // 2. Query Generator Model (OPENROUTER_GEN) to produce Parametal Studio GeometrySpec JSON
    console.log(`[AI 2-STEP PIPELINE] Step 2: Querying Code Generator Model (${requestedGenModel})...`);

    const genSystemPrompt = `You are a 3D CAD parametric geometry generator AI for Parametal Studio.
Given a visual inspection and structural decomposition of an object, output exact JSON parameters containing a strongly typed "geometrySpec".

TOPOLOGY DEFINITIONS & COMPONENT RULES:
1. "revolved": ONLY for rotationally symmetric objects (vases, bowls, bottles, cups, cylindrical vessels).
   Components must use "type": "revolved_body":
   - "height": number in mm
   - "baseRadius": number in mm
   - "waistRadius": number in mm
   - "neckRadius": number in mm
   - "profilePoints": [{ "yRatio": 0.0..1.0, "rRatio": 0.0..1.0 }]
   - "hasHandle": boolean (false unless mug/teapot)
   - "hasSpout": boolean (false unless teapot/pitcher)
   - "hasLid": boolean (false for tables/chairs/laptops/electronics/boxes)

2. "prismatic_assembly": For orthogonal objects (tables, desks, laptops, benches, cabinets, boxes, shelves).
   Components can include:
   - "type": "prismatic_slab", "role": "tabletop" | "shelf" | "laptop_base" | "screen", "dimensions": [width, height/thickness, depth] in mm, "position": [x, y, z] in mm
   - "type": "support_legs", "role": "legs", "style": "four_corner" | "u_frame" | "pedestal" | "blade" | "hairpin", "legHeight": number, "legWidth": number, "legDepth": number, "inset": number
   - "type": "frame_post", "role": "structural_frame", "height": number, "positions": [[x, y, z], ...]

3. "continuous_sheet": For thin sheet metal furniture formed with bends, folds, curved surfaces, or repeated modules.
   Components can include:
   - "type": "bent_sheet", "role": "ribbon_shell" | "upper_top_back", "width": number in mm, "thickness": 1.5 - 3.0 in mm, "profilePoints": [[y1, z1], [y2, z2], ...]
   - "type": "curved_sheet_panel", "role": "side_panel" | "curved_back", "width": number, "height": number, "thickness": number, "horizontalCurvature": number, "verticalCurvature": number
   - "type": "repeated_module", "rows": number, "columns": number, "rowSpacing": number, "columnSpacing": number, "module": { "type": "curved_sheet_panel", "width": number, "height": number, "thickness": number, "horizontalCurvature": number, "verticalCurvature": number }

Return ONLY valid JSON matching this schema:
{
  "activeCategory": "sculptural",
  "sculpturalParameters": {
    "objectName": "Rectangular Coffee Table",
    "height": 450,
    "baseRadius": 300,
    "waistRadius": 300,
    "neckRadius": 300,
    "wallThickness": 2.5,
    "hasHandle": false,
    "hasSpout": false,
    "hasLid": false,
    "materialType": "mild_steel",
    "geometrySpec": {
      "topology": "prismatic_assembly",
      "objectType": "table",
      "confidence": 0.95,
      "dimensions": {
        "width": 1200,
        "depth": 600,
        "height": 450
      },
      "components": [
        {
          "type": "prismatic_slab",
          "role": "tabletop",
          "dimensions": [1200, 25, 600],
          "position": [0, 437.5, 0]
        },
        {
          "type": "support_legs",
          "role": "table_legs",
          "style": "four_corner",
          "legHeight": 425,
          "legWidth": 40,
          "legDepth": 40,
          "inset": 50
        }
      ]
    }
  }
}

CRITICAL RULES:
- Never use "revolved" for rectangular tables, desks, laptops, benches, or partition walls.
- Always include realistic dimensions in millimeters.
- Output ONLY the raw JSON object.`;

    const genPrompt = visionRawText
      ? `Visual Inspection Data: ${visionRawText}\n\nMap this object into the exact parametric JSON configuration.`
      : 'Analyze this photo and return estimated 3D parametric variables in JSON.';

    const candidateModels = Array.from(new Set([
      requestedGenModel,
      'google/gemini-2.0-flash-001',
      'google/gemini-flash-1.5-8b',
      'meta-llama/llama-3.2-11b-vision-instruct'
    ]));

    let openRouterResponse: Response | null = null;
    let lastErrorText = '';
    let successfulModel = '';

    for (const modelName of candidateModels) {
      console.log(`[AI 2-STEP PIPELINE] Trying generator model: "${modelName}"...`);
      try {
        const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
            'HTTP-Referer': 'http://localhost:3000',
            'X-Title': 'Parametal Studio',
          },
          body: JSON.stringify({
            model: modelName,
            max_tokens: 1500,
            reasoning: { max_tokens: 0 },
            messages: [
              { role: 'system', content: genSystemPrompt },
              {
                role: 'user',
                content: visionRawText
                  ? genPrompt
                  : [
                      { type: 'text', text: genPrompt },
                      {
                        type: 'image_url',
                        image_url: {
                          url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                        },
                      },
                    ],
              },
            ],
            temperature: 0.1,
          }),
        });

        if (res.ok) {
          console.log(`[AI 2-STEP PIPELINE] Success with generator model: "${modelName}"!`);
          openRouterResponse = res;
          successfulModel = modelName;
          break;
        } else {
          lastErrorText = await res.text();
          console.warn(`[AI 2-STEP PIPELINE] Model "${modelName}" failed (${res.status}): ${lastErrorText}`);
        }
      } catch (err: any) {
        lastErrorText = err.message;
        console.warn(`[AI 2-STEP PIPELINE] Fetch exception for "${modelName}":`, err);
      }
    }

    if (!openRouterResponse) {
      return NextResponse.json(
        { error: `OpenRouter API error: ${lastErrorText || 'All vision candidate models failed.'}` },
        { status: 400 }
      );
    }

    const data = await openRouterResponse.json();

    // Save full raw response object to a local JSON file for debugging
    const debugFilePath = path.join(process.cwd(), 'ai_debug_response.json');
    try {
      fs.writeFileSync(
        debugFilePath,
        JSON.stringify(
          {
            timestamp: new Date().toISOString(),
            visionRawText,
            successfulModel,
            fullResponse: data,
          },
          null,
          2
        )
      );
    } catch (fsErr) {
      console.error('[AI 2-STEP PIPELINE] Failed to write debug log file:', fsErr);
    }

    const choiceMsg = data.choices?.[0]?.message;
    let rawContent = '';
    
    if (typeof choiceMsg?.content === 'string') {
      rawContent = choiceMsg.content;
    } else if (Array.isArray(choiceMsg?.content)) {
      rawContent = choiceMsg.content.map((c: any) => c.text || '').join('');
    }

    let cleanedJson = rawContent
      .replace(/<think>[\s\S]*?<\/think>/gi, '')
      .replace(/```json/gi, '')
      .replace(/```/g, '')
      .trim();

    const jsonMatch = cleanedJson.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedJson = jsonMatch[0];
    }

    let parsedParameters;
    try {
      parsedParameters = JSON.parse(cleanedJson);
      console.log('[AI 2-STEP PIPELINE] Step 2 Success! Final Parameters:', parsedParameters);
    } catch (parseErr) {
      console.error('[AI 2-STEP PIPELINE] Failed to parse AI output JSON. Raw Content was:', rawContent);
      return NextResponse.json(
        { error: `AI output was invalid JSON (${successfulModel}). Raw output: "${rawContent.substring(0, 200)}"` },
        { status: 422 }
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedParameters,
    });
  } catch (error: any) {
    console.error('[AI 2-STEP PIPELINE] Unhandled Error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze image with AI model' },
      { status: 500 }
    );
  }
}
