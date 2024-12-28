const baseUrl =
  "https://is1-ssl.mzstatic.com/image/thumb/Music124/v4/bd/ed/cf/bdedcfcf-3b3d-35ae-f752-175e2d8034dc/194152826486.png/";
const size = "1000x1000";
const startChar = "a"; // Change this to your desired start ('f', 'g', etc.)
const endChar = "z"; // Change this to your desired end ('x', 'y', 'z')
const suffixes = [];
const validLinks = [];
const format = ".jpg";

// Generate combinations starting from `fa` if startChar is 'f'
for (let i = startChar.charCodeAt(0); i <= endChar.charCodeAt(0); i++) {
  const firstLetter = String.fromCharCode(i);
  const secondStart =
    i === startChar.charCodeAt(0) ? "a".charCodeAt(0) : "a".charCodeAt(0);
  const secondEnd =
    i === endChar.charCodeAt(0) ? "z".charCodeAt(0) : "z".charCodeAt(0);

  for (let j = secondStart; j <= secondEnd; j++) {
    suffixes.push(firstLetter + String.fromCharCode(j));
  }
}

// Validate suffixes
async function validateSuffixes() {
  for (const suffix of suffixes) {
    const url = `${baseUrl}${size}${suffix}${format}`;
    try {
      const response = await fetch(url, { method: "HEAD" }); // Use HEAD for minimal data transfer
      if (response.ok) {
        console.log(`✅ Valid: ${url}`);
        validLinks.push(url);
      } else {
        console.warn(`❌ Invalid: ${url}`);
      }
    } catch (error) {
      console.error(`⚠️ Error: ${url} - ${error.message}`);
    }
  }

  // Output valid links
  console.log("✅ Valid Links:", validLinks);
}

// Start validation
validateSuffixes();
