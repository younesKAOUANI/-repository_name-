#!/usr/bin/env node

/**
 * Script to check which pages are missing metadata exports
 * Run this script to identify pages that need metadata added
 */

const fs = require('fs');
const path = require('path');

// Directory to scan for page files
const PAGES_DIR = path.join(__dirname, '../src/app');

// Function to recursively find all page.tsx files
function findPageFiles(dir, pageFiles = []) {
  const files = fs.readdirSync(dir);
  
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules and other non-relevant directories
      if (!file.startsWith('.') && !file.includes('node_modules')) {
        findPageFiles(fullPath, pageFiles);
      }
    } else if (file === 'page.tsx') {
      pageFiles.push(fullPath);
    }
  }
  
  return pageFiles;
}

// Function to check if a file has metadata export
function hasMetadataExport(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Check for various metadata export patterns
    const metadataPatterns = [
      /export\s+const\s+metadata\s*=/,
      /export\s+async\s+function\s+generateMetadata/,
      /export\s+function\s+generateMetadata/,
      /export\s+{\s*metadata\s*}/,
    ];
    
    return metadataPatterns.some(pattern => pattern.test(content));
  } catch (error) {
    console.error(`Error reading file ${filePath}:`, error.message);
    return false;
  }
}

// Main function
function checkMetadata() {
  console.log('🔍 Scanning for pages missing metadata...\n');
  
  const pageFiles = findPageFiles(PAGES_DIR);
  const missingMetadata = [];
  const hasMetadata = [];
  
  pageFiles.forEach(filePath => {
    const relativePath = path.relative(process.cwd(), filePath);
    
    if (hasMetadataExport(filePath)) {
      hasMetadata.push(relativePath);
    } else {
      missingMetadata.push(relativePath);
    }
  });
  
  // Results
  console.log(`📊 Metadata Check Results:`);
  console.log(`Total pages found: ${pageFiles.length}`);
  console.log(`Pages with metadata: ${hasMetadata.length}`);
  console.log(`Pages missing metadata: ${missingMetadata.length}\n`);
  
  if (hasMetadata.length > 0) {
    console.log('✅ Pages with metadata:');
    hasMetadata.forEach(file => console.log(`   ${file}`));
    console.log();
  }
  
  if (missingMetadata.length > 0) {
    console.log('❌ Pages missing metadata:');
    missingMetadata.forEach(file => {
      console.log(`   ${file}`);
    });
    console.log();
    console.log('💡 To add metadata to these pages, import and use:');
    console.log('   - COMMON_METADATA from "@/lib/metadata" for standard pages');
    console.log('   - generateMetadata() for custom pages');
    console.log('   - createDynamicMetadata() for dynamic content');
    console.log();
    console.log('📖 See docs/METADATA.md for detailed instructions');
  } else {
    console.log('🎉 All pages have metadata! Great job!');
  }
}

// Run the check
if (require.main === module) {
  checkMetadata();
}

module.exports = { checkMetadata, findPageFiles, hasMetadataExport };