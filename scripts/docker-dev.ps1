# Docker Development Script for Resort CMS (PowerShell)
# This script helps manage the development environment

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "logs", "db", "migrate", "seed", "studio", "clean", "help")]
    [string]$Command = "help",

    [Parameter(Position=1)]
    [string]$Service = ""
)

# Function to write colored output
function Write-Status {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Function to show help
function Show-Help {
    Write-Host "Resort CMS Docker Development Script (PowerShell)"
    Write-Host ""
    Write-Host "Usage: .\scripts\docker-dev.ps1 [COMMAND] [SERVICE]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start     Start all development services"
    Write-Host "  stop      Stop all development services"
    Write-Host "  restart   Restart all development services"
    Write-Host "  logs      Show logs for all services"
    Write-Host "  db        Start only database services"
    Write-Host "  migrate   Run database migrations"
    Write-Host "  seed      Seed the database"
    Write-Host "  studio    Open Prisma Studio"
    Write-Host "  clean     Clean up containers and volumes"
    Write-Host "  help      Show this help message"
    Write-Host ""
    Write-Host "Examples:"
    Write-Host "  .\scripts\docker-dev.ps1 start           # Start all services"
    Write-Host "  .\scripts\docker-dev.ps1 logs app        # Show logs for app service"
    Write-Host "  .\scripts\docker-dev.ps1 migrate         # Run migrations"
}

# Function to start services
function Start-Services {
    Write-Status "Starting Resort CMS development environment..."

    # Start database services first
    Write-Status "Starting database services..."
    docker-compose up -d postgres redis adminer

    # Wait for databases to be ready
    Write-Status "Waiting for databases to be ready..."
    Start-Sleep -Seconds 10

    # Run migrations
    Write-Status "Running database migrations..."
    docker-compose run --rm migrate

    # Start all services
    Write-Status "Starting all services..."
    docker-compose up -d

    Write-Success "All services started successfully!"
    Write-Host ""
    Write-Host "Services available at:"
    Write-Host "  • Application: http://localhost:3000"
    Write-Host "  • Database UI: http://localhost:8080"
    Write-Host "  • Prisma Studio: npm run docker:studio"
    Write-Host ""
    Write-Host "To view logs: .\scripts\docker-dev.ps1 logs"
    Write-Host "To stop services: .\scripts\docker-dev.ps1 stop"
}

# Function to stop services
function Stop-Services {
    Write-Status "Stopping Resort CMS development environment..."
    docker-compose down
    Write-Success "All services stopped successfully!"
}

# Function to restart services
function Restart-Services {
    Write-Status "Restarting Resort CMS development environment..."
    Stop-Services
    Start-Sleep -Seconds 2
    Start-Services
}

# Function to show logs
function Show-Logs {
    if ([string]::IsNullOrEmpty($Service)) {
        docker-compose logs -f
    } else {
        docker-compose logs -f $Service
    }
}

# Function to start only database
function Start-DatabaseOnly {
    Write-Status "Starting database services only..."
    docker-compose up -d postgres redis adminer
    Write-Success "Database services started!"
    Write-Host ""
    Write-Host "Database UI available at: http://localhost:8080"
}

# Function to run migrations
function Run-Migrations {
    Write-Status "Running database migrations..."
    docker-compose run --rm migrate
    Write-Success "Migrations completed!"
}

# Function to seed database
function Seed-Database {
    Write-Status "Seeding database..."
    docker-compose run --rm app npm run db:seed
    Write-Success "Database seeded successfully!"
}

# Function to open Prisma Studio
function Open-Studio {
    Write-Status "Opening Prisma Studio..."
    Start-Process -NoNewWindow -FilePath "docker-compose" -ArgumentList "run", "--rm", "app", "npx", "prisma", "studio", "--browser", "none"
    Write-Host "Prisma Studio should be accessible at the provided URL"
}

# Function to clean up
function Clean-Up {
    Write-Warning "This will remove all containers, networks, and volumes!"
    $confirmation = Read-Host "Are you sure? (y/N)"
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        Write-Status "Cleaning up Docker environment..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        Write-Success "Clean up completed!"
    } else {
        Write-Status "Clean up cancelled."
    }
}

# Main script logic
switch ($Command) {
    "start" {
        Start-Services
    }
    "stop" {
        Stop-Services
    }
    "restart" {
        Restart-Services
    }
    "logs" {
        Show-Logs
    }
    "db" {
        Start-DatabaseOnly
    }
    "migrate" {
        Run-Migrations
    }
    "seed" {
        Seed-Database
    }
    "studio" {
        Open-Studio
    }
    "clean" {
        Clean-Up
    }
    "help" {
        Show-Help
    }
    default {
        Write-Error "Unknown command: $Command"
        Show-Help
        exit 1
    }
}