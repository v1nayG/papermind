# Script to backdate git commits for 51 project files starting April 2, 2026
$startDate = Get-Date "2026-04-02 09:00:00"

# Initialize Git if not initialized
if (-not (Test-Path ".git")) {
    git init
}

# Create .gitignore if not present
if (-not (Test-Path ".gitignore")) {
    @"
node_modules/
.env
dist/
build/
.DS_Store
"@ | Out-File -Encoding utf8 .gitignore
}

# Get all project files excluding node_modules, .git, etc.
$files = Get-ChildItem -Recurse -File | Where-Object { 
    $_.FullName -notmatch 'node_modules|\.git|dist|build' 
} | Sort-Object FullName

$currentDate = $startDate
$fileCount = 0

foreach ($file in $files) {
    $relativePath = Resolve-Path -Relative $file.FullName
    $fileName = $file.Name

    # Generate a random time between 09:00 AM and 09:30 PM (9 to 21 hours)
    $randomHour = Get-Random -Minimum 9 -Maximum 21
    $randomMinute = Get-Random -Minimum 0 -Maximum 59
    $randomSecond = Get-Random -Minimum 0 -Maximum 59

    # Construct the backdated timestamp for this specific file
    $commitDateObj = Get-Date -Year $currentDate.Year -Month $currentDate.Month -Day $currentDate.Day -Hour $randomHour -Minute $randomMinute -Second $randomSecond
    $dateString = $commitDateObj.ToString("yyyy-MM-dd HH:mm:ss")

    # Environment variables for Git backdating
    $env:GIT_COMMITTER_DATE = $dateString
    $env:GIT_AUTHOR_DATE = $dateString

    # Add single file and commit
    git add $relativePath
    $commitMsg = "Add $fileName"
    git commit -m $commitMsg --date="$dateString"

    $fileCount++
    Write-Host "[$fileCount/51] Committed: $relativePath at $dateString"

    # Move to the next day
    $currentDate = $currentDate.AddDays(1)
}

Write-Host "Successfully backdated $fileCount files starting from April 2, 2026!"
