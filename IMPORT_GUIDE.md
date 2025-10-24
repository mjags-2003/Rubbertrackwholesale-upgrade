# Bulk Import Guide - Rubber Track Wholesale

Complete guide for importing products via CSV/Excel spreadsheets.

## 📋 Supported Product Types

1. **Rubber Tracks** - Complete rubber track assemblies
2. **Bottom Rollers** - Bottom/undercarriage rollers
3. **Sprockets** - Drive sprockets
4. **Idlers** - Front/rear idler wheels

---

## 🚀 How to Import Products

### Method 1: Via Admin Panel (Frontend)
1. Login to admin panel at `/admin/login`
2. Navigate to "Products" section
3. Click "Import Products" button
4. Download template for your product type
5. Fill in the template with your data
6. Upload the completed file
7. Review import results

### Method 2: Via API (Direct)
```bash
curl -X POST "http://your-domain.com/api/admin/products/import" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@your_products.csv"
```

---

## 📄 Template Formats

### 1. Rubber Tracks Template

**Columns Required:**
- `comp_name` - Brand name (e.g., Bobcat, Kubota, Caterpillar)
- `machine_model` - Machine model (e.g., T190, SVL95)
- `track_size` - Track dimensions (e.g., 450x86x56)
- `Price` - Product price in USD
- `eng_description` - Detailed product description
- `title_h1` - Primary heading for product page
- `sub_title_h2` - Secondary heading
- `page_title` - SEO page title
- `eng_metakeyword` - SEO keywords (comma-separated)
- `eng_meta_desc` - SEO meta description
- `shown_main_listin` - Display in main listing (Yes/No)

**Example:**
```csv
comp_name,machine_model,track_size,Price,eng_description,title_h1,sub_title_h2,page_title,eng_metakeyword,eng_meta_desc,shown_main_listin
Bobcat,T190,450x86x56,1299.99,"Premium rubber track for Bobcat T190",Bobcat T190 Rubber Track,Premium Quality,Bobcat T190 Rubber Track | Wholesale,"bobcat tracks, t190","Buy Bobcat T190 rubber tracks",Yes
```

**Download Template:**
```
GET /api/admin/products/import-template/rubber-tracks
```

---

### 2. Bottom Rollers Template

**Columns Required:**
- `Machine Model` - Full machine model (e.g., "Bobcat T190")
- `Roller` - Item type (e.g., "Bottom Roller")
- `Bottom / Front` - Position (e.g., "Bottom", "Front Bottom")
- `Part Number` - Manufacturer part number
- `Alternate Part numbers` - Alternative part numbers
- `SKU` - Your internal SKU
- `Fits following machine models` - Compatible models (comma-separated)
- `Description` - Product description

**Example:**
```csv
Machine Model,Roller,Bottom / Front,Part Number,Alternate Part numbers,SKU,Fits following machine models,Description
Bobcat T190,Bottom Roller,Bottom,6813501,6813501-ALT,BR-BOB-T190,"Bobcat T190, T200, T550","Heavy-duty bottom roller for Bobcat T190"
```

**Download Template:**
```
GET /api/admin/products/import-template/bottom-rollers
```

---

### 3. Sprockets Template

**Columns Required:**
- `Machine Model` - Full machine model
- `ITEM` - Item type (e.g., "Drive Sprocket")
- `Part Number` - Manufacturer part number
- `Alternate Part numbers` - Alternative part numbers
- `SKU` - Your internal SKU
- `Fits following machine models` - Compatible models
- `Description` - Product description

**Example:**
```csv
Machine Model,ITEM,Part Number,Alternate Part numbers,SKU,Fits following machine models,Description
Bobcat T190,Drive Sprocket,6813502,6813502-ALT,SPR-BOB-T190,"Bobcat T190, T200","Precision-machined drive sprocket for Bobcat T190"
```

**Download Template:**
```
GET /api/admin/products/import-template/sprockets
```

---

### 4. Idlers Template

**Columns Required:**
- `Machine Model` - Full machine model
- `Roller` - Item type (e.g., "Front Idler")
- `Front / Rear Idler` - Position (Front/Rear)
- `Part Number` - Manufacturer part number
- `Alternate Part numbers` - Alternative part numbers
- `SKU` - Your internal SKU
- `Fits following machine models` - Compatible models
- `Description` - Product description

**Example:**
```csv
Machine Model,Roller,Front / Rear Idler,Part Number,Alternate Part numbers,SKU,Fits following machine models,Description
Bobcat T190,Front Idler,Front,6813503,6813503-ALT,IDL-BOB-T190,"Bobcat T190, T200","Front idler wheel for Bobcat T190"
```

