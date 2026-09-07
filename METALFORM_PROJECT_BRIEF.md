# Parametal --- Project Brief

## 1. What We Are Building

Parametal is a browser-based, installable PWA for designing real
physical objects from a modular sheet-metal construction system.

The core idea is:

> **Choose an object → customize its parametric geometry → generate its
> metal panels → validate fabrication → export fabrication files →
> physically manufacture and assemble the object.**

This is **not** a generic 3D modeling application and it is **not**
simply a collection of pre-made 3D models.

The product is a specialized parametric design and fabrication tool.

------------------------------------------------------------------------

# 2. The Reference Construction System

The uploaded reference photographs are the primary visual reference for
the construction language.

The important prototype is a modular object made from:

-   Thin sheet-metal panels
-   Curved/shaped panel edges
-   Separate top/bottom/side panels
-   Holes near panel edges
-   Mechanical L-brackets
-   Bolts, nuts and washers
-   Visible mechanical connections
-   Repetition of the same construction logic

The reference object should be understood as the **construction
system**, not as a fixed final product.

The software should reproduce the logic of this system digitally.

## Core design DNA

**RIGID EDGES / CONNECTIONS → CURVED SHEET-METAL SKINS → MECHANICAL
JOINERY → REPETITION**

The system should feel physical, modular and fabricatable.

------------------------------------------------------------------------

# 3. Important Material Clarification

Do not hard-code the entire application around "GI" unless the material
is explicitly selected.

The reference images show sheet-metal construction, but the exact metal
grade cannot be established from the photographs alone.

The application should therefore use a generic concept of:

**Sheet Metal**

with material options later such as:

-   Galvanized steel (GI)
-   Mild steel
-   Aluminum
-   Custom material

Thickness should be parameterized.

Initial example values:

-   0.8 mm
-   1.0 mm
-   1.2 mm
-   1.5 mm
-   Custom

Default prototype thickness: **1.0 mm**

------------------------------------------------------------------------

# 4. The Six Object Categories

The application will eventually provide six major object families:

1.  **Seating**
2.  **Table**
3.  **Light**
4.  **Storage**
5.  **Partition**
6.  **Wall-mounted object**

These are NOT six unrelated products.

They are six applications/templates built on top of the same underlying
sheet-metal construction engine.

Conceptually:

``` text
                 Parametal CORE ENGINE
                         |
          +--------------+--------------+
          |              |              |
       SEATING         TABLE          LIGHT
          |              |              |
       STORAGE       PARTITION    WALL-MOUNTED
```

Each object family should reuse the same fundamental concepts:

-   Parametric dimensions
-   Curved panels
-   Control points
-   Symmetry
-   Stretch/deformation
-   Mechanical joinery
-   Panel generation
-   Fabrication validation
-   2D development
-   Export

------------------------------------------------------------------------

# 5. Priority:  LAMP

The **Light/Lamp is the first product to implement**.

Do NOT start by implementing all six object categories.

Do NOT start by implementing the cube as a final product.

Use the reference construction system as the foundation and build the
lamp as the first real application.

The lamp reference contains:

-   A large curved vertical sheet-metal body
-   A sculptural asymmetric canopy
-   A light source underneath/inside the canopy
-   Strong curvature
-   A continuous relationship between body and canopy
-   Sheet-metal construction language

The lamp should be procedural.

## Important

Do NOT use a downloaded lamp `.glb` as the main model.

The lamp geometry must be generated from parameters so the user can
change its dimensions and curvature.

------------------------------------------------------------------------

# 6. Lamp Geometry

The coordinate system is:

-   **X = left/right**
-   **Y = front/back**
-   **Z = height**

The initial canopy design coordinates are design/reference coordinates,
not measurements extracted from the photograph.

## Canopy master points

``` text
C1 = (-350, 0, 1260)
C2 = (-270, 0, 1230)
C3 = (-115, 0, 1200)
C4 = (   0, 0, 1325)
C5 = ( 115, 0, 1200)
C6 = ( 270, 0, 1170)
C7 = ( 350, 0, 1115)
```

## Front edge

``` text
F1 = (-350, 225, 1205)
F2 = (-175, 225, 1215)
F3 = (   0, 225, 1260)
F4 = ( 175, 225, 1190)
F5 = ( 350, 225, 1075)
```

## Back edge

``` text
B1 = (-350,-225,1280)
B2 = (-175,-225,1260)
B3 = (   0,-225,1340)
B4 = ( 175,-225,1210)
B5 = ( 350,-225,1150)
```

## Initial canopy dimensions

-   Width: approximately 700 mm
-   Depth: approximately 450 mm

The canopy should use smooth continuous curves/surfaces rather than
visually connecting control points with straight rigid segments.

------------------------------------------------------------------------

# 7. Lamp Parametric Controls

The user should eventually be able to control:

## Overall dimensions

-   Lamp height
-   Body width
-   Body depth
-   Canopy width
-   Canopy depth

## Canopy shape

