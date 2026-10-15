# CampusNav AI — Git Workflow

## Authority and scope

**Owner-directed permanent policy — 15 October 2026.** This is the single operational Git/branch/worktree policy. `AGENTS.md` provides the mandatory summary; `00-agent-entrypoint.md` routes agents here. The dated owner direction is recorded under existing `DEC-DOC-001` in `29-decision-log.md`, without a new decision ID.

Every authorized repository-changing task, including documentation, tests, fixes, and refactors, uses its own dedicated feature branch. Never implement or make task edits directly on `main`. The owner authorizes automatic verified commit → integration → push → safe task cleanup; do not require another routine Git approval. Task-specific restrictions (read-only, no commit/push, stop for approval, limited staging) override that standing authorization. It does not authorize new product work, remote data mutations, unrelated cleanup, or bypassing required PR review/branch protection. Read-only audits remain read-only and do not trigger Git delivery or cleanup.

Preserve existing conventions, focused descriptive commits, deployable main, secret safety, and unrelated user work. Map graph, RLS, auth, Emergency, and schedule-presence changes require isolated review and their applicable safety regressions. Coordinate authorized schema migrations and dependent code reproducibly; this Git policy itself authorizes no migration or database action.

## 1. Inspect and identify the authoritative workspace

Before editing, run read-only inventory checks in the intended repository:

```text
git worktree list --porcelain
git branch -avv
git stash list
git status
git rev-parse HEAD
git rev-parse origin/main
```

Find the worktree that owns `main`; inspect its actual branch, HEAD, tracked/untracked state, and upstream. At policy adoption the verified authoritative workspace was `C:/Users/St.Clare/Documents/CampusNav-AI-fs4-isolated`. This is observed inventory, not permission to assume that path or any original folder remains clean. Recheck it each task. Record starting branch/HEAD/main/origin-main, worktrees, relevant dirty state, protected stash object IDs, and task-owned process/worktree identities for the final preservation check.

Do not edit, reset, clean, overwrite, auto-stash, or relocate unrelated work to obtain cleanliness. If the authoritative workspace is dirty or `main` is owned elsewhere, preserve it and use a verified clean owning workspace or genuinely necessary isolation. Ask for direction when ownership or protection is unclear.

## 2. Default: one active development worktree

For normal sequential work, stay in the authoritative clean main workspace. Do not create additional worktrees or open extra VS Code windows merely for convenience. Verify cleanliness, fetch origin, then compare main/origin-main before branching:

```text
git fetch origin
git status --porcelain=v1 --untracked-files=all
git rev-parse main
git rev-parse origin/main
```

Only an expected clean, synchronized baseline may start the task. A clearly fast-forward-only upstream update may be incorporated with `git merge --ff-only origin/main` after verifying it is the intended latest baseline; record the update and recheck cleanliness/equality. Unexpected advancement, divergence, wrong upstream, or unknown commits require review/direction, not an automatic reset, rebase, cherry-pick, or force merge. Record the verified baseline SHA for the later integration comparison.

## 3. Mandatory task branch

Use an accurate name under `feat/<feature-name>`, `fix/<bug-name>`, `docs/<documentation-task>`, `refactor/<specific-area>`, or `test/<test-task>`; examples are `feat/fs4-configured-recommendations`, `fix/mobile-map-controls`, and `docs/pwa-acceptance-update`. Names are examples, not commands to reuse an existing branch.

```text
git switch -c docs/example-task
```

Verify the branch was created from current verified main. Implement only the authorized scope; do not mix unfinished or unrelated changes into the commit. Do not rename or delete existing branches to conform to this convention retroactively.

## 4. Optional temporary isolation

Create a temporary worktree only for a real clean-isolation requirement, unrelated dirty changes, branch-ownership constraints, or an explicit canonical isolation requirement. Use a descriptive, unique path and dedicated task branch from verified main. Record why it is needed, its resolved absolute path/branch, and the separate authoritative main workspace. Never treat the original/mixed workspace or an existing reference/recovery worktree as disposable.

```text
git worktree add -b feat/example-isolated-task <new-temporary-task-worktree> main
```

Never create several worktrees for convenience. Do not attempt to check out `main` in two worktrees; integrate in its owning workspace.

