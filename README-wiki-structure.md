# Wiki Data Structure Migration

This document outlines the updates made to the wiki data structure in April 2023.

## Schema Changes

The wiki system has undergone a field name standardization to improve consistency and maintainability. The following changes were made:

### Field Name Changes

| Old Field Name              | New Field Name               | Description                     |
| --------------------------- | ---------------------------- | ------------------------------- |
| `词条名称`                  | `Wiki Name`                  | Title of the wiki entry         |
| `内容`                      | `Content`                    | Main content of the entry       |
| `人工智能生成 AI-generated` | `AI-generated`               | Flag if AI-generated            |
| `Author`                    | `Editor`                     | Editor wallet address           |
| `人工智能模型`              | `AI model`                   | AI model used if generated      |
| `book_title`                | `Book Title / DOI / Website` | Source book/website             |
| `content_type`              | `Content Type`               | Type: "One Line" or "Paragraph" |
| `chapter`                   | `Chapter`                    | Chapter reference               |
| `page`                      | `Page`                       | Page number                     |

### New Fields Added

| Field Name | Type           | Description                                 |
| ---------- | -------------- | ------------------------------------------- |
| `Username` | string or null | Username of the editor for display purposes |

## Implementation

The following files were updated to support the new data structure:

1. `components/wiki/types.ts` - Updated interfaces to reflect new field names
2. `components/wiki/utils.ts` - Modified conversion utilities
3. `components/wiki/wikiCard.tsx` - Updated card component to use new field names
4. `components/wiki/wikiData.tsx` - Modified data component to work with new structure
5. `components/wiki/wikiEditor.tsx` - Updated editor to use new field structure
6. `lib/services/userContent.ts` - Updated ambient card functions to use new field names

## Migration Notes

When importing old data to the new structure, ensure:

1. Field names are properly remapped according to the table above
2. Content types should be converted from "one-line"/"paragraph" to "One Line"/"Paragraph"
3. Boolean values should be properly handled (strings "true"/"false" to actual boolean values)
4. Optional fields should provide appropriate null fallbacks

## API Usage

When working with the wiki API:

```typescript
// Example of creating a new wiki entry
const newEntry = {
  "Wiki Name": "Example Entry",
  Content: "This is an example wiki entry",
  "Content Type": "One Line",
  Chapter: "1.1",
  Editor: walletAddress,
  "AI-generated": false,
  "Book Title / DOI / Website": "Example Book",
  Page: "42",
  Username: username,
};

// Insert into database
const { data, error } = await supabase.from("wiki").insert([newEntry]).select();
```

## UI Components

The wiki system provides several standardized components:

- `WikiCard` - Main display component for wiki entries
- `ConceptCard` - Used for flip-card style wiki concept displays
- `WikiEditor` - Form component for creating/editing wiki entries

Each component uses the standardized data format defined in `types.ts`.