-   Left tip height
-   Right tip height
-   Center height
-   Curve depth
-   Curve radius
-   Front curvature
-   Back curvature
-   Left curvature
-   Right curvature
-   Corner radius

The left and right sides should be allowed to be asymmetric.

## Material

-   Material type
-   Sheet thickness

## Lighting

Eventually:

-   Light intensity
-   Color temperature
-   Light direction
-   Beam angle
-   Light source position

The initial implementation can use a simple Three.js light.

------------------------------------------------------------------------

# 8. What "Parametric" Means Here

A static 3D model is NOT sufficient.

For example, if the user changes:

``` text
Canopy Width
700 mm → 900 mm
```

the actual canopy geometry must be regenerated from the new parameters.

If:

``` text
Center Height
1325 mm → 1400 mm
```

the center of the canopy must actually move.

If:

``` text
Curve Depth
50 mm → 150 mm
```

the surface must become visibly more curved.

Do not simply scale or distort a finished imported mesh.

The intended architecture is:

``` text
USER PARAMETERS
       ↓
GEOMETRY ENGINE
       ↓
CONTROL POINTS
       ↓
CURVES / SURFACE
       ↓
MESH
       ↓
THREE.JS VIEWPORT
```

------------------------------------------------------------------------

# 9. Direct 3D Manipulation

After numerical controls work, the application should support direct
manipulation.

Important canopy control points should be visible as handles.

Example:

``` text
                ●
               C4
              /  \
             /    \
        ●---/------\---●
       C1              C7
```

The user should be able to drag a control point in 3D.

The flow is:

``` text
Drag control point
       ↓
Update parameter/control point
       ↓
Regenerate geometry
       ↓
Update mesh
       ↓
Update connected geometry
```

The geometry should remain coherent.

------------------------------------------------------------------------

# 10. Lamp Body

After the canopy is working, build the vertical body procedurally.

The body should be a curved sheet-metal form rather than a generic
cylinder or imported mesh.

It should have parameters for:

-   Height
-   Width
-   Depth
-   Bottom width
-   Top width
-   Vertical curvature
-   Side curvature

The final lamp is:

``` text
CURVED CANOPY
      +
CURVED BODY
      +
LIGHT SOURCE
```

------------------------------------------------------------------------

# 11. Joinery System

Joinery is a core part of the product.

The reference images clearly show mechanical connections.

The application should eventually represent:

-   L-brackets
-   Bolts
-   Nuts
-   Washers
-   Connection holes

The connection system should be driven by geometry.

For example:

``` text
PANEL A
   |
L-BRACKET
   |
BOLT + WASHER + NUT
   |
PANEL B
```

When a panel changes shape or dimensions, its connection points should
update accordingly.

For the first prototype, simple procedural Three.js geometry is enough.

There is no need to download detailed hardware models initially.

------------------------------------------------------------------------

# 12. 3D Viewer

The main application is a desktop-first 3D design studio that also works
as a responsive PWA.

Recommended technology:

-   Next.js
-   React
-   TypeScript
-   React Three Fiber
-   Three.js
-   Drei
-   Tailwind CSS

The main desktop layout should have:

``` text
+-----------------------------------------------------------+
| Parametal                           Save       Export      |
+----------------+---------------------------+--------------+
|                |                           |              |
| PARAMETERS     |                           | PROPERTIES   |
|                |                           |              |
| Dimensions     |        3D VIEWPORT         | Components   |
| Curvature      |                           | Material     |
| Material       |         LAMP              | Joinery      |
| Lighting       |                           |              |
|                |                           |              |
+----------------+---------------------------+--------------+
```

The desktop experience is the primary full editor.

Mobile should not be treated as a separate product.

The same PWA should provide a responsive/mobile experience for:

-   Viewing models
-   Basic parameter editing
-   Saving
-   Sharing
-   Basic design interaction

The full fabrication editor is expected to be much more comfortable on
desktop.

------------------------------------------------------------------------

# 13. Reference Images vs 3D Assets

The reference images are useful as visual/design references and can be
stored in:

``` text
public/images/references/
```

Do NOT use the reference photographs as the actual 3D model.

The main geometry should be generated procedurally.

Initially, the project does not require downloaded `.glb`, `.fbx`, or
`.obj` models for the lamp.

Simple components such as bolts and brackets can also be generated
procedurally.

Optional high-detail hardware models can be introduced later.

------------------------------------------------------------------------

# 14. Geometry Architecture

Keep geometry calculations separate from React components.

Recommended separation:

``` text
src/
├── geometry/
│   ├── curves.ts
│   ├── panels.ts
│   ├── lamp.ts
│   ├── module.ts
│   └── transforms.ts
│
├── components/
│   ├── editor/
│   ├── scene/
│   └── ui/
│
├── fabrication/
│   ├── unfold.ts
│   ├── holes.ts
│   ├── validation.ts
│   └── export.ts
│
├── store/
│   └── designStore.ts
│
└── types/
    └── design.ts
```

React components should render and interact with the geometry engine.