## 5. Quality gates before commit

Run the task-specific deterministic tests, relevant regressions, lint, typecheck, production build, required PWA/build-artifact checks after the build, and `git diff --check`. Documentation-only tasks additionally validate canonical cross-references, policy/status consistency, changed-file scope, and Markdown structure; they do not claim product implementation or live/device/database verification.

```text
npm run lint
npm run typecheck
npm run build
npm run test:pwa:build
git diff --check
```

Select task tests from the canonical contracts, README, and actual scripts. Do not weaken tests or bypass failures. A failed safety/technical gate stops commit/integration until resolved in scope or reported as a genuine blocker. Independent tests may run concurrently only when they do not compete for shared resources; serialize Vite/SSR checks if default ports or other resources conflict. Report transient failures and successful reruns honestly.

## 6. Exact staging and commit

Review unstaged changes first. Stage each intended path individually, never `git add .` or a broad directory that could include unrelated files. The following names are examples only:

```text
git add -- AGENTS.md
git add -- CampusNav_content/53-git-workflow.md
git diff --cached --name-only
git diff --cached --check
git diff --cached --stat
git diff --cached
```

Compare the staged path list against the exact task allowlist and inspect the complete staged patch. Never stage credentials, secret environment files (`.env`/`.env.*` except an explicitly intended safe example), tokens, generated `dist/`, dependencies, QA scratch artifacts, or unapproved/unrelated changes. Do not print secret file contents during inspection. Commit with an accurate descriptive task message only after all required pre-commit checks pass; verify the feature worktree is clean afterwards. Required canonical status/contract/changelog updates belong in the same task, following `71`.

## 7. Automatic integration and push

1. Verify the committed task branch/worktree is clean and record its final commit SHA.
2. Fetch origin and compare the authoritative main/upstream with the recorded baseline. Stop for unexpected advancement/divergence; do not rewrite history or force the merge.
3. For one-worktree development, switch back to `main`. With isolation, perform integration in the separate authoritative worktree that already owns main.
4. Recheck the task branch still points to its recorded verified commit, then merge with fast-forward only; do not integrate a changed/unverified tip or use a merge commit, reset, or automatic rebase to evade a failed fast-forward.
5. Run the required task/regression, lint/typecheck/build/PWA-artifact, documentation, and whitespace checks on merged main. A failed post-merge gate means **do not push or clean up the task branch/worktree**; preserve the committed state and resolve safely or report the blocker without destructive rollback.
6. Recheck/fetch upstream before pushing if time or concurrent work could have changed it. Push only verified `main`; a rejected push is a safety stop, never permission to force-push.
7. Fetch/read upstream and confirm clean authoritative main with `HEAD == origin/main` before cleanup.

```text
git fetch origin
git switch main
git merge --ff-only <exact-task-branch>
# Run required post-merge checks before pushing.
git push origin main
git fetch origin
git rev-parse HEAD
git rev-parse origin/main
git status
```

If repository governance or branch protection requires a Pull Request, use the task branch as head and main as target; obtain required review/checks and use the permitted fast-forward-compatible integration path. If protection does not permit that path, report the conflict rather than bypassing it. Never rewrite published history or weaken protection. Do not infer PR approval from this standing workflow authorization.

GitHub main currently triggers automatic Cloudflare deployment (`08`, `62`). Report automatic deployment as observed or pending; do not trigger a manual deployment unless an explicitly applicable deployment policy/task requires it. A Git push does not itself prove deployment or product acceptance.

## 8. Safe automatic task cleanup

Cleanup happens only after successful verified integration and push, and only for the branch/temporary worktree created for the current task. Legacy cleanup is separately audited and authorized, even when old branches appear merged and clean. Preservation overrides cleanup.

Before cleanup, verify the exact task commit is reachable from main **and** pushed origin/main, and no unique commits remain on the task branch:

```text
git merge-base --is-ancestor <task-commit-sha> main
git merge-base --is-ancestor <task-commit-sha> origin/main
git rev-list --count main..<exact-task-branch>
git worktree list --porcelain
```

