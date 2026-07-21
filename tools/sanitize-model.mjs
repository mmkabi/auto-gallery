import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { prune } from '@gltf-transform/functions';
import { MeshoptDecoder, MeshoptEncoder } from 'meshoptimizer';

const input = path.resolve(process.argv[2] || 'artifacts/competition/model-final-sanitized.glb');
const output = path.resolve(process.argv[3] || 'artifacts/competition/model-sanitized.glb');

await MeshoptDecoder.ready;
await MeshoptEncoder.ready;

const io = new NodeIO()
  .registerExtensions(ALL_EXTENSIONS)
  .registerDependencies({
    'meshopt.decoder': MeshoptDecoder,
    'meshopt.encoder': MeshoptEncoder,
  });

const document = await io.read(input);
const texturedBodyMaterial = document
  .getRoot()
  .listMaterials()
  .find((material) => material.getName() === 'CarBodyTextured');

if (!texturedBodyMaterial) {
  throw new Error('Expected CarBodyTextured material was not found.');
}

// This source decal is not part of the neutral competition identity. Other
// cabin, trim, glass, and wheel textures remain untouched.
texturedBodyMaterial.setBaseColorTexture(null);
texturedBodyMaterial.setNormalTexture(null);
await document.transform(prune());
await io.write(output, document);

console.log(`Sanitized model written to ${output}`);
