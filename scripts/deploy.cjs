const fs = require("node:fs");
const path = require("node:path");
const ghPages = require("gh-pages");

const OWNER = "navrivon";
const REPO = "3guys";
const BRANCH = "gh-pages";
const DIST_DIR = "dist";

function getPublishRepoUrl() {
  // Supports either variable name.
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    return `git@github.com:${OWNER}/${REPO}.git`;
  }
  return `https://${OWNER}:${token}@github.com/${OWNER}/${REPO}.git`;
}

function ensureDistExists() {
  const absDist = path.resolve(process.cwd(), DIST_DIR);
  if (!fs.existsSync(absDist)) {
    console.error(`Missing ${DIST_DIR}/. Run "npm run build" first.`);
    process.exit(1);
  }
}

function publish() {
  ensureDistExists();

  ghPages.publish(
    DIST_DIR,
    {
      repo: getPublishRepoUrl(),
      branch: BRANCH,
      dotfiles: true,
      message: "chore: deploy site [skip ci]",
      user: {
        name: process.env.GIT_USER || "github-actions[bot]",
        email:
          process.env.GIT_EMAIL ||
          "41898282+github-actions[bot]@users.noreply.github.com",
      },
      silent: false,
    },
    (error) => {
      if (error) {
        console.error("Deploy failed:", error.message || error);
        console.error(
          [
            "Tips:",
            '- Local deploy: use SSH auth (working "git push" to GitHub).',
            '- Token deploy: set GITHUB_TOKEN or GH_TOKEN with repo write access.',
          ].join("\n"),
        );
        process.exit(1);
      }

      console.log(`Deployed ${DIST_DIR}/ to ${OWNER}/${REPO}:${BRANCH}`);
    },
  );
}

publish();
