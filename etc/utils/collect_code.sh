#!/usr/bin/env bash

# This script collects all TypeScript and JavaScript code in the src directory
# Run chmod +x collect_code.sh to make the script executable
# Run ./collect_code.sh to execute the script

# Define paths
SRC_DIR="$(dirname "$0")/../src"  # Adjust path to src directory
OUTPUT_DIR="$(dirname "$0")/output"
OUTPUT_FILE="$OUTPUT_DIR/all_code.txt"

# Create the output directory if it doesn't exist
mkdir -p "$OUTPUT_DIR"

# Clear/overwrite the output file if it already exists
> "$OUTPUT_FILE"

# Find every .ts, .tsx, or .js file inside src
FILES=$(find "$SRC_DIR" -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \))

# Loop over each file
for FILE in $FILES; do
  # Convert the path from forward slashes to backslashes
  WIN_PATH=$(echo "$FILE" | sed 's/\//\\/g')

  # Print the path to the output file
  echo "$WIN_PATH" >> "$OUTPUT_FILE"
  
  # Append the file contents to the output file
  cat "$FILE" >> "$OUTPUT_FILE"
  
  # Blank line to separate each file block
  echo -e "\n" >> "$OUTPUT_FILE"
done

echo "All code has been collected in $OUTPUT_FILE."
