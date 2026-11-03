DERZKO. 11.1 — Crystal Material

Upload all files to the root of the GitHub Pages repository, replacing the previous versions.

Only the 3D ribbon renderer (living-crystal.js) and its cache version in index.html were changed. The existing moving mesh is retained. The glass now uses lighter base color, high transmission, wine-colored attenuation, lower lighting intensity, and stronger twist.

Note: transmission over a transparent WebGL canvas may differ across iOS/Safari GPU versions. This is a physically inspired realtime approximation, not offline path tracing. The static PNG remains as a fallback if the module fails or reduced motion is enabled.
