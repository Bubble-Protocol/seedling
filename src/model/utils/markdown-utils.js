export function extractTitle(markdownContent, pathname) {
  // Attempt to extract title from Front Matter
  const frontMatterField = getFrontMatterField(markdownContent, 'title');
  if (frontMatterField) return frontMatterField;

  // Fallback to the first H1 heading
  const headingMatch = markdownContent.match(/(?:^|\s|\n)# (.+)$/m);
  if (headingMatch) {
    return headingMatch[1];
  }

  // Fallback to the filename
  const pathSegments = pathname.split('/');
  const filename = pathSegments[pathSegments.length - 1];
  return this._filenameToTitle(filename);
}


export function extractSummary(markdownContent) {
  // Step 1: Check for a metadata header with description
  const frontMatterField = getFrontMatterField(markdownContent, 'description');
  if (frontMatterField) return frontMatterField;

  // Step 2: Fallback to first non-heading paragraph
  const lines = markdownContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    // Skip empty lines, headings, and metadata lines
    if (line && !line.startsWith('#')) {
      return line;
    }
  }

  // Default to empty string if no suitable summary found
  return '';
}


export function extractImage(markdownContent, markdownUrl) {
  // Step 1: Check for a metadata header with description
  const frontMatterField = getFrontMatterField(markdownContent, 'image');
  if (frontMatterField) return new URL(frontMatterField, markdownUrl).href;

  // Regular expression to match markdown image syntax ![alt text](url)
  let imageRegex = /!\[.*?\]\((.*?)\)/;
  let match = markdownContent.match(imageRegex);
  
  // If a match is found, return the URL of the first image
  if (match && match[1]) {
    return new URL(match[1], markdownUrl).href;
  }

  // Regular expression to match html image syntax <img src="url">
  imageRegex = /<img.* src="([^"]*?)".*>/;
  match = markdownContent.match(imageRegex);
  
  // If a match is found, return the URL of the first image
  if (match && match[1]) {
    return new URL(match[1], markdownUrl).href;
  }

  // If no image is found, return null or an empty string
  return null;
}


function getFrontMatterField(markdownContent, field) {
  const frontMatterContent = markdownContent.match(/---\n([\s\S]*?)\n---/);
  if (frontMatterContent) {
    const frontMatter = frontMatterContent[1];
    const metadataMatch = new RegExp(`${field}:\\s*(.*)`, 'i').exec(frontMatter);
    if (metadataMatch && metadataMatch[1]) {
      return metadataMatch[1].trim();
    }
  }
}