**Download Template:**
```
GET /api/admin/products/import-template/idlers
```

---

## 🎯 Import Process

### What Happens During Import:

1. **File Validation**
   - Checks file type (CSV or Excel)
   - Validates required columns

2. **Format Detection**
   - Automatically detects product type based on columns
   - Applies appropriate column mapping

3. **Data Processing**
   - Extracts brand and machine model
   - Generates SKU if not provided
   - Parses prices and quantities
   - Creates SEO fields automatically

4. **Schema Generation**
   - Auto-generates JSON-LD schema markup
   - Creates structured data for search engines
   - Optimizes for SEO

5. **Database Operation**
   - Checks for existing products (by SKU)
   - Updates existing or creates new products
   - Returns success/error summary

---

## 📊 Import Results

After import, you'll receive:

```json
{
  "success": true,
  "message": "Import completed. 25 products imported/updated, 2 errors",
  "success_count": 25,
  "error_count": 2,
  "errors": [
    "Row 15: Invalid price format",
    "Row 23: Missing required field 'Part Number'"
  ]
}
```

---

## ✅ Best Practices

### Data Preparation
1. **Clean Data**
   - Remove extra spaces
   - Ensure consistent formatting
   - Validate prices (numeric values only)

2. **Brand Names**
   - Use exact brand names matching your database
   - Brands not found will be set to "Universal"

3. **SKUs**
   - Use unique SKUs for each product
   - Format: `TYPE-BRAND-MODEL` (e.g., RT-BOB-T190)

4. **Prices**
   - Use decimal format: 1299.99
   - Do not include currency symbols in CSV

5. **Descriptions**
   - Be detailed and specific
   - Include key features and benefits
   - Mention compatibility

### SEO Optimization
1. **Keywords**
   - Include brand, model, and product type
   - Add common search terms
   - Separate with commas

2. **Meta Descriptions**
   - Keep under 160 characters
   - Include primary keyword
   - Add call-to-action

3. **Titles**
   - Include brand and model
   - Add product type
   - Format: "Brand Model Product Type | Company Name"

---

## 🔧 Troubleshooting

### Common Issues

**Issue:** "Unrecognized file format"
- **Solution:** Ensure you're using the correct template for your product type
- Download fresh template from admin panel

**Issue:** "Invalid price format"
- **Solution:** Remove currency symbols and commas
- Use format: 1299.99 not $1,299.99

**Issue:** "Missing required field"
- **Solution:** Check all required columns are filled
- Don't leave mandatory fields empty

**Issue:** "Duplicate SKU"
- **Solution:** Existing products will be updated
- Ensure SKUs are unique if creating new products

**Issue:** "Brand not found"
- **Solution:** Add brand to database first or use existing brand names
- System will default to "Universal" for unknown brands

---

## 📁 File Requirements

### Supported Formats
- ✅ CSV (.csv)
- ✅ Excel (.xlsx, .xls)

### File Size Limits
- Maximum: 10MB
- Recommended: < 1000 products per file
- For larger imports, split into multiple files

### Encoding
- UTF-8 (recommended)
- ASCII

---

## 🎓 Examples

### Example 1: Import 50 Rubber Tracks
```csv
comp_name,machine_model,track_size,Price,eng_description,...
Bobcat,T190,450x86x56,1299.99,"Premium rubber track",...
Kubota,SVL95,400x72x74,1580.00,"High-performance track",...
[... 48 more rows]
```

### Example 2: Import Mixed Undercarriage Parts
```csv
Machine Model,ITEM,Part Number,SKU,Description,...
Bobcat T190,Bottom Roller,6813501,BR-BOB-T190,"Heavy-duty roller",...
Bobcat T190,Drive Sprocket,6813502,SPR-BOB-T190,"15-tooth sprocket",...
Bobcat T190,Front Idler,6813503,IDL-BOB-T190,"Front idler wheel",...
```

---

## 📞 Support

If you encounter issues:
1. Check this guide first
2. Verify your CSV format matches templates
3. Test with a small sample file (2-3 products)
4. Contact support with error messages

---

## 🔄 Updates

**Version 1.0** - Initial release
- Supports 4 product types
- Auto-detection of formats
- SEO auto-generation
- Schema markup creation

**Planned Features:**
- Image URL import
- Batch pricing updates
- Inventory sync
- Multi-language support

---

**Ready to import? Download your template and get started!**