They should not contain the entire geometry algorithm.

The intended flow is:

``` text
UI
 ↓
Design State
 ↓
Geometry Engine
 ↓
Generated Geometry
 ↓
React Three Fiber
```

------------------------------------------------------------------------

# 15. Fabrication System --- Later Phase

The final application should eventually move beyond 3D visualization.

A designed object should be decomposable into physical panels.

For example:

``` text
3D LAMP
   ↓
BODY PANEL
CANOPY PANEL
SIDE PANEL
OTHER PANELS
   ↓
2D DEVELOPMENT
   ↓
FABRICATION CHECK
   ↓
SVG / DXF / PDF
```

The 2D output should eventually contain:

-   Outer profile
-   Holes
-   Dimensions
-   Panel labels
-   Material
-   Thickness
-   Bend/fold information where applicable
-   1:1 mm scale

Do not implement this during the first geometry milestone.

------------------------------------------------------------------------

# 16. Fabrication Validation --- Later Phase

The application should eventually detect issues such as:

-   Hole too close to edge
-   Hole spacing violations
-   Sheet boundary violations
-   Self-intersections
-   Overlapping geometry
-   Impossible geometry
-   Sharp/problematic corners
-   Duplicate holes
-   Missing connections
-   Invalid panel dimensions

Warnings should visually highlight the relevant geometry.

Only mathematically invalid geometry should block export.

------------------------------------------------------------------------

# 17. Export --- Later Phase

Eventually support:

-   SVG
-   DXF
-   PDF

The exported files should represent actual generated panel geometry
rather than screenshots of the 3D viewport.

------------------------------------------------------------------------

# 18. Development Strategy

Build the product incrementally.

## Phase 1 --- Lamp canopy

Build:

-   Procedural canopy
-   Initial control points
-   Smooth surface
-   Three.js rendering
-   Basic dimensions
-   Curve parameters

Success condition:

> The canopy looks visually similar in construction language to the
> reference and changes correctly when parameters change.

## Phase 2 --- Direct manipulation

Add:

-   Visible control points
-   Dragging
-   XYZ movement
-   Real-time geometry regeneration

## Phase 3 --- Lamp body

Add:

-   Procedural curved body
-   Body parameters
-   Canopy/body relationship

## Phase 4 --- Lighting

Add:

-   Light source
-   Basic illumination
-   Lighting controls

## Phase 5 --- Joinery

Add:

-   Brackets
-   Bolts
-   Washers
-   Nuts
-   Connection holes

## Phase 6 --- Panel system

Make the lamp explicitly composed of fabrication panels.

## Phase 7 --- 2D development

Generate flat panel previews.

## Phase 8 --- Fabrication validation

Implement manufacturing checks.

## Phase 9 --- Export

Implement SVG/DXF/PDF.

## Phase 10 --- Other object templates

Add:

-   Seating
-   Table
-   Storage
-   Partition
-   Wall-mounted object

All should reuse the same core engine.

------------------------------------------------------------------------

# 19. What NOT to Build Yet

Do not spend early development time on:

-   Authentication
-   User accounts
-   Payments
-   Marketplace
-   AI features
-   Social features
-   Complex dashboard
-   All six object categories
-   Full CAD functionality
-   Advanced fabrication algorithms
-   Detailed hardware asset libraries

The first proof of the product is the **working parametric lamp**.

------------------------------------------------------------------------

# 20. First Technical Milestone

The first meaningful version should do exactly this:

``` text
Open /studio
      ↓
See procedural lamp canopy
      ↓
Change canopy width
      ↓
Geometry changes
      ↓
Change canopy depth
      ↓
Geometry changes
      ↓
Change center height
      ↓
Center moves
      ↓
Change curve depth
      ↓
Curvature changes
      ↓
Drag a control point
      ↓
Surface regenerates
```

If this works smoothly, the core concept is proven.

Only then should additional systems be layered on top.

------------------------------------------------------------------------

# 21. Product Philosophy

The most important principle:

> **We are not building a generic 3D editor. We are building a
> specialized parametric construction system for real sheet-metal
> objects.**

The software should always prioritize:

1.  Physical plausibility
2.  Parametric control
3.  Curvature
4.  Mechanical construction
5.  Fabrication readiness
6.  Clear visual feedback
7.  Simplicity for the user

Avoid turning the interface into a generic CAD application full of
unnecessary tools.

The user should feel:

> **"I choose a real object, shape it, understand how it is constructed,
> and get the files needed to make it."**

------------------------------------------------------------------------

# 22. Current Goal for the Coding Agent

For the first implementation task, focus ONLY on:

**A procedural curved lamp canopy rendered in React Three Fiber with
parameter-driven geometry.**

Do not implement:

-   DXF
-   SVG
-   PDF
-   Backend
-   Authentication
-   Database
-   Six object categories
-   Marketplace
-   AI
-   Complex fabrication validation

First prove the geometry.

The next implementation task after that should be determined by testing
the actual result visually.
