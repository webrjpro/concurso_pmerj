const fs = require('fs');
const path = require('path');

const files = [
  "app/api/plano/gerar/route.ts",
  "app/api/questoes/responder/route.ts",
  "app/api/redacao/corrigir/route.ts",
  "app/api/revisoes/flashcard/route.ts",
  "app/api/simulados/criar/route.ts",
  "lib/edital-map.ts",
  "lib/errors.ts",
  "lib/performance.ts",
  "lib/reviews.ts",
  "lib/simulations.ts",
  "lib/student-dashboard.ts",
  "lib/study-plan.ts"
];

for (const file of files) {
  const filePath = path.join(__dirname, file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  if (!content.includes('getCurrentUser')) {
    content = 'import { getCurrentUser } from "@/lib/auth";\n' + content;
  }
  
  // Remove demoEmail constant
  content = content.replace(/const demoEmail = ["'][^"']+["'];\n?/g, '');
  
  // Replace the where: { email: demoEmail } inside prisma calls
  // we first need to ensure we fetch the current user at the top of the function
  
  // Because the exact function names differ, the easiest robust way is to just 
  // replace `where: { email: demoEmail }` with `where: { id: (await getCurrentUser())?.id || "unauthorized" }`
  // That way we don't have to inject variable declarations into arbitrary scopes.
  // Actually, a cleaner way:
  // where: { email: demoEmail } -> where: { id: (await getCurrentUser())?.id || '' }
  
  content = content.replace(/where:\s*\{\s*email:\s*demoEmail\s*\}/g, 'where: { id: (await getCurrentUser())?.id || "" }');
  
  fs.writeFileSync(filePath, content);
  console.log("Refactored:", file);
}
