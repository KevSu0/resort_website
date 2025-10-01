#!/bin/bash

# Docker Development Script for Resort CMS
# This script helps manage the development environment

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to show help
show_help() {
    echo "Resort CMS Docker Development Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start     Start all development services"
    echo "  stop      Stop all development services"
    echo "  restart   Restart all development services"
    echo "  logs      Show logs for all services"
    echo "  db        Start only database services"
    echo "  migrate   Run database migrations"
    echo "  seed      Seed the database"
    echo "  studio    Open Prisma Studio"
    echo "  clean     Clean up containers and volumes"
    echo "  help      Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start           # Start all services"
    echo "  $0 logs app        # Show logs for app service"
    echo "  $0 migrate         # Run migrations"
}

# Function to start services
start_services() {
    print_status "Starting Resort CMS development environment..."

    # Start database services first
    print_status "Starting database services..."
    docker-compose up -d postgres redis adminer

    # Wait for databases to be ready
    print_status "Waiting for databases to be ready..."
    sleep 10

    # Run migrations
    print_status "Running database migrations..."
    docker-compose run --rm migrate

    # Start all services
    print_status "Starting all services..."
    docker-compose up -d

    print_success "All services started successfully!"
    echo ""
    echo "Services available at:"
    echo "  • Application: http://localhost:3000"
    echo "  • Database UI: http://localhost:8080"
    echo "  • Prisma Studio: npm run docker:studio"
    echo ""
    echo "To view logs: $0 logs"
    echo "To stop services: $0 stop"
}

# Function to stop services
stop_services() {
    print_status "Stopping Resort CMS development environment..."
    docker-compose down
    print_success "All services stopped successfully!"
}

# Function to restart services
restart_services() {
    print_status "Restarting Resort CMS development environment..."
    stop_services
    sleep 2
    start_services
}

# Function to show logs
show_logs() {
    local service=$2
    if [ -z "$service" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$service"
    fi
}

# Function to start only database
start_db_only() {
    print_status "Starting database services only..."
    docker-compose up -d postgres redis adminer
    print_success "Database services started!"
    echo ""
    echo "Database UI available at: http://localhost:8080"
}

# Function to run migrations
run_migrations() {
    print_status "Running database migrations..."
    docker-compose run --rm migrate
    print_success "Migrations completed!"
}

# Function to seed database
seed_database() {
    print_status "Seeding database..."
    docker-compose run --rm app npm run db:seed
    print_success "Database seeded successfully!"
}

# Function to open Prisma Studio
open_studio() {
    print_status "Opening Prisma Studio..."
    docker-compose run --rm app npx prisma studio --browser none &
    echo "Prisma Studio should be accessible at the provided URL"
}

# Function to clean up
clean_up() {
    print_warning "This will remove all containers, networks, and volumes!"
    read -p "Are you sure? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_status "Cleaning up Docker environment..."
        docker-compose down -v --remove-orphans
        docker system prune -f
        print_success "Clean up completed!"
    else
        print_status "Clean up cancelled."
    fi
}

# Main script logic
case "${1:-help}" in
    start)
        start_services
        ;;
    stop)
        stop_services
        ;;
    restart)
        restart_services
        ;;
    logs)
        show_logs "$@"
        ;;
    db)
        start_db_only
        ;;
    migrate)
        run_migrations
        ;;
    seed)
        seed_database
        ;;
    studio)
        open_studio
        ;;
    clean)
        clean_up
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac