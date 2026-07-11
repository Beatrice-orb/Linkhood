import { db, publicServiceImportResult } from './db.ts';

const result = publicServiceImportResult;
console.log(`Imported ${result.sources} sources, ${result.services} public services and ${result.activityMaterials} activity materials.`);
db.close();
