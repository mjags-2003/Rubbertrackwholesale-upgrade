# Search Functionality Guide - Rubber Track Wholesale

Complete guide for the search capabilities on your website.

## 🔍 Search Features

Your website includes powerful search functionality that allows customers to find products by:

1. **Machine Models** (e.g., "svl75", "kubota svl75", "T190")
2. **Rubber Track Sizes** (e.g., "400x86x52", "300x52.5x74", "450x86x56")
3. **Part Numbers** (e.g., "6813501", "V0515-25112")
4. **SKUs** (e.g., "RT-450-86-56", "BR-BOB-T190")
5. **Brand Names** (e.g., "Bobcat", "Kubota", "Caterpillar")
6. **Product Descriptions** (keywords like "bottom roller", "sprocket")

---

## 🎯 How Search Works

### Search Locations

The search functionality is available in **3 places**:

1. **Homepage Hero Section** - Large search bar at the top
2. **Navigation Bar** - Search icon in the header (click to expand)
3. **Products Page** - Dedicated search and filter section

---

## 📏 Rubber Track Size Search

### Supported Size Formats

The search handles ALL standard rubber track size formats:

#### Standard Format: **WidthxPitchxLinks**
```
400x86x52
450x86x56
320x86x50
```

#### With Decimal Pitch: **WidthxPitch.DecimalxLinks**
```
300x52.5x74
300x52.5x78
400x72.5x74
350x52.5x86
```

#### With Width Descriptors
```
300x52.5x82W    (Wide)
400x72.5x74N    (Narrow)
450x81x76W      (Wide)
```

### Search Examples

| Customer Types | Finds Products With Size |
|---------------|--------------------------|
| `400x86x52` | Exact match: 400x86x52 |
| `300x52.5x74` | Exact match with decimal |
| `400 x 86 x 52` | Finds 400x86x52 (spaces ignored) |
| `450x86` | All tracks starting with 450x86 |
| `52.5` | All tracks with 52.5mm pitch |

---

## 🚜 Machine Model Search

### How It Works

When a customer searches for a machine model, the system searches in:

1. **Product Title** (e.g., "Bobcat T190 Rubber Track")
2. **Machine Model Field** (stored in specifications)
3. **Compatible Models List** (fits_models field)
4. **Brand Name**

### Search Examples

| Customer Types | Results |
|---------------|---------|
| `svl75` | All Kubota SVL75 parts |
| `kubota svl75` | Same as above (brand + model) |
| `T190` | All Bobcat T190 parts |
| `bobcat t190` | Same as above |
| `247B` | Caterpillar 247B parts |
| `takeuchi tl8` | Takeuchi TL8 parts |

### Combined Searches

Customers can combine terms:

| Search Query | Finds |
|-------------|-------|
| `svl75 rubber track` | SVL75 rubber tracks only |
| `t190 roller` | Bobcat T190 rollers |
| `kubota sprocket` | All Kubota sprockets |
| `cat 247 idler` | Cat 247 idler wheels |

---

## 🔧 Part Number Search

### Types of Part Numbers Supported

1. **Manufacturer Part Numbers**
   - `6813501` (Bobcat)
   - `V0515-25112` (Kubota)
   - `248-6275` (Caterpillar)

2. **Alternate Part Numbers**
   - `6813501-ALT`
   - Stored in specifications

3. **Internal SKUs**
   - `RT-450-86-56` (Rubber Track)
   - `BR-BOB-T190` (Bottom Roller)
   - `SPR-KUB-SVL95` (Sprocket)
   - `IDL-CAT-247B` (Idler)

### Search Examples

| Customer Types | Finds |
|---------------|-------|
| `6813501` | Exact part number match |
| `V0515` | All Kubota V0515 series parts |
| `RT-450` | All rubber tracks with 450mm width |

---

## 🎨 Brand Search

Simple brand name searches:

| Search | Results |
|--------|---------|
| `Bobcat` | All Bobcat parts |
| `Kubota` | All Kubota products |
| `Cat` or `Caterpillar` | All Caterpillar parts |
| `Takeuchi` | All Takeuchi parts |

---

## ⚙️ Technical Implementation

### Backend Search Algorithm

