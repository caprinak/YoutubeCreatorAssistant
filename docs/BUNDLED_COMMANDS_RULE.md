# AI Assistant Command Bundling Rule

To optimize user interaction and reduce repetitive approval prompts, this project enforces the **Command Bundling Rule**.

## The Rule
All sequential terminal commands proposed by the AI assistant MUST be bundled together into a single executable command line. 
- In **PowerShell** (default on this Windows environment), separate commands using a semicolon `;`.
- In **Bash / Linux / CMD**, separate commands using double ampersands `&&` or semicolons `;`.

This ensures that the user only needs to review and approve execution a single time for a logical workflow.

---

## Bundled Git Commit & Push Workflow

For initial setup, commit, and pushing this repository to GitHub, the following commands are bundled:

### PowerShell Command Chain:
```powershell
git add .; git commit -m "feat: setup local backend database, Angular 21 frontend, and >90% unit test coverage"; git remote add origin https://github.com/caprinak/YoutubeCreatorAssistant.git; git branch -M main; git push -u origin main
```

### Explanation of Commands:
1. `git add .` - Stages all modified and new project files.
2. `git commit -m "..."` - Commits the staged files with a descriptive message.
3. `git remote add origin ...` - Configures the GitHub repository as the remote origin.
4. `git branch -M main` - Renames the default branch to `main`.
5. `git push -u origin main` - Pushes the committed code to the remote `main` branch.
