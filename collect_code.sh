#!/usr/bin/env bash

# This script collects all TypeScript and JavaScript code in the src directory
# Run chmod +x get_code_context.sh to make the script executable
# Run ./get_code_context.sh to execute the script

# Name of the output file
OUTPUT_FILE="all_code.txt"

# Clear/overwrite the output file if it already exists
> "$OUTPUT_FILE"

# Find every .ts, .tsx, or .js file inside src
FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" \))

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
