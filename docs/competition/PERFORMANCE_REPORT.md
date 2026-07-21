# Performance Report

## Verified Asset Pipeline

| Metric | Baseline | Competition build |
| --- | ---: | ---: |
| Primary format | Raw OBJ plus MTL and external textures | glTF plus external JPEG textures |
| Deployable model package | 86,555,710 source bytes | 14,410,619 bytes |
| Geometry payload | 67,217,229 bytes | 7,305,000-byte Meshopt buffer |
| Approximate source triangles | 474,676 | 474,623 at runtime |
| Interaction groups | 22 | 22 names preserved |
| Materials | 47 | 47 names preserved |

The production package is approximately 78.6% smaller than the raw OBJ file alone and 83.4% smaller than the combined raw OBJ and source texture bytes. The pipeline uses standard external JPEG textures, Meshopt compression, and mesh quantization. External textures avoid runtime `blob:` decoding failures observed with the embedded WebP GLB. One source decal texture was removed from the neutral competition asset; the remaining 14 optimized textures retain cabin, wheel, and trim detail. A sanitized GLB rollback remains outside `public`.

## Validation

glTF validation reported no errors. Remaining warnings concern generated tangent space, source texture coordinates, and inherited non-power-of-two dimensions. The production manifest exposes `EXT_meshopt_compression` and `KHR_mesh_quantization`; it does not require an experimental image format.

## Runtime Controls

- Performance, Balanced, and Quality presets.
- Conservative Performance default for the 474k-triangle asset, with adaptive pixel ratio and explicit higher-quality modes.
- Adaptive device pixel ratio from 0.78 to 1.4.
- Shadows disabled in Performance mode; layered non-shadow-casting lights preserve the black body profile.
- Hotspot projection throttled by quality mode.
- Concept animation updates reduced in Performance mode.
- Render work pauses while the document is hidden.
- ResizeObserver-based renderer sizing.
- WebGL context loss status and recovery guidance.
- Three.js cleanup and material/geometry disposal on unmount.
- Static deployment copies built assets and models into `dist`; host-level immutable caching can be configured by the owner after deployment.

## Build Measurements

Baseline production build on this workstation:

- 35 modules
- 4.34 seconds
- Application JavaScript: 788.86 kB, 216.49 kB gzip
- CSS: 15.26 kB, 3.61 kB gzip

Final verified competition build:

- 43 modules
- 1.60 seconds
- Application JavaScript: 337.28 kB, 103.97 kB gzip
- React chunk: 11.21 kB, 4.03 kB gzip
- Three.js chunk: 540.94 kB, 138.21 kB gzip
- CSS: 18.01 kB, 4.17 kB gzip

The Three.js chunk is intentionally separated and the Vite warning threshold is documented at 600 kB.

## Browser Evidence

The optimized model loaded locally in the in-app browser with 185 source render primitives, 47 unique source materials, and 474,623 triangles. The 185 render primitives are glTF material splits under the preserved 22 interaction groups. Door groups were visually verified to open and close as complete sets after rigging the parent groups rather than one primitive. The final 1366x768 production load produced no browser warnings or errors. A warm localhost diagnostic reported a 149 ms model load and Performance-mode DPR 0.78; this is not a network benchmark. Background browser automation throttled `requestAnimationFrame`, so its FPS number is not used as a performance claim.

The original raw OBJ cold load exceeded the browser automation wait window during baseline inspection. Localhost warm-load timing is not treated as a network benchmark.

## Unverified Targets

The following require a controlled device and network lab and are not claimed as passed:

- First vehicle interaction within eight seconds on a 20 Mbps cold connection.
- Sustained 45 FPS on a representative mid-range laptop in Balanced mode.
- Sustained 30 FPS on a representative mid-range mobile device in Performance mode.
- Memory stability during a long multi-tour session.
- Fresh 1920x1080 and 390x844 captures after the last neutralization-only asset pass; the responsive layouts were inspected earlier, but final capture control was unavailable.

Record hardware, browser version, cache state, throttling profile, FPS, and memory before making competition performance claims.
