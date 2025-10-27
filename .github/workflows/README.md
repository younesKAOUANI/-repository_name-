# GitHub Actions Workflows

This directory contains GitHub Actions workflows for automatic deployment.

## Setup Instructions

### 1. Generate SSH Key on Your Local Machine

```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_deploy
```

### 2. Add Public Key to VPS

Copy the public key to your VPS:

```bash
ssh-copy-id -i ~/.ssh/github_actions_deploy.pub pharmapedia@your-vps-ip
```

Or manually add it to `~/.ssh/authorized_keys` on the server:

```bash
cat ~/.ssh/github_actions_deploy.pub
# Copy the output and add to ~/.ssh/authorized_keys on your VPS
```

### 3. Add GitHub Secrets

Go to your repository on GitHub:
- Navigate to **Settings** → **Secrets and variables** → **Actions**
- Click **New repository secret** and add the following:

| Secret Name | Value | Description |
|-------------|-------|-------------|
| `VPS_HOST` | `your-server-ip` | Your VPS IP address or domain |
| `VPS_USERNAME` | `pharmapedia` | SSH username on your VPS |
| `VPS_SSH_KEY` | `<private key content>` | Content of `~/.ssh/github_actions_deploy` file |
| `VPS_PORT` | `22` | SSH port (optional, defaults to 22) |

To get the private key content:
```bash
cat ~/.ssh/github_actions_deploy
# Copy the entire output including BEGIN and END lines
```

### 4. Configure Git on VPS

Make sure git is configured on your VPS to pull without authentication issues:

```bash
# SSH into your VPS
ssh pharmapedia@your-vps-ip

# Navigate to project
cd /var/www/pharmapedia/pharmapedia

# Configure git (if not already done)
git config --global user.email "you@example.com"
git config --global user.name "Your Name"

# Make sure the repository is clean
git status
```

### 5. Test the Workflow

After setting up the secrets:

1. Make a change to any file
2. Commit and push to the `main` branch:
   ```bash
   git add .
   git commit -m "Test auto-deployment"
   git push origin main
   ```
3. Go to **Actions** tab in GitHub to see the workflow running
4. Check your VPS to verify the deployment

## Workflows

### `deploy.yml`
- **Trigger**: Push to `main` branch
- **Purpose**: Deploy the main application
- **Actions**:
  - Pull latest code
  - Stop containers
  - Rebuild with `--build` flag
  - Restart containers
  - Clean up old images
  - Show container status and logs

### `deploy-coming-soon.yml`
- **Trigger**: Push to `main` branch (only when `coming-soon/**` files change)
- **Purpose**: Deploy the coming soon landing page
- **Actions**:
  - Pull latest code
  - Copy files to `/var/www/pharmapedia/coming-soon/`

## Troubleshooting

### Permission Issues
If you get permission errors:
```bash
# On VPS, ensure the user has Docker permissions
sudo usermod -aG docker pharmapedia
# Logout and login again
```

### Git Pull Fails
If git pull fails due to local changes:
```bash
# On VPS
cd /var/www/pharmapedia/pharmapedia
git stash  # Save local changes
git pull origin main
```

### View Workflow Logs
- Go to GitHub repository → **Actions** tab
- Click on the workflow run to see detailed logs

## Advanced: Add Build Notifications

You can add Slack/Discord notifications by adding steps to the workflows. Example for Discord:

```yaml
- name: Notify Discord
  if: always()
  uses: sarisia/actions-status-discord@v1
  with:
    webhook: ${{ secrets.DISCORD_WEBHOOK }}
    status: ${{ job.status }}
```

## Security Best Practices

1. ✅ Never commit secrets to the repository
2. ✅ Use SSH keys instead of passwords
3. ✅ Limit SSH key permissions (read-only where possible)
4. ✅ Use separate SSH keys for different purposes
5. ✅ Regularly rotate SSH keys
6. ✅ Monitor workflow logs for suspicious activity