```
Search Term: "kubota svl75"

The system searches in:
1. Product Title ✓
2. SKU ✓
3. Part Number ✓
4. Track Size ✓
5. Brand Name ✓
6. Description ✓
7. Machine Model (specifications) ✓
8. Compatible Models (specifications.fits_models) ✓
9. Alternate Part Numbers (specifications.alternate_parts) ✓
```

### Case Insensitive

All searches are **case-insensitive**:
- `KUBOTA SVL75` = `kubota svl75` = `Kubota Svl75`

### Normalization

For size searches, spaces are automatically removed:
- `400 x 86 x 52` → automatically matches `400x86x52`

---

## 📱 User Experience

### On Products Page

1. **Search Bar** at the top
2. **Filter by Brand** dropdown
3. **Filter by Category** dropdown
4. **Sort Options** (Price, Name, Featured)
5. **Results Count** displayed

### Real-time Filtering

When customers type:
- Results update as they type
- Shows number of products found
- Displays matching products instantly

---

## 💡 Search Tips for Customers

### Best Search Practices

1. **For Specific Machine:**
   - Type: "brand + model" (e.g., "kubota svl75")

2. **For Track Size:**
   - Type exact size: "400x86x52"
   - Or partial: "400x86" to see all variations

3. **For Product Type:**
   - Type: "model + type" (e.g., "t190 roller")

4. **Not Sure? Use Partial Terms:**
   - "400" → shows all 400mm width products
   - "bobcat" → shows all Bobcat parts
   - "roller" → shows all rollers

---

## 🔢 Common Size Formats in Database

Based on your price sheet, these formats are supported:

### Compact Track Loaders (CTL)
```
180x72x42    230x72x44    250x72x45
300x52.5x74  300x52.5x78  300x52.5x82W
300x52.5x84W 300x52.5x86W 300x55x88
320x86x49    320x86x50    320x86x52
320x86x53    350x52.5x86  350x54.5x86
350x55x88    400x72.5x72W 400x72.5x74N
400x72.5x74W 400x86x49    400x86x50
400x86x52    400x86x53    400x86x55
400x86x56    450x81x76W   450x81x78N
450x86x52    450x86x53    450x86x55
450x86x56    450x86x58    450x86x60
450x100x48   450x100x50
```

### Mini Excavators
```
180x72x42    180x72x45    230x72x44
250x72x45    300x52.5x74  300x52.5x78
```

All these formats are fully searchable!

---

## 🛠️ For Your Developer

### API Endpoints

**Standard Search:**
```
GET /api/products?search=kubota+svl75
GET /api/products?search=400x86x52
GET /api/products?search=6813501
```

**Advanced Search:**
```
GET /api/products/search/advanced?query=svl75
```

### Database Fields Searched

```javascript
{
  title: "Kubota SVL95 Rubber Track 400x72x74",
  sku: "RT-400-72-74",
  part_number: "V0611-28111",
  size: "400x72x74",
  brand: "Kubota",
  description: "High-performance rubber track...",
  specifications: {
    machine_model: "SVL95",
    fits_models: "Kubota SVL95, SVL97",
    alternate_parts: "V0515-ALT"
  }
}
```

All these fields are indexed for fast searching.

---

## ✅ Search Quality Assurance

### What Works

✅ Machine model searches (svl75, t190, 247b)  
✅ Brand searches (Bobcat, Kubota, Cat)  
✅ Size searches (400x86x52, 300x52.5x74)  
✅ Part number searches (6813501, V0515-25112)  
✅ SKU searches (RT-450-86-56)  
✅ Partial searches (400, bobcat, roller)  
✅ Combined searches (kubota roller, t190 track)  
✅ Case insensitive (KUBOTA = kubota)  
✅ Space insensitive for sizes (400 x 86 = 400x86)  

### Testing

Test these searches on your live site:
1. "kubota svl75"
2. "400x86x52"
3. "t190"
4. "bottom roller"
5. "300x52.5x74"
6. "bobcat"
7. "sprocket"

All should return relevant results!

---

## 📊 Search Analytics (Future Enhancement)

Consider tracking:
- Most searched terms
- Zero-result searches (to add missing products)
- Popular machine models
- Common size queries

This helps optimize inventory and product listings.

---

**Your search functionality is production-ready and handles all common customer search patterns!**
