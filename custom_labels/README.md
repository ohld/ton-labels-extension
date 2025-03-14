# Custom Labels

This directory contains custom label files for the TON Labels Extension. You can add your own label files here to extend the functionality of the extension.

## File Format

Each label file should be a JSON file (`.json` extension) with the following format:

```json
{
    "UQCrV6R7q3nXgycO1LqtK-YXOvDRwtuhq1DbPBEhttI02Cji": "Label Name",
    "UQDSE2BHJi4Qowu4jgvqQ3_4-KFrR2x6DqPzFkMGczCgoLcK": "Another Label"
}
```

Where:
- The key is a TON wallet address (in raw format)
- The value is a string containing the label/name for that address

## Adding Custom Labels

1. Create a new `.json` file in this directory
2. Follow the format above
3. The extension will automatically load all `.json` files from this directory

## Notes

- Files in this directory are git-ignored by default to prevent accidental commits of private labels
- Make sure your JSON is valid (you can use online JSON validators)
- Each address should be unique across all files
- If the same address appears in multiple files, the last loaded file's label will take precedence 