import { usePrPreviewStore } from "@/store/prPreview.store";
import { LuArrowLeft, LuFileCode, LuPlay } from "react-icons/lu";
import { useNavigate } from "react-router";

const MOCK_FILES = [
  {
    filename: "src/services/authService.ts",
    status: "modified",
    patch: `@@ -12,6 +12,14 @@ export async function login(email: string, password: string) {
-  const user = await db.user.findFirst({ where: { email } });
-  if (!user) throw new Error("User not found");
+  const user = await db.user.findFirst({
+    where: { email },
+    select: { id: true, email: true, passwordHash: true },
+  });
+
+  if (!user) throw new Error("Invalid credentials");
+
+  const valid = await bcrypt.compare(password, user.passwordHash);
+  if (!valid) throw new Error("Invalid credentials");
+
   return generateToken(user.id);`,
  },
  {
    filename: "src/routes/user.routes.ts",
    status: "added",
    patch: `@@ -0,0 +1,10 @@
+import { Router } from "express";
+import { userController } from "../controllers/user.controller.js";
+import { authMiddleware } from "../middleware/authMiddleware.js";
+
+const router = Router();
+
+router.get("/pulls", authMiddleware, userController.pulls);
+
+export default router;`,
  },
];

function statusBadge(status: string) {
  const map: Record<string, string> = {
    modified: "bg-yellow-500/10 text-yellow-600",
    added: "bg-emerald-500/10 text-emerald-600",
    removed: "bg-red-500/10 text-red-600",
  };
  return map[status] ?? "bg-bg-tertiary text-text-tertiary";
}

function renderPatch(patch: string) {
  return patch.split("\n").map((line, i) => {
    const isAdded = line.startsWith("+") && !line.startsWith("+++");
    const isRemoved = line.startsWith("-") && !line.startsWith("---");
    const isHunk = line.startsWith("@@");

    return (
      <div
        key={i}
        className={[
          "px-4 py-0.5 font-mono text-xs whitespace-pre",
          isAdded ? "bg-emerald-500/10 text-emerald-700" : "",
          isRemoved ? "bg-red-500/10 text-red-700" : "",
          isHunk ? "text-text-tertiary bg-bg-tertiary" : "",
          !isAdded && !isRemoved && !isHunk ? "text-text-secondary" : "",
        ].join(" ")}
      >
        {line}
      </div>
    );
  });
}

export default function ViewCode() {
  const navigate = useNavigate();
  const { prPreview } = usePrPreviewStore();

  console.log(prPreview);

  return (
    <main className="min-h-full bg-bg-secondary">
      <div className="max-w-5xl mx-auto px-4 py-12 md:py-8 flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors cursor-pointer"
          >
            <LuArrowLeft size={14} />
            Back
          </button>

          <button
            type="button"
            className="flex items-center gap-2 h-9 px-4 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors cursor-pointer"
          >
            <LuPlay size={13} />
            Run AI Analysis
          </button>
        </div>

        <div className="flex flex-col gap-1.5">
          <h1 className="text-2xl font-bold text-text-primary tracking-tight">
            Changed files
          </h1>
          <p className="text-sm text-text-secondary">
            {MOCK_FILES.length} file{MOCK_FILES.length !== 1 ? "s" : ""} changed
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {MOCK_FILES.map((file) => (
            <div
              key={file.filename}
              className="rounded-xl border border-border-subtle bg-bg-primary overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border-subtle">
                <LuFileCode size={14} className="text-text-tertiary shrink-0" />
                <span className="text-sm text-text-primary font-medium truncate flex-1">
                  {file.filename}
                </span>
                <span
                  className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${statusBadge(file.status)}`}
                >
                  {file.status}
                </span>
              </div>
              <div className="overflow-x-auto">{renderPatch(file.patch)}</div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