Require successful ancestry checks and a zero unique-commit count. Recheck the exact task branch still points to its recorded final commit and authoritative main still equals fetched origin/main; a changed tip/owner requires a fresh audit, not deletion. Check again that the task worktree has no uncommitted changes. Never delete another branch just because it is merged. Local branch deletion is the default; remote branch deletion needs separate explicit scope or applicable repository governance.

### Temporary worktree, if used

Before removal, confirm the task is committed/fully merged/pushed; tracked changes and untracked work are absent; no unique ignored files need preservation; and no ongoing task/user depends on that worktree. Inspect paths without exposing credentials:

```text
git -C <temporary-task-worktree> status --porcelain=v1 --untracked-files=all
git -C <temporary-task-worktree> ls-files --others --exclude-standard
git -C <temporary-task-worktree> ls-files --others --ignored --exclude-standard --directory
```

Ignored does not mean disposable: inspect `.env*`, local configuration, scratch/QA files, caches, and ignored directories for unique work. Dependencies/build output may be disposable only when verified regenerable with no unique content; otherwise preserve the worktree and report the exact blocker. Do not auto-delete/move ignored user files to make removal succeed.

Stop only preview/test processes started for this task, verifying their current PID/command/path ownership; do not kill unrelated servers, editors, VS Code, or user processes. Resolve the exact registered worktree's absolute path and confirm it is the approved temporary target, not the authoritative workspace, original repository, parent/root directory, reference worktree, or another task's worktree.

From the separate authoritative main workspace, remove the registered temporary worktree with Git, without force:

```text
git worktree remove <exact-verified-temporary-task-worktree>
git worktree prune --dry-run --verbose
git worktree prune
git worktree list --porcelain
```

Run prune after successful removal, not as a workaround for an unresolved/locked/possibly offline worktree. Review its dry run first: if it would prune unrelated/protected/possibly offline registrations, preserve them and report the blocker instead of running global prune. If Windows file locks, active users/processes, unique ignored/untracked files, or another safety check prevent removal, report it. Never use `--force`, manual directory deletion, recursive filesystem removal, or `git clean` to bypass safeguards.

### Completed local task branch

After leaving the branch (and removing its temporary worktree when applicable), confirm no worktree still checks it out. Then delete only that completed branch:

```text
git branch -d <exact-task-branch>
```

Never use force deletion (`-D`). If safe worktree removal cannot finish, keep its checked-out branch too and report both; do not falsely claim full cleanup.

## 9. Permanent preservation boundary

Do not automatically remove original mixed or dirty development worktrees, secondary map worktrees with unmerged changes, owner-designated references, recovery snapshots/patches, protected stashes, or any worktree/branch containing unique work. Do not pop/apply/drop/rename/overwrite protected stashes. The protected object at adoption is `7a2337f1eeb747d157859e73252c7c605590dd50`; verify it still exists and compare its reference/object before and after each task. A later stash-index change is not permission to act on a different object.

All pre-existing worktrees/branches are outside automatic current-task cleanup. Inventory them, preserve unrelated changes, and require a separately authorized legacy audit/cleanup. Never force-reset, discard, rewrite, or silently stash user work merely to obtain clean main. New authority or a genuine preservation/branch-protection blocker requires direction, not an improvised destructive workaround.

## 10. Final verification and report

Default successful lifecycle:

**Dedicated feature branch → authorized implementation → tests → exact staging/commit → fast-forward merge → post-merge verification → push → safe task cleanup → clean synchronized main.**

Verify authoritative branch `main`, clean tracked/untracked state, `HEAD == origin/main`, task commit reachability, safe deletion of only the completed task branch, removal of the current task's disposable worktree if one was used, unchanged protected stash objects, and preserved unrelated worktrees/branches. Inspect `git worktree list`, `git branch -avv`, `git stash list`, and final `git status`.

Report starting/ending workspace and branch, commit SHA/message, exact staged files, tests and any reruns, merge/push results, main/origin-main SHAs, task branch/worktree cleanup outcome, remaining protected legacy worktrees, stash before/after, automatic deployment as observed/pending when relevant, and exact blockers. If cleanup is unsafe, clean authoritative main can still be reported accurately, but outstanding task worktrees/branches must be named; never claim the entire repository is clean when preserved legacy worktrees are dirty.

This is an agent-executed policy, not an installed background cleanup daemon or Git hook. It never broadens the authorized task or starts another feature.
