import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { test } from "node:test";
import { fileURLToPath } from "node:url";
import matter from "gray-matter";

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const title = "Cloudflare Tunnel SSH：保留 Windows SSH 与 KeePassXC 的使用习惯";
const titleAnchor =
	"cloudflare-tunnel-ssh保留-windows-ssh-与-keepassxc-的使用习惯";

test("published sync removes only the leading duplicate title and preserves its anchor", async (t) => {
	const fixtureRoot = await mkdtemp(join(tmpdir(), "firefly-sync-title-"));
	const source = join(fixtureRoot, "source");
	const output = join(fixtureRoot, "output");
	t.after(async () => {
		assert.equal(dirname(fixtureRoot), resolve(tmpdir()));
		await rm(fixtureRoot, { recursive: true, force: true });
	});
	await mkdir(source, { recursive: true });

	const cases = [
		{
			name: "atx",
			body: `\n# ${title}\n\nIntro.\n\n## Section\n\n[Title](#${titleAnchor})\n`,
			strip: true,
		},
		{
			name: "closing-marker",
			body: `\n# ${title} ###\n\nIntro.\n`,
			strip: true,
		},
		{ name: "setext", body: `\n${title}\n===\n\nIntro.\n`, strip: true },
		{
			name: "mdx",
			extension: "mdx",
			body: `\n# ${title}\n\n<Component />\n`,
			strip: true,
		},
		{ name: "crlf", body: `\r\n# ${title}\r\n\r\nIntro.\r\n`, strip: true },
		{
			name: "different-title",
			body: "\n# A different heading\n\nIntro.\n",
			strip: false,
		},
		{ name: "h2", body: `\n## ${title}\n\nIntro.\n`, strip: false },
		{ name: "no-heading", body: "\nIntro.\n\n## Section\n", strip: false },
		{ name: "later-heading", body: `\nIntro.\n\n# ${title}\n`, strip: false },
		{
			name: "fenced-code",
			body: `\n\`\`\`md\n# ${title}\n\`\`\`\n`,
			strip: false,
		},
		{ name: "indented-code", body: `\n    # ${title}\n`, strip: false },
		{
			name: "indented-setext",
			body: `\n    ${title}\n    ===\n`,
			strip: false,
		},
		{ name: "quoted-heading", body: `\n> # ${title}\n`, strip: false },
	];

	for (const item of cases) {
		await writeFile(
			join(source, `${item.name}.${item.extension ?? "md"}`),
			matter.stringify(item.body, {
				title,
				publish: true,
				date: "2026-09-26",
				category: "网络与服务器",
			}),
		);
	}
	const result = spawnSync(
		process.execPath,
		[
			"--import",
			"tsx",
			"scripts/sync-published-content.ts",
			"--source",
			source,
			"--output",
			output,
			"--prune",
		],
		{
			cwd: projectRoot,
			encoding: "utf8",
		},
	);
	assert.equal(result.status, 0, result.stderr || result.stdout);

	for (const item of cases) {
		await t.test(item.name, async () => {
			const original = matter(
				await readFile(
					join(source, `${item.name}.${item.extension ?? "md"}`),
					"utf8",
				),
			);
			const synced = matter(
				await readFile(
					join(output, `${item.name}.${item.extension ?? "md"}`),
					"utf8",
				),
			);
			assert.equal(synced.data.title, title);
			assert.equal(synced.data.draft, false);
			assert.equal("publish" in synced.data, false);
			if (item.strip) {
				assert.doesNotMatch(
					synced.content,
					/^ {0,3}#\s+/m,
					"a duplicate body H1 must not repeat the page title",
				);
				assert.equal(
					synced.content.split(title).length,
					original.content.split(title).length - 1,
					"only the leading title text is removed",
				);
				assert.ok(
					synced.content.includes(`<span id="${titleAnchor}"></span>`),
					"existing links to the title must still resolve",
				);
				if (item.name === "atx") {
					const originalRest = original.content.slice(
						original.content.indexOf("\n\n", original.content.indexOf("#")),
					);
					assert.ok(synced.content.endsWith(originalRest));
					assert.ok(synced.content.includes("## Section"));
				}
			} else {
				assert.equal(
					synced.content,
					original.content,
					"meaningful headings and code must remain unchanged",
				);
			}
		});
	}
});
