import { mkdir, readdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import {
	dirname,
	extname,
	isAbsolute,
	join,
	relative,
	resolve,
} from "node:path";
import matter from "gray-matter";

const markdownExtensions = new Set([".md", ".mdx"]);
const ignoredDirectories = new Set([
	".git",
	".obsidian",
	".vscode",
	".claude",
	".planning",
	"00-Inbox",
	"10-Sources",
	"80-Templates",
	"90-AI",
	"_assets-private",
	"_private",
	"docs",
	"dist",
	"node_modules",
	"preview",
	"scripts",
	"tmp",
]);
const ignoredFiles = new Set([
	"agents.md",
	"ai-rules.md",
	"claude.md",
	"readme.md",
]);

type SyncOptions = {
	source: string;
	output: string;
	dryRun: boolean;
	prune: boolean;
	manifest: string;
};

type SyncManifest = {
	version: 1;
	files: string[];
};

function printUsage(): void {
	console.log(
		[
			"Usage:",
			"  pnpm sync:published -- --source <private-content-dir> [options]",
			"",
			"Options:",
			"  --source <path>  Source directory containing private Markdown/MDX content.",
			"  --output <path>  Firefly content directory (default: src/content/posts).",
			"  --dry-run        Show only files with publish: true without writing files.",
			"  --prune          Remove files from the previous sync manifest when unpublished.",
			"  --manifest <path> Manifest path (default: <output>/.private-content-sync.json).",
			"  --help           Show this help.",
			"",
			"Source contract:",
			"  publish: true  -> sync as draft: false",
			"  publish: false -> skip",
			"  missing publish -> skip",
			"",
			"Only Markdown/MDX files with strict publish: true are synchronized.",
			"The publish field is removed from the Firefly output. Without --prune,",
			"existing files are never deleted; --prune removes only manifest entries.",
		].join("\n"),
	);
}

function readOption(args: string[], index: number, option: string): string {
	const value = args[index + 1];
	if (!value || value.startsWith("--")) {
		throw new Error(option + " requires a path value.");
	}
	return value;
}

function parseOptions(args: string[]): SyncOptions | null {
	let source = "";
	let output = "src/content/posts";
	let dryRun = false;
	let prune = false;
	let manifest = "";

	for (let index = 0; index < args.length; index += 1) {
		const arg = args[index];
		switch (arg) {
			case "--":
				break;
			case "--help":
				printUsage();
				return null;
			case "--dry-run":
				dryRun = true;
				break;
			case "--prune":
				prune = true;
				break;
			case "--source":
				source = readOption(args, index, "--source");
				index += 1;
				break;
			case "--output":
				output = readOption(args, index, "--output");
				index += 1;
				break;
			case "--manifest":
				manifest = readOption(args, index, "--manifest");
				index += 1;
				break;
			default:
				throw new Error("Unknown option: " + arg);
		}
	}

	if (!source) {
		throw new Error("--source is required.");
	}

	const outputPath = resolve(output);

	return {
		source: resolve(source),
		output: outputPath,
		dryRun,
		prune,
		manifest: resolve(manifest || join(outputPath, ".private-content-sync.json")),
	};
}

function isPathInside(parent: string, child: string): boolean {
	const relativePath = relative(parent, child);
	return (
		relativePath !== "" &&
		!relativePath.startsWith("..") &&
		!isAbsolute(relativePath)
	);
}

function toManifestPath(filePath: string): string {
	return filePath.replaceAll("\\", "/");
}

function validateManifestPath(filePath: string): string {
	const normalized = toManifestPath(filePath);
	if (
		!normalized ||
		normalized.startsWith("/") ||
		normalized.split("/").includes("..")
	) {
		throw new Error("Invalid sync manifest path: " + filePath);
	}
	return normalized;
}

async function readSyncManifest(
	manifestPath: string,
	outputPath: string,
): Promise<string[]> {
	let raw: string;
	try {
		raw = await readFile(manifestPath, "utf8");
	} catch (error) {
		if (error instanceof Error && "code" in error && error.code === "ENOENT") {
			return [];
		}
		throw error;
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(raw);
	} catch {
		throw new Error("Sync manifest is not valid JSON: " + manifestPath);
	}

	if (
		typeof parsed !== "object" ||
		parsed === null ||
		!("version" in parsed) ||
		parsed.version !== 1 ||
		!("files" in parsed) ||
		!Array.isArray(parsed.files)
	) {
		throw new Error("Sync manifest has an unsupported format: " + manifestPath);
	}

	return [
		...new Set(
			parsed.files.map((filePath) => {
				if (typeof filePath !== "string") {
					throw new Error("Sync manifest contains a non-string path.");
				}
				const normalized = validateManifestPath(filePath);
				const targetPath = resolve(outputPath, normalized);
				if (!isPathInside(outputPath, targetPath)) {
					throw new Error("Sync manifest path escapes output: " + filePath);
				}
				return normalized;
			}),
		),
	];
}

async function writeSyncManifest(
	manifestPath: string,
	files: Set<string>,
): Promise<void> {
	const manifest: SyncManifest = {
		version: 1,
		files: [...files].sort(),
	};
	await mkdir(dirname(manifestPath), { recursive: true });
	await writeFile(manifestPath, JSON.stringify(manifest, null, "\t") + "\n");
}

async function pruneStaleFiles(
	outputPath: string,
	previousFiles: string[],
	currentFiles: Set<string>,
): Promise<void> {
	for (const filePath of previousFiles) {
		if (currentFiles.has(filePath)) {
			continue;
		}

		const targetPath = resolve(outputPath, filePath);
		if (!isPathInside(outputPath, targetPath)) {
			throw new Error("Refusing to prune a path outside output: " + filePath);
		}

		await rm(targetPath, { force: true });
		console.log("[prune] unpublished: " + filePath);
	}
}

async function collectFiles(root: string, current = root): Promise<string[]> {
	const entries = await readdir(current, { withFileTypes: true });
	entries.sort((left, right) => left.name.localeCompare(right.name));
	const files: string[] = [];

	for (const entry of entries) {
		if (entry.isDirectory() && ignoredDirectories.has(entry.name)) {
			continue;
		}
		if (
			entry.isFile() &&
			ignoredFiles.has(entry.name.toLowerCase())
		) {
			continue;
		}

		const fullPath = resolve(current, entry.name);
		if (entry.isDirectory()) {
			files.push(...(await collectFiles(root, fullPath)));
		} else if (entry.isFile()) {
			files.push(fullPath);
		}
	}

	return files;
}

function parseDate(value: unknown): Date | undefined {
	if (value instanceof Date) {
		if (Number.isNaN(value.valueOf())) {
			return undefined;
		}
		return value;
	}

	if (typeof value === "string" && value.trim()) {
		const parsed = new Date(value);
		if (!Number.isNaN(parsed.valueOf())) {
			return parsed;
		}
	}

	return undefined;
}

function transformMarkdown(
	source: string,
	relativePath: string,
	fallbackDate: Date,
): { content: string } | null {
	const parsed = matter(source);
	const data = { ...parsed.data } as Record<string, unknown>;

	if ("publish" in data && typeof data.publish !== "boolean") {
		throw new Error(relativePath + ": publish must be a boolean.");
	}
	if (data.publish !== true) {
		return null;
	}

	const published =
		parseDate(data.published) ??
		parseDate(data.date) ??
		parseDate(data.created) ??
		parseDate(data.updated) ??
		parseDate(fallbackDate);
	if (!published) {
		throw new Error(
			relativePath +
				": published content needs a valid published, date, created, or updated field.",
		);
	}

	if ("updated" in data && data.updated !== undefined) {
		const updated = parseDate(data.updated);
		if (!updated) {
			throw new Error(relativePath + ": updated must be a valid date.");
		}
		data.updated = updated;
	}

	data.published = published;
	data.draft = false;
	delete data.publish;
	delete data.date;
	delete data.created;

	if (typeof data.type === "string" && !data.category) {
		data.category = data.type;
	}
	delete data.type;
	delete data.status;

	return {
		content: matter.stringify(parsed.content, data),
	};
}

async function syncContent(options: SyncOptions): Promise<void> {
	if (options.source === options.output) {
		throw new Error("--source and --output must be different directories.");
	}
	if (isPathInside(options.source, options.output)) {
		throw new Error("--output must not be inside --source.");
	}
	if (
		options.manifest === options.source ||
		isPathInside(options.source, options.manifest)
	) {
		throw new Error("--manifest must not be inside --source.");
	}

	const files = await collectFiles(options.source);
	let markdownCount = 0;
	let publishedCount = 0;
	let skippedMarkdownCount = 0;
	let skippedCount = 0;
	const currentFiles = new Set<string>();
	const pendingWrites: Array<{
		content: string;
		outputPath: string;
		relativePath: string;
	}> = [];
	const previousFiles =
		!options.dryRun && options.prune
			? await readSyncManifest(options.manifest, options.output)
			: [];

	if (!options.dryRun) {
		await mkdir(options.output, { recursive: true });
	}

	for (const sourcePath of files) {
		const relativePath = relative(options.source, sourcePath);
		const extension = extname(sourcePath).toLowerCase();

		if (!markdownExtensions.has(extension)) {
			skippedCount += 1;
			console.log("[skip] non-markdown: " + relativePath);
			continue;
		}

		const sourceContent = await readFile(sourcePath, "utf8");
		const sourceStats = await stat(sourcePath);
		const transformed = transformMarkdown(
			sourceContent,
			relativePath,
			sourceStats.mtime,
		);
		markdownCount += 1;

		if (!transformed) {
			skippedMarkdownCount += 1;
			skippedCount += 1;
			console.log("[skip] unpublished: " + relativePath);
			continue;
		}

		const outputPath = resolve(options.output, relativePath);
		const manifestPath = validateManifestPath(relativePath);
		publishedCount += 1;
		currentFiles.add(manifestPath);
		console.log(
			(options.dryRun ? "[dry-run]" : "[sync]") +
				" published: " +
				relativePath,
		);

		if (!options.dryRun) {
			pendingWrites.push({
				content: transformed.content,
				outputPath,
				relativePath,
			});
		}
	}

	if (!options.dryRun) {
		for (const pendingWrite of pendingWrites) {
			await mkdir(dirname(pendingWrite.outputPath), { recursive: true });
			await writeFile(pendingWrite.outputPath, pendingWrite.content);
		}
		if (options.prune) {
			await pruneStaleFiles(options.output, previousFiles, currentFiles);
			await writeSyncManifest(options.manifest, currentFiles);
		}
	}

	console.log(
		(options.dryRun ? "Would sync " : "Synced ") +
			publishedCount +
			" published Markdown/MDX files. Scanned " +
			markdownCount +
			" Markdown/MDX (" +
			skippedMarkdownCount +
			" unpublished) and skipped " +
			skippedCount +
			" files total.",
	);
}

try {
	const options = parseOptions(process.argv.slice(2));
	if (options) {
		await syncContent(options);
	}
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exitCode = 1;
}
