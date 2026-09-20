import { readdir, readFile } from "node:fs/promises";
import { extname, join, relative, resolve } from "node:path";

/**
 * Final secret scan of the content that is about to be committed to the
 * public repository.
 *
 * The private vault runs `audit-secrets.mjs` on everything; this script is the
 * second, independent gate that only looks at what will actually be published,
 * so a rule change in the private vault can never let a secret through by
 * itself. It blocks on every high *and* medium finding: content entering a
 * public git history must fail loudly rather than ask for review.
 *
 * Report output is always redacted to a prefix/suffix sample: never print a
 * full candidate secret, not even a test one.
 */

const markdownExtensions = new Set([".md", ".mdx"]);

const patterns = [
	{
		id: "openai-sk",
		re: /\bsk-[A-Za-z0-9]{20,}\b/g,
		severity: "high" as const,
	},
	{
		id: "github-pat",
		re: /\b(?:ghp|github_pat)_[A-Za-z0-9_]{20,}\b/g,
		severity: "high" as const,
	},
	{
		id: "private-key",
		re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g,
		severity: "high" as const,
	},
	{
		id: "aws-access-key",
		re: /\bAKIA[0-9A-Z]{16}\b/g,
		severity: "high" as const,
	},
	{
		id: "slack-token",
		re: /\bxoxb-[0-9]{10,}-[0-9]{10,}-[A-Za-z0-9]{20,}\b/g,
		severity: "high" as const,
	},
	{
		id: "bearer-token",
		re: /\bBearer\s+[A-Za-z0-9._-]{20,}\b/gi,
		severity: "medium" as const,
	},
	{
		id: "assignment-secret",
		re: /(?:api[_-]?key|token|secret|password|passwd|client_secret|access[_-]?key)\s*[:=]\s*['"][^'"\s]{12,}['"]/gi,
		severity: "medium" as const,
	},
	{
		id: "jwt",
		re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
		severity: "medium" as const,
	},
];

type Finding = {
	file: string;
	line: number;
	id: string;
	severity: "high" | "medium";
	sample: string;
};

/**
 * Placeholders such as `<TOKEN>` or `<your-api-key>` are safe to publish and
 * must never block a sync. This allowlist matches a candidate secret only when
 * it is entirely composed of placeholder characters.
 */
const placeholderPattern = /^[<>\s*]+|[<>\s*]+$/g;

function isPlaceholder(value: string): boolean {
	const stripped = value.replace(placeholderPattern, "");
	return stripped.length === 0;
}

function redact(value: string): string {
	if (value.length <= 8) return "<REDACTED>";
	return (
		value.slice(0, 3) + "***" + value.slice(-2) + " (len=" + value.length + ")"
	);
}

async function collectFiles(root: string, current = root): Promise<string[]> {
	const entries = await readdir(current, { withFileTypes: true });
	entries.sort((left, right) => left.name.localeCompare(right.name));
	const files: string[] = [];

	for (const entry of entries) {
		const fullPath = join(current, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectFiles(root, fullPath)));
		} else if (markdownExtensions.has(extname(entry.name).toLowerCase())) {
			files.push(fullPath);
		}
	}

	return files;
}

function parseArgs(args: string[]): string {
	let output = "";

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		switch (arg) {
			case "--output":
				output = args[index + 1] ?? "";
				index += 1;
				break;
			case "--help":
				console.log(
					[
						"Usage:",
						"  pnpm tsx scripts/audit-synced-content.ts --output <posts-dir>",
						"",
						"Scans the synced public content directory for high and medium",
						"secret patterns. Any finding fails the run. Placeholders such as",
						"<TOKEN> are allowed. Findings are printed redacted only.",
					].join("\n"),
				);
				process.exit(0);
		}
	}

	if (!output) {
		throw new Error("--output is required.");
	}

	return resolve(output);
}

async function scan(outputPath: string): Promise<Finding[]> {
	const findings: Finding[] = [];

	for (const file of await collectFiles(outputPath)) {
		const relativePath = relative(outputPath, file).replaceAll("\\", "/");
		const text = await readFile(file, "utf8");
		const lines = text.split(/\r?\n/);

		for (let index = 0; index < lines.length; index += 1) {
			const line = lines[index];
			for (const pattern of patterns) {
				pattern.re.lastIndex = 0;
				const matches = line.match(pattern.re);
				if (!matches) continue;

				for (const match of matches) {
					if (isPlaceholder(match)) continue;
					findings.push({
						file: relativePath,
						line: index + 1,
						id: pattern.id,
						severity: pattern.severity,
						sample: redact(match),
					});
				}
			}
		}
	}

	return findings;
}

const outputPath = parseArgs(process.argv.slice(2));
const findings = await scan(outputPath);

if (findings.length === 0) {
	console.log("audit-synced-content: no secret candidates in synced content.");
	process.exit(0);
}

for (const finding of findings) {
	console.error(
		`[ERROR] ${finding.file}:${finding.line} ${finding.id} sample=${finding.sample}`,
	);
}

console.error(
	`audit-synced-content: ${findings.length} finding(s) in synced content. ` +
		"High and medium findings both block publication; fix the source note in yyq-firefly-private.",
);
process.exit(1);
