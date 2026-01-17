$NodePath = "C:\Program Files\nodejs"
if (Test-Path $NodePath) {
    $env:Path = "$NodePath;$env:Path"
} else {
    Write-Host "Error: Node.js installation not found at $NodePath"
    exit 1
}

$Command = $args[0]

switch ($Command) {
    "install" {
        npm install
    }
    "migrate" {
        # Pass any additional arguments to the migrate command
        if ($args.Count -gt 1) {
            $params = $args[1..($args.Count-1)]
            npm run prisma:migrate -- $params
        } else {
            npm run prisma:migrate
        }
    }
    "generate" {
        npm run prisma:generate
    }
    "start" {
        npm run start:dev
    }
    "studio" {
        npm run prisma:studio
    }
    Default {
        Write-Host "--------------------------------------------------------"
        Write-Host "Dev Helper Script (Wraps npm for systems with Path issues)"
        Write-Host "--------------------------------------------------------"
        Write-Host "Usage: ./dev.ps1 [command]"
        Write-Host ""
        Write-Host "Commands:"
        Write-Host "  install  : Install dependencies"
        Write-Host "  migrate  : Run database migrations (safe)"
        Write-Host "  generate : Regenerate Prisma Client"
        Write-Host "  start    : Start NestJS dev server"
        Write-Host "  studio   : Open Prisma Studio GUI"
        Write-Host "--------------------------------------------------------"
    }
}
