export const phase3Chapters = [
  {
    id: "CH-DNA-013",
    courseId: "CRS-DNA-001",
    title: "Data Visualization Psychology & Gestalt Principles",
    order: 13,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=k423X7jK5yI",
    content: `# Data Visualization Psychology & Gestalt Principles

### Learning Objectives
1. Understand how human visual perception processes graphical data via the Visual Cortex.
2. Master Pre-attentive Visual Attributes: Position, Length, Direction, Angle, Area, and Color.
3. Apply Edward Tufte's Data-to-Ink Ratio to eliminate chart clutter.
4. Leverage Gestalt Principles of Visual Perception: Proximity, Similarity, Enclosure, and Continuity.

---

### 1. The Pre-Attentive Processing Hierarchy

Visual processing occurs in the human brain within 200 milliseconds—before conscious thought begins.
Cleveland & McGill's seminal research ranked how accurately humans perceive quantitative data across visual channels:

\`\`\`
   MOST ACCURATE   1. Position along a common scale (Bar charts, Scatter plots)
         |         2. Position along non-aligned scales (Small multiples)
         v         3. Length (Stacked bars)
         |         4. Direction / Slope (Line charts)
         v         5. Angle (Pie charts - Hard to discern subtle differences!)
         |         6. Area (Bubble charts - Humans underestimate circle area!)
   LEAST ACCURATE  7. Volume / 3D Perspective (Avoid 3D charts completely!)
                   8. Color Saturation & Hue (Heatmaps - Subjective intensity)
\`\`\`

**Key Takeaway**: Always prioritize **Position** and **Length** over Area and Angle for quantitative precision. This is why bar charts consistently outperform pie charts for decision-making.

---

### 2. Edward Tufte's Data-to-Ink Ratio

$$\\text{Data-to-Ink Ratio} = \\frac{\\text{Data-Ink}}{\\text{Total Ink Used to Print the Graphic}}$$

Where **Data-Ink** is the non-erasable core of a graphic: the ink that represents empirical numbers.

\`\`\`
   CHARTJUNK (Low Data-Ink Ratio):
   - Heavy 3D gradients and drop shadows.
   - Dark, heavy background grid lines.
   - Redundant color schemes (using 10 colors for 10 bars).
   - Verbose labels and repeating axis decimals ($10.00, $20.00).

   ELEGANT DESIGN (High Data-Ink Ratio):
   - Light or removed grid lines.
   - Direct data labeling, removing redundant legends.
   - Purposeful, strategic use of a single accent color for emphasis.
\`\`\`

---

### 3. Gestalt Principles in Dashboard Design

1. **Proximity**: Elements placed close together are perceived as belonging to the same group. (Group related KPI cards together).
2. **Similarity**: Elements sharing the same color, shape, or size are perceived as related. (Use consistent colors for metrics across views).
3. **Enclosure**: Surrounding elements with a border or background shading creates an immediate visual boundary. (Card containers).
4. **Continuity**: The eye naturally follows smooth paths and lines rather than abrupt turns. (Continuous time-series lines).

---

### 4. Color Theory in Business Analytics

Never use color purely for decorative beauty. Use color functionally:
- **Sequential Palette**: Single hue ranging from light to dark (e.g. Population density from light blue to deep navy).
- **Diverging Palette**: Two contrasting hues diverging from a neutral midpoint (e.g. Profit/Loss: deep red for negative, gray at zero, deep green for positive).
- **Categorical Palette**: Distinct hues for unordered categories (e.g. Product departments: Tech, Furniture, Apparel).
- **Colorblind Safe**: Never rely on Red/Green contrast alone without secondary symbols or labels (8% of males have deuteranopia!).

---

### 5. Hands-on Lab: Chartjunk Elimination
1. Take an overcrowded, cluttered legacy Excel dashboard.
2. Remove heavy borders, 3D effects, and redundant grid lines.
3. Apply a strategic accent color to highlight the underperforming sales region.`
  },
  {
    id: "CH-DNA-014",
    courseId: "CRS-DNA-001",
    title: "Interactive Python Visualizations: Seaborn & Plotly",
    order: 14,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=F3zWw4Zp8sM",
    content: `# Interactive Python Visualizations: Seaborn & Plotly

### Learning Objectives
1. Build publication-quality statistical charts using Seaborn.
2. Construct interactive, web-based visual dashboards using Plotly Express and Graph Objects.
3. Master multi-panel Facet Grids and categorical small multiples.
4. Implement rich tooltip hover interactions, zoom/pan controls, and animation frames.

---

### 1. Seaborn: Statistical Storytelling

Seaborn operates directly on Pandas DataFrames, aggregating and computing confidence intervals automatically:

\`\`\`python
import seaborn as sns
import matplotlib.pyplot as plt

# Load sample dataset
tips = sns.load_dataset("tips")

# 1. Categorical Violin Plot with Split Hue
plt.figure(figsize=(10, 6))
sns.violinplot(
    data=tips, 
    x="day", 
    y="total_bill", 
    hue="sex", 
    split=True, 
    palette="Set2"
)
plt.title("Bill Distribution Across Days by Gender")
plt.show()

# 2. Linear Regression with Confidence Bands
sns.lmplot(
    data=tips, 
    x="total_bill", 
    y="tip", 
    hue="smoker", 
    aspect=1.5, 
    scatter_kws={'alpha': 0.6}
)
plt.title("Tip vs Total Bill with Fitted Regression Line")
plt.show()
\`\`\`

---

### 2. Plotly Express: Modern Interactive Dashboards

While Seaborn creates static raster images, **Plotly** generates interactive D3.js and WebGL visualizations directly in browser environments:

\`\`\`python
import plotly.express as px

# Interactive Scatter Plot with Hover Tooltips and Facets
fig = px.scatter(
    df, 
    x="ad_spend", 
    y="revenue", 
    size="conversions", 
    color="marketing_channel",
    hover_name="campaign_title",
    hover_data=["cpa", "roas"],
    facet_col="region",
    log_x=True,
    title="Marketing Campaign ROAS by Channel & Region",
    template="plotly_white"
)

# Customize layout
fig.update_layout(
    font_family="Inter, sans-serif",
    title_font_size=20,
    hoverlabel=dict(bgcolor="white", font_size=14)
)

fig.show()
\`\`\`

---

### 3. Plotly Sunburst & Treemaps: Hierarchical Breakdown

For multi-level budget and revenue breakdowns, hierarchical charts reveal nested distributions effortlessly:

\`\`\`python
# Hierarchical Sales Breakdown
fig = px.sunburst(
    df, 
    path=['global_region', 'country', 'product_category'], 
    values='sales_usd',
    color='profit_margin', 
    color_continuous_scale='RdYlGn',
    title="Global Revenue Hierarchy & Profit Margins"
)
fig.show()
\`\`\`

---

### 4. Hands-on Lab: Interactive Product Portfolio Dashboard
1. Load an enterprise multi-channel e-commerce dataset.
2. Build an interactive Plotly scatter matrix analyzing Price vs. Quantity vs. Rating.
3. Configure slider-driven animations across monthly timeframes.`
  },
  {
    id: "CH-DNA-015",
    courseId: "CRS-DNA-001",
    title: "Tableau Desktop Architecture & Visual Analytics",
    order: 15,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=VywxIQ2ZXw4",
    content: `# Tableau Desktop Architecture & Visual Analytics

### Learning Objectives
1. Understand Tableau's foundational concepts: Dimensions (Blue) vs. Measures (Green), Discrete vs. Continuous.
2. Master Tableau's Order of Operations (The Pipeline of Filters).
3. Author advanced Level of Detail (LOD) expressions: \`{FIXED}\`, \`{INCLUDE}\`, and \`{EXCLUDE}\`.
4. Construct interactive executive dashboards with Actions (Filter, Highlight, URL) and Parameter controls.

---

### 1. Blue vs. Green: The Fundamental Tableau Mental Model

One of the most pervasive misconceptions among beginner Tableau users is believing Blue means Dimension and Green means Measure:

| Visual Pill Color | Technical Meaning | How It Renders on the Sheet |
| :--- | :--- | :--- |
| **BLUE (Discrete)** | Finite values, distinct categories. | Creates distinct **Row or Column Headers** and partitions views. |
| **GREEN (Continuous)**| Infinite unbroken spectrum of numbers. | Creates continuous **Numeric Axes** with marks positioned along scales. |

*Reality*: A Dimension can be Continuous (e.g. a continuous date axis), and a Measure can be Discrete (e.g. discrete aggregated profit buckets)!

---

### 2. Tableau's Order of Operations

Understanding filter evaluation order prevents critical calculation errors in dashboards:

\`\`\`
   1. EXTRACT FILTERS           (Filters data before writing to .hyper extract)
          |
          v
   2. DATA SOURCE FILTERS       (Restricts rows across the entire workbook)
          |
          v
   3. CONTEXT FILTERS           (Creates temporary table; overrides FIXED LODs!)
          |
          v
   4. {FIXED} LOD EXPRESSIONS   (Evaluated BEFORE dimension filters!)
          |
          v
   5. DIMENSION FILTERS         (Standard sheet filters)
          |
          v
   6. {INCLUDE / EXCLUDE} LODs  (Evaluated with view dimensions)
          |
          v
   7. MEASURE FILTERS           (Filters based on aggregate values: SUM(Sales) > 1000)
          |
          v
   8. TABLE CALCULATION FILTERS (Hides marks without filtering data out of totals!)
\`\`\`

---

### 3. Level of Detail (LOD) Expressions Decoded

LOD expressions allow computing aggregations at a different level of granularity than the current visualization display:

#### A. FIXED LOD
Computes an aggregation using ONLY the specified dimensions, completely ignoring the dimensions on the visual sheet:
\`\`\`tableau
// Customer Lifetime Spend (regardless of order date or product in view)
{ FIXED [Customer ID] : SUM([Sales]) }
\`\`\`

#### B. EXCLUDE LOD
Computes aggregations while omitting a specific dimension that is actively displayed on the sheet:
\`\`\`tableau
// Monthly Sales total excluding Region breakdown
{ EXCLUDE [Region] : SUM([Sales]) }
\`\`\`

#### C. INCLUDE LOD
Computes aggregations at a finer level of detail than displayed on the sheet:
\`\`\`tableau
// Average customer spend per state (aggregates at customer level first!)
AVG({ INCLUDE [Customer ID] : SUM([Sales]) })
\`\`\`

---

### 4. Hands-on Lab: Customer Cohort Dashboard in Tableau
1. Connect to Superstore dataset.
2. Build a \`{FIXED [Customer ID] : MIN([Order Date])}\` calculated field to determine Customer Acquisition Date.
3. Build a cohort matrix visual displaying sales volume over time by customer cohort.`
  },
  {
    id: "CH-DNA-016",
    courseId: "CRS-DNA-001",
    title: "Power BI & DAX Mastery: Measures, Context & Modeling",
    order: 16,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=0h3jO5BhnqE",
    content: `# Power BI & DAX Mastery: Measures, Context & Modeling

### Learning Objectives
1. Understand the Power BI architecture: Power Query (M Language), Data Model (VertiPaq Engine), and DAX.
2. Differentiate Calculated Columns (Row Context) vs. DAX Measures (Filter Context).
3. Master the \`CALCULATE()\` function: Context Transition and filter modification.
4. Implement Time Intelligence functions: \`YTD\`, \`SAMEPERIODLASTYEAR\`, and Rolling Averages.

---

### 1. The Power BI Engine: VertiPaq Columnar Storage

Power BI stores data in an in-memory columnar database called the **VertiPaq Engine**:
- Compresses tables up to 10x using dictionary encoding and run-length encoding (RLE).
- Star Schemas perform dramatically faster than wide flat tables.
- **Rule of Thumb**: Build Star Schemas with 1-to-Many (\`1:*\`) single-direction relationships between Dimensions and Facts.

---

### 2. Calculated Columns vs. DAX Measures

| Characteristic | Calculated Column | DAX Measure |
| :--- | :--- | :--- |
| **When Evaluated** | At data refresh time; stored permanently in RAM. | Dynamically at query time as users click slicers and filter cards. |
| **Context** | **Row Context**: Evaluates row-by-row on the table. | **Filter Context**: Evaluates over the aggregated subset of active filters. |
| **RAM Impact** | High: Consumes RAM on disk and memory for every row. | Zero: Consumes CPU during rendering, then disappears. |
| **Best Practice** | Use strictly for slicer categories or dimension keys. | Use for 100% of numerical calculations (Sums, Averages, Ratios). |

---

### 3. The Power of CALCULATE(): Modifying Filter Context

\`CALCULATE()\` is the single most important function in DAX. It evaluates an expression under modified filter conditions:

\`\`\`dax
-- 1. Base Measure
Total Sales = SUM(fact_orders[sales_amount])

-- 2. Modifying Filter Context: Filter only European Orders
Europe Sales = 
CALCULATE(
    [Total Sales],
    dim_geography[continent] = "Europe"
)

-- 3. Overriding All Slicers to Compute % of Total
All Region Sales = 
CALCULATE(
    [Total Sales],
    ALL(dim_geography)
)

Sales Contribution Pct = 
DIVIDE([Total Sales], [All Region Sales], 0)
\`\`\`

---

### 4. DAX Time Intelligence

To use Time Intelligence, your model must contain a dedicated, continuous **Date Dimension** marked as a Date Table:

\`\`\`dax
-- Year-to-Date (YTD) Revenue
Sales YTD = 
TOTALYTD([Total Sales], dim_date[Date])

-- Prior Year Sales (Same Period Last Year)
Sales SPLY = 
CALCULATE(
    [Total Sales],
    SAMEPERIODLASTYEAR(dim_date[Date])
)

-- Year-over-Year (YoY) Growth Percentage
YoY Growth Pct = 
DIVIDE([Total Sales] - [Sales SPLY], [Sales SPLY], 0)
\`\`\`

---

### 5. Hands-on Lab: Enterprise Executive P&L Dashboard
1. Model a financial star schema connecting \`fact_gl_entries\` to \`dim_account\` and \`dim_calendar\`.
2. Author DAX measures for Gross Profit, Operating Margin, and YoY Growth.
3. Build dynamic card visuals that turn red if YoY performance drops below target.`
  },
  {
    id: "CH-DNA-017",
    courseId: "CRS-DNA-001",
    title: "Geospatial Analytics & Location Intelligence",
    order: 17,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=wX0kY748p1k",
    content: `# Geospatial Analytics & Location Intelligence

### Learning Objectives
1. Understand geospatial data structures: Vector data (Points, Lines, Polygons) vs. Raster grids.
2. Master geospatial formats: GeoJSON, Shapefiles, WKT (Well-Known Text), and Spatial Coordinates (WGS84 EPSG:4326).
3. Execute spatial joins and distance calculations using Python \`geopandas\` and PostGIS SQL.
4. Construct Choropleth maps, Hexbin aggregations, and density heatmaps.

---

### 1. Vector Geometries & Coordinate Reference Systems (CRS)

Geospatial analytics attaches physical geographic locations to institutional records:

\`\`\`
   GEOSPATIAL VECTOR DATA:
   - POINT:      (Latitude, Longitude) -> Customer delivery address, ATM location.
   - LINESTRING: Sequence of points    -> Delivery driver route, pipeline, road.
   - POLYGON:    Closed boundary ring  -> Sales territory, ZIP code, country border.
\`\`\`

#### Coordinate Reference Systems (CRS):
- **WGS 84 (EPSG:4326)**: Global standard GPS coordinates in decimal degrees (Latitude: -90 to +90, Longitude: -180 to +180).
- **Web Mercator (EPSG:3857)**: Projected metric coordinates used by Google Maps, Mapbox, and OpenStreetMap.

---

### 2. Spatial Analysis in Python with GeoPandas

\`\`\`python
import geopandas as gpd
from shapely.geometry import Point

# Load customer points from CSV
df['geometry'] = df.apply(lambda row: Point(row['longitude'], row['latitude']), axis=1)
customers_gdf = gpd.GeoDataFrame(df, geometry='geometry', crs="EPSG:4326")

# Load sales territory polygon boundaries from GeoJSON
territories_gdf = gpd.read_file("sales_territories.geojson")

# Execute Spatial Join (Point-in-Polygon check)
# Maps each customer to their exact sales territory polygon!
joined_gdf = gpd.sjoin(customers_gdf, territories_gdf, how="inner", predicate="within")

# Group revenue by territory polygon
territory_summary = joined_gdf.groupby('territory_name')['order_amount'].sum()
print(territory_summary)
\`\`\`

---

### 3. Spatial SQL with PostGIS

PostGIS extends PostgreSQL with native spatial index support (R-Tree / GIST) and spatial operators:

\`\`\`sql
-- Find all customers located within a 5-mile radius (8,046 meters) of Store #42
SELECT 
    c.customer_id,
    c.full_name,
    ROUND(ST_Distance(c.geom, s.geom)::numeric, 2) AS distance_meters
FROM customers c
CROSS JOIN stores s
WHERE s.store_id = 42
  AND ST_DWithin(c.geom, s.geom, 8046.72)
ORDER BY distance_meters ASC;
\`\`\`

---

### 4. Hands-on Lab: Retail Territory Optimization
1. Ingest a GeoJSON boundary file of regional sales zones.
2. Ingest 50,000 store transaction coordinates.
3. Perform a spatial join, generate a Choropleth revenue map in Plotly/Mapbox, and locate retail expansion cold spots.`
  },
  {
    id: "CH-DNA-018",
    courseId: "CRS-DNA-001",
    title: "Self-Service BI Architecture & Governance: Semantic Layers",
    order: 18,
    estimatedMinutes: 50,
    videoUrl: "https://www.youtube.com/watch?v=scEDHsr3APg",
    content: `# Self-Service BI Architecture & Governance: Semantic Layers

### Learning Objectives
1. Define the Semantic Layer and explain why it eliminates metric discrepancies across enterprise teams.
2. Compare centralized semantic architectures: Power BI Datamarts, Tableau Data Models, Cube, and dbt Semantic Layer.
3. Implement Row-Level Security (RLS) and Column-Level Security (CLS) for role-based data governance.
4. Optimize BI query performance: DirectQuery vs. In-Memory Import vs. Hybrid Dual Storage.

---

### 1. The Metric Discrepancy Crisis: Why Semantic Layers?

In ungoverned organizations, every department calculates "Revenue" or "Active Customer" differently:
- Marketing defines Active Customer as: *"Logged in within last 30 days"*.
- Sales defines Active Customer as: *"Completed a transaction within last 90 days"*.
- Finance defines Active Customer as: *"Has an active paid contract"*.

When executives meet, 40% of meeting time is wasted arguing over whose Excel spreadsheet is correct!

\`\`\`
   UNGOVERNED (Siloed Definitions):
   [ Marketing Tableau ] ---> Custom SQL: Revenue = Amount - Discount
   [ Sales Power BI ]    ---> Custom SQL: Revenue = Amount (Gross!)
   [ Finance Excel ]     ---> Custom SQL: Revenue = Amount - Discount - Refund - Tax
   (Result: 3 different numbers for the same month!)

   GOVERNED SEMANTIC LAYER:
   +-------------------------------------------------------------+
   |                CENTRALIZED SEMANTIC LAYER                   |
   | Metric: "Net Revenue" = Sum(Sales) - Sum(Returns) - Taxes   |
   | Canonical Dimensions: Customer, Product, Date               |
   +------------------------------+------------------------------+
                                  | Serves unified truth to
        +-------------------------+-------------------------+
        v                                                   v
   [ Power BI ]                  [ Tableau ]           [ Python / Hex ]
\`\`\`

---

### 2. Row-Level Security (RLS) Implementation

Row-Level Security restricts data access based on the authenticated user's role and identity:

\`\`\`dax
-- DAX RLS Filter Rule on dim_geography:
-- Ensures Regional Directors only see data from their assigned territory!
dim_geography[region_manager_email] = USERPRINCIPALNAME()
\`\`\`

#### Dynamic RLS Security Table Pattern:
1. Maintain a security mapping table in the data warehouse: \`user_security (email, allowed_region_id)\`.
2. Join to dimension tables with a 1-to-many relationship.
3. Apply single filter rule: \`user_security[email] = USERPRINCIPALNAME()\`. Power BI filters all downstream fact tables automatically!

---

### 3. Storage Modes: Import vs. DirectQuery vs. Composite

| Storage Mode | Mechanism | Latency | Data Freshness | Maximum Size |
| :--- | :--- | :--- | :--- | :--- |
| **Import Mode** | Caches data directly into VertiPaq memory. | Microseconds (Ultra-fast). | Scheduled refresh (e.g. 8x daily). | Limited by RAM capacity. |
| **DirectQuery** | Sends live SQL queries to cloud warehouse on every click. | Seconds (Dependent on warehouse speed). | Real-Time (Immediate). | Unlimited (Petabyte scale). |
| **Dual / Composite**| Dimension tables in Import; high-volume Fact table in DirectQuery. | Balanced hybrid. | Real-Time for facts; fast slicers for dimensions. | Scalable. |

---

### 4. Hands-on Lab: Enterprise Governance Setup
1. Configure dynamic Row-Level Security (RLS) using \`USERPRINCIPALNAME()\`.
2. Test role impersonation across North American and European regional managers.
3. Certify a gold-standard shared semantic model for institutional self-service reporting.`
  }
];

export const phase3Assessments = [
  {
    id: "ASM-DNA-013",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-013",
    title: "Assessment: Data Visualization Psychology & Gestalt",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-013-01",
        text: "According to Cleveland & McGill's perceptual hierarchy, which visual channel enables the human visual cortex to judge quantitative values with the HIGHEST precision?",
        options: [
          "Position along a common scale (e.g. Bar charts, Scatter plots)",
          "Area of a circle (Bubble charts)",
          "Angle / Slice size (Pie charts)",
          "Color saturation intensity"
        ],
        correctAnswer: 0,
        explanation: "Position along a common scale is decoded by the visual cortex with the highest quantitative accuracy."
      },
      {
        id: "Q-DNA-013-02",
        text: "What does Edward Tufte's 'Data-to-Ink Ratio' advocate for in visualization design?",
        options: [
          "Maximizing the proportion of ink/pixels dedicated to displaying actual empirical data while removing non-data chartjunk",
          "Using as much decorative color and background shading as possible",
          "Printing charts on heavy expensive paper",
          "Adding 3D effects to all charts"
        ],
        correctAnswer: 0,
        explanation: "High data-to-ink ratios prioritize data clarity by eliminating redundant grid lines, 3D effects, and visual noise."
      },
      {
        id: "Q-DNA-013-03",
        text: "Which Gestalt principle states that visual elements enclosed within a boundary or shaded card are perceived as belonging to a unified group?",
        options: ["Principle of Enclosure", "Principle of Proximity", "Principle of Similarity", "Principle of Closure"],
        correctAnswer: 0,
        explanation: "Enclosure groups elements using visual boundaries (borders or background container shading)."
      },
      {
        id: "Q-DNA-013-04",
        text: "Why are 3D bar charts and 3D pie charts strongly discouraged in professional business analytics?",
        options: [
          "False perspective distortion makes it nearly impossible for the human eye to accurately judge bar heights and slice proportions",
          "3D charts use too much computer memory",
          "3D charts are illegal in corporate reporting",
          "Color monitors cannot render 3D"
        ],
        correctAnswer: 0,
        explanation: "Perspective angles distort visual geometry, making reliable quantitative comparisons impossible."
      },
      {
        id: "Q-DNA-013-05",
        text: "What type of color palette should be used to visualize a Net Profit metric that ranges from negative losses to positive gains with zero as a midpoint?",
        options: ["Diverging color palette (e.g. Red to Gray to Green)", "Sequential single-hue palette", "Rainbow categorical palette", "Monochrome black only"],
        correctAnswer: 0,
        explanation: "Diverging palettes highlight deviations in both directions from a critical central neutral midpoint (zero)."
      },
      {
        id: "Q-DNA-013-06",
        text: "Why is relying solely on Red vs. Green color contrast problematic in executive dashboards?",
        options: [
          "Approximately 8% of men have red-green color vision deficiency (deuteranopia/protanopia), making them unable to distinguish the colors",
          "Red and green ink is more expensive",
          "Computers cannot process green pixels",
          "Red and green are reserved for holiday themes"
        ],
        correctAnswer: 0,
        explanation: "Colorblind-accessible design uses Blue/Orange or accompanies color with text labels and directional icons."
      },
      {
        id: "Q-DNA-013-07",
        text: "What is a 'Pre-attentive Attribute' in visual perception?",
        options: [
          "A visual property (like length, color, or spatial position) processed automatically by sensory memory in under 200ms before conscious focus",
          "A title placed before the chart",
          "An email sent to executives before a meeting",
          "An alert notification"
        ],
        correctAnswer: 0,
        explanation: "Pre-attentive attributes are processed subconsciously by the visual cortex before cognitive attention kicks in."
      },
      {
        id: "Q-DNA-013-08",
        text: "Which Gestalt principle states that objects located close to one another are perceived as related or part of the same category?",
        options: ["Principle of Proximity", "Principle of Continuity", "Principle of Symmetry", "Principle of Contrast"],
        correctAnswer: 0,
        explanation: "Proximity dictates that spatial closeness implies functional or categorical relationship."
      },
      {
        id: "Q-DNA-013-09",
        text: "When is a Pie Chart acceptable in business reporting?",
        options: [
          "When displaying 2 or 3 distinct categories with starkly different proportions (e.g. 75% vs 25%) that sum to exactly 100%",
          "When comparing 25 product categories",
          "When tracking time-series trends over 12 months",
          "Pie charts should never be used under any circumstances"
        ],
        correctAnswer: 0,
        explanation: "Pie charts work only for simple part-to-whole comparisons with 2–3 clearly distinct slices summing to 100%."
      },
      {
        id: "Q-DNA-013-10",
        text: "What is 'Chartjunk' in Edward Tufte's terminology?",
        options: [
          "Unnecessary visual embellishments (heavy dark grids, clip art, faux 3D shadows) that distract from the data numbers",
          "A broken chart file",
          "A chart created in Python",
          "A chart that contains zero rows"
        ],
        correctAnswer: 0,
        explanation: "Chartjunk refers to non-essential visual elements that add visual clutter without conveying data."
      }
    ]
  },
  {
    id: "ASM-DNA-014",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-014",
    title: "Assessment: Interactive Visualizations with Seaborn & Plotly",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-014-01",
        text: "What is the primary difference between Seaborn visualizations and Plotly visualizations in Python?",
        options: [
          "Seaborn outputs static raster/vector graphics via Matplotlib; Plotly generates interactive, web-based D3.js/WebGL charts with tooltips and zoom controls",
          "Seaborn is for mobile apps; Plotly is for desktop",
          "Plotly cannot render bar charts",
          "Seaborn was discontinued in 2020"
        ],
        correctAnswer: 0,
        explanation: "Plotly builds interactive web-ready visual components with pan, zoom, and hover capabilities; Seaborn creates static figures."
      },
      {
        id: "Q-DNA-014-02",
        text: "What type of chart in Seaborn combines a box plot with a kernel density estimation (KDE) plot to show distribution shape?",
        options: ["Violin Plot (sns.violinplot)", "Heatmap", "Pairplot", "Rug Plot"],
        correctAnswer: 0,
        explanation: "Violin plots display both summary quartiles and the continuous probability density shape of the distribution."
      },
      {
        id: "Q-DNA-014-03",
        text: "What Plotly Express chart type is ideal for visualizing multi-level nested category hierarchies (such as Region -> Country -> Category)?",
        options: ["px.sunburst() or px.treemap()", "px.scatter()", "px.line()", "px.histogram()"],
        correctAnswer: 0,
        explanation: "Sunburst and Treemap charts visualize hierarchical parent-child relationships and nested metric shares."
      },
      {
        id: "Q-DNA-014-04",
        text: "How do you customize hover tooltip labels in Plotly Express to show custom metrics (e.g. ROAS, CPA)?",
        options: [
          "Using the 'hover_data=['roas', 'cpa']' parameter in the Plotly Express function",
          "Editing the computer display settings",
          "Plotly tooltips cannot be customized",
          "Using CSS stylesheets in Python"
        ],
        correctAnswer: 0,
        explanation: "'hover_data' specifies additional dataframe columns rendered into interactive tooltip cards on hover."
      },
      {
        id: "Q-DNA-014-05",
        text: "What Seaborn method automatically plots pairwise bivariate scatterplots and univariate diagonal histograms across all numerical columns?",
        options: ["sns.pairplot()", "sns.catplot()", "sns.jointplot()", "sns.relplot()"],
        correctAnswer: 0,
        explanation: "'sns.pairplot()' visualizes pairwise relationships across multidimensional datasets in a single grid."
      },
      {
        id: "Q-DNA-014-06",
        text: "What feature in Plotly Express allows animating data across time or dates using an interactive play/pause slider?",
        options: [
          "Passing the timeframe column to 'animation_frame=' (e.g. animation_frame='year')",
          "Exporting to an MP4 video file",
          "Creating a GIF in Photoshop",
          "Plotly cannot animate data"
        ],
        correctAnswer: 0,
        explanation: "'animation_frame' generates interactive temporal animation controls and timeline sliders."
      },
      {
        id: "Q-DNA-014-07",
        text: "What Seaborn plot shows a linear regression model fit along with a 95% bootstrap confidence band automatically?",
        options: ["sns.regplot() or sns.lmplot()", "sns.barplot()", "sns.boxplot()", "sns.countplot()"],
        correctAnswer: 0,
        explanation: "Regplot/lmplot fits a linear regression line accompanied by shaded bootstrap confidence intervals."
      },
      {
        id: "Q-DNA-014-08",
        text: "What does 'facet_col' do in Plotly Express?",
        options: [
          "Creates small multiples (multi-panel subplots) broken down across the categories of the specified column",
          "Changes the color of the chart",
          "Deletes columns from the dataframe",
          "Exports the chart to CSV"
        ],
        correctAnswer: 0,
        explanation: "'facet_col' partitions visualizations into small-multiple columns based on categorical values."
      },
      {
        id: "Q-DNA-014-09",
        text: "How can a Plotly interactive chart be exported as a standalone, zero-dependency HTML file to share with stakeholders?",
        options: [
          "fig.write_html('dashboard.html')",
          "fig.save_as_pdf()",
          "fig.to_png()",
          "fig.export_code()"
        ],
        correctAnswer: 0,
        explanation: "'fig.write_html()' bundles the interactive chart, D3.js engine, and data into an offline HTML file."
      },
      {
        id: "Q-DNA-014-10",
        text: "What color palette parameter in Seaborn represents continuous values diverging from a central neutral point?",
        options: ["cmap='coolwarm' or cmap='vlag'", "palette='bright'", "palette='pastel'", "palette='dark'"],
        correctAnswer: 0,
        explanation: "Coolwarm and vlag provide diverging color gradients ideal for visualizing correlation matrices and positive/negative balances."
      }
    ]
  },
  {
    id: "ASM-DNA-015",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-015",
    title: "Assessment: Tableau Desktop Architecture & Visual Analytics",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-015-01",
        text: "In Tableau Desktop, what does a GREEN field pill indicate compared to a BLUE field pill?",
        options: [
          "Green indicates Continuous (creates an unbroken numeric axis); Blue indicates Discrete (creates distinct row/column headers)",
          "Green indicates a Dimension; Blue indicates a Measure",
          "Green means the field is validated; Blue means it contains errors",
          "Green fields are integers; Blue fields are text"
        ],
        correctAnswer: 0,
        explanation: "Green represents Continuous values (axes); Blue represents Discrete categories (headers)."
      },
      {
        id: "Q-DNA-015-02",
        text: "In Tableau's Order of Operations, which filter type is evaluated BEFORE {FIXED} Level of Detail (LOD) expressions?",
        options: ["Context Filters", "Dimension Filters", "Measure Filters", "Table Calculation Filters"],
        correctAnswer: 0,
        explanation: "Context Filters create temporary index tables that filter data prior to evaluating FIXED LOD expressions."
      },
      {
        id: "Q-DNA-015-03",
        text: "What does the Level of Detail expression '{ FIXED [Customer ID] : SUM([Sales]) }' compute?",
        options: [
          "The total lifetime sales for each customer, regardless of what dimensions or dates are displayed on the visual sheet",
          "The average sales across all customers",
          "Only sales from customer #1",
          "An error"
        ],
        correctAnswer: 0,
        explanation: "FIXED LODs calculate metrics strictly at the declared dimension level, independent of visual sheet granularity."
      },
      {
        id: "Q-DNA-015-04",
        text: "Which LOD expression computes an aggregation at a FINER level of detail than currently displayed on the sheet?",
        options: ["{ INCLUDE ... }", "{ EXCLUDE ... }", "{ FIXED ... }", "{ ATTR ... }"],
        correctAnswer: 0,
        explanation: "'INCLUDE' adds specified dimensions to the view level of detail for intermediate calculations."
      },
      {
        id: "Q-DNA-015-05",
        text: "What is a 'Table Calculation' in Tableau (e.g. Running Total, Percent of Total)?",
        options: [
          "A calculation computed locally in memory across the aggregate marks rendered in the visual cache, evaluated at the end of the pipeline",
          "A calculation performed on the database server before data extraction",
          "A SQL DDL script",
          "A Microsoft Excel formula"
        ],
        correctAnswer: 0,
        explanation: "Table calculations execute locally on visual marks in the Tableau engine after database query return."
      },
      {
        id: "Q-DNA-015-06",
        text: "What file extension is used for a packaged Tableau workbook that bundles both sheets and the underlying data extract (.hyper)?",
        options: [".twbx", ".twb", ".hyper", ".tds"],
        correctAnswer: 0,
        explanation: ".twbx is a zipped archive containing the workbook definition (.twb) and embedded data extract (.hyper)."
      },
      {
        id: "Q-DNA-015-07",
        text: "What dashboard action allows clicking a bar in Chart A to automatically filter the data displayed in Chart B?",
        options: ["Filter Action", "Highlight Action", "Go to URL Action", "Set Action"],
        correctAnswer: 0,
        explanation: "Filter Actions pass clicked dimensional values as interactive filter parameters to target sheets."
      },
      {
        id: "Q-DNA-015-08",
        text: "What is a 'Parameter' in Tableau?",
        options: [
          "A global dynamic variable (number, date, string) that users can adjust to alter calculated fields, filters, and reference lines",
          "A database password",
          "A fixed column in a database table",
          "A font styling setting"
        ],
        correctAnswer: 0,
        explanation: "Parameters provide dynamic user inputs that drive calculated fields, reference lines, and what-if scenarios."
      },
      {
        id: "Q-DNA-015-09",
        text: "Which LOD expression computes an aggregation while purposefully ignoring a specific dimension that is actively displayed on the visual sheet?",
        options: ["{ EXCLUDE [Dimension] : ... }", "{ INCLUDE ... }", "{ FIXED ... }", "{ IGNORE ... }"],
        correctAnswer: 0,
        explanation: "'EXCLUDE' removes specified visual dimensions to compute higher-level summary ratios."
      },
      {
        id: "Q-DNA-015-10",
        text: "What high-performance in-memory database engine powers Tableau extract files (.hyper)?",
        options: ["Hyper engine", "VertiPaq", "MySQL", "SQLite"],
        correctAnswer: 0,
        explanation: "Tableau's Hyper engine is an in-memory columnar data engine optimized for rapid analytics."
      }
    ]
  },
  {
    id: "ASM-DNA-016",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-016",
    title: "Assessment: Power BI & DAX Mastery",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-016-01",
        text: "In Power BI, what is the fundamental difference between a Calculated Column and a DAX Measure?",
        options: [
          "Calculated Columns evaluate row-by-row during refresh and consume RAM; Measures evaluate dynamically at query time based on active Filter Context",
          "Measures are written in SQL; Calculated Columns are written in Python",
          "Calculated Columns cannot be used in charts",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "Calculated columns store precomputed values in memory; measures compute dynamically on the fly based on user filters."
      },
      {
        id: "Q-DNA-016-02",
        text: "What is the single most important DAX function used to modify, override, or clear active Filter Context?",
        options: ["CALCULATE()", "SUM()", "FILTER()", "RELATED()"],
        correctAnswer: 0,
        explanation: "'CALCULATE(expression, filter1, filter2...)' evaluates expressions under modified filter contexts."
      },
      {
        id: "Q-DNA-016-03",
        text: "What in-memory columnar database engine powers Power BI datasets and tabular models?",
        options: ["VertiPaq Engine", "Hyper Engine", "InnoDB", "PostGIS"],
        correctAnswer: 0,
        explanation: "Microsoft's VertiPaq engine compresses and scans tabular data in columnar memory format."
      },
      {
        id: "Q-DNA-016-04",
        text: "What DAX function clears all filters from a table or column, commonly used to compute percentage share of total?",
        options: ["ALL()", "REMOVE()", "CLEAR()", "RESET()"],
        correctAnswer: 0,
        explanation: "'ALL(table_or_column)' ignores active user filters, returning the unfiltered grand total."
      },
      {
        id: "Q-DNA-016-05",
        text: "What is 'Row Context' in DAX?",
        options: [
          "The current row being evaluated during an iterative operation or inside a calculated column",
          "The title of the visual card",
          "The list of active slicers",
          "The number of rows in the database"
        ],
        correctAnswer: 0,
        explanation: "Row context exists when evaluating calculations row-by-row, referring to values in the current row."
      },
      {
        id: "Q-DNA-016-06",
        text: "Why should DAX divisions always use 'DIVIDE(Numerator, Denominator, AlternateResult)' instead of the '/' operator?",
        options: [
          "DIVIDE() handles division-by-zero gracefully, returning the alternate result or blank instead of throwing fatal errors",
          "DIVIDE() runs 100x faster",
          "The '/' operator is illegal in DAX",
          "DIVIDE() rounds numbers to integers"
        ],
        correctAnswer: 0,
        explanation: "'DIVIDE()' intercepts divide-by-zero conditions safely without breaking visual rendering."
      },
      {
        id: "Q-DNA-016-07",
        text: "What DAX Time Intelligence function calculates Year-to-Date cumulative metrics?",
        options: ["TOTALYTD()", "YEAR_SUM()", "YTD_CALCULATE()", "ACCUMULATE_YEAR()"],
        correctAnswer: 0,
        explanation: "'TOTALYTD(expression, DateColumn)' accumulates metrics from the start of the fiscal or calendar year."
      },
      {
        id: "Q-DNA-016-08",
        text: "What requirement MUST be satisfied in Power BI to utilize Time Intelligence functions reliably?",
        options: [
          "The model must include a dedicated Date table marked as a Date Table with continuous dates and no gaps",
          "The computer clock must be set to UTC",
          "Data must be refreshed every 5 minutes",
          "The dataset must contain at least 1 million rows"
        ],
        correctAnswer: 0,
        explanation: "Time intelligence requires a continuous, unbroken calendar dimension marked as the official Date Table."
      },
      {
        id: "Q-DNA-016-09",
        text: "What does 'Context Transition' mean in DAX?",
        options: [
          "The transformation of a Row Context into an equivalent Filter Context, triggered automatically when a measure is invoked inside CALCULATE()",
          "Switching between dark mode and light mode",
          "Moving data from Excel to Power BI",
          "Translating DAX into English"
        ],
        correctAnswer: 0,
        explanation: "Calling a measure inside row context triggers context transition, converting row values into filter predicates."
      },
      {
        id: "Q-DNA-016-10",
        text: "What language is used inside Power BI's Power Query Editor to perform data extraction and transformation before loading into the model?",
        options: ["M Language (Power Query Formula Language)", "DAX", "VBA", "TypeScript"],
        correctAnswer: 0,
        explanation: "Power Query transformations are authored in the functional 'M' formula language; DAX is used for modeling."
      }
    ]
  },
  {
    id: "ASM-DNA-017",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-017",
    title: "Assessment: Geospatial Analytics & Mapping",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-017-01",
        text: "What spatial vector geometry type represents a single geographic delivery location identified by Latitude and Longitude coordinates?",
        options: ["Point", "LineString", "Polygon", "MultiPolygon"],
        correctAnswer: 0,
        explanation: "Points represent distinct 0-dimensional spatial coordinates (Latitude, Longitude)."
      },
      {
        id: "Q-DNA-017-02",
        text: "What is the global standard Coordinate Reference System (CRS) used by GPS and GeoJSON representations?",
        options: ["WGS 84 (EPSG:4326)", "Web Mercator (EPSG:3857)", "NAD83", "UTM Zone 32N"],
        correctAnswer: 0,
        explanation: "EPSG:4326 (WGS 84) is the universal ellipsoidal coordinate system used by GPS and GeoJSON standards."
      },
      {
        id: "Q-DNA-017-03",
        text: "What Python library extends Pandas DataFrames with support for spatial geometric operations and spatial joins?",
        options: ["GeoPandas", "Matplotlib", "NumPy", "Scikit-Learn"],
        correctAnswer: 0,
        explanation: "GeoPandas adds geometric datatypes and spatial algorithms (using Shapely and GDAL) to Pandas."
      },
      {
        id: "Q-DNA-017-04",
        text: "What type of map colors geographical areas (countries, states, ZIP codes) proportionally to an aggregated metric (e.g. median income)?",
        options: ["Choropleth Map", "Bubble Map", "Scatter Plot", "Treemap"],
        correctAnswer: 0,
        explanation: "Choropleth maps shade administrative polygons according to data values."
      },
      {
        id: "Q-DNA-017-05",
        text: "What spatial operation checks which sales territory polygon encloses a specific customer location coordinate?",
        options: [
          "Spatial Join (Point-in-Polygon intersection)",
          "Cross join",
          "Outer join",
          "Recursive join"
        ],
        correctAnswer: 0,
        explanation: "Spatial joins evaluate geometric topology predicates (e.g. ST_Within, ST_Intersects)."
      },
      {
        id: "Q-DNA-017-06",
        text: "What spatial extension for PostgreSQL enables spatial indexing and geographical SQL functions like ST_Distance?",
        options: ["PostGIS", "PgAdmin", "Postgres-Spatial", "GeoSQL"],
        correctAnswer: 0,
        explanation: "PostGIS adds spatial objects and geometric processing functions to PostgreSQL databases."
      },
      {
        id: "Q-DNA-017-07",
        text: "What does 'WKT' stand for in spatial database formats?",
        options: ["Well-Known Text", "Wide Knowledge Terminal", "Web Key Token", "Wireless Kernel Technology"],
        correctAnswer: 0,
        explanation: "Well-Known Text (WKT) is an open text markup language for representing vector geometry objects."
      },
      {
        id: "Q-DNA-017-08",
        text: "Why are Hexbin maps often preferred over arbitrary political boundaries (like ZIP codes) in density modeling?",
        options: [
          "Hexagonal bins have uniform area and identical distance to all 6 neighboring cells, eliminating geographic size distortion",
          "Hexagons use less memory",
          "ZIP codes are illegal to map",
          "Hexagons can only be drawn in Python"
        ],
        correctAnswer: 0,
        explanation: "Equal-area hexagonal binning prevents large rural counties from visually dominating urban high-density clusters."
      },
      {
        id: "Q-DNA-017-09",
        text: "In PostGIS, what index type is essential for accelerating spatial geometry queries (e.g. ST_DWithin)?",
        options: ["GIST (R-Tree spatial index)", "B-Tree index", "Hash index", "BRIN index"],
        correctAnswer: 0,
        explanation: "GiST indexes implement R-Tree spatial bounding box structures for high-speed coordinate queries."
      },
      {
        id: "Q-DNA-017-10",
        text: "What coordinate order does GeoJSON standard mandate?",
        options: [
          "[Longitude, Latitude] (X, Y order)",
          "[Latitude, Longitude] (Y, X order)",
          "[Altitude, Latitude]",
          "Order does not matter"
        ],
        correctAnswer: 0,
        explanation: "The GeoJSON RFC 7946 standard strictly mandates [Longitude (X), Latitude (Y)] coordinate ordering."
      }
    ]
  },
  {
    id: "ASM-DNA-018",
    courseId: "CRS-DNA-001",
    chapterId: "CH-DNA-018",
    title: "Assessment: Self-Service BI & Semantic Layers",
    passingScore: 70,
    questions: [
      {
        id: "Q-DNA-018-01",
        text: "What is the primary business problem solved by a centralized Semantic Layer in modern analytics?",
        options: [
          "It standardizes business logic, calculations, and KPI definitions in one central layer so all BI tools and teams report identical numbers",
          "It translates English into Spanish",
          "It eliminates the need for data warehouses",
          "It speeds up internet connection bandwidth"
        ],
        correctAnswer: 0,
        explanation: "Semantic layers centralize metric calculations (e.g. Net Revenue), ensuring institutional consistency."
      },
      {
        id: "Q-DNA-018-02",
        text: "What does Row-Level Security (RLS) enforce in BI platforms like Power BI and Tableau?",
        options: [
          "Restricting data rows returned to users based on their authenticated identity and organizational role permissions",
          "Preventing users from sorting rows",
          "Limiting tables to 100 rows",
          "Encrypting the hard drive"
        ],
        correctAnswer: 0,
        explanation: "RLS filters data at the row level so managers only view records pertaining to their assigned scope."
      },
      {
        id: "Q-DNA-018-03",
        text: "In Power BI DAX, what function returns the authenticated email address of the currently logged-in user for dynamic RLS?",
        options: ["USERPRINCIPALNAME()", "GETUSER()", "CURRENT_USER()", "SESSION_ID()"],
        correctAnswer: 0,
        explanation: "'USERPRINCIPALNAME()' returns the active Azure Active Directory / Power BI user email for dynamic security."
      },
      {
        id: "Q-DNA-018-04",
        text: "How does DirectQuery storage mode in Power BI differ from Import mode?",
        options: [
          "DirectQuery leaves data in the source cloud warehouse and pushes live SQL queries on every visual interaction; Import caches data in memory",
          "DirectQuery is 100x faster than Import mode",
          "DirectQuery only works on Excel files",
          "There is no difference"
        ],
        correctAnswer: 0,
        explanation: "DirectQuery issues on-demand SQL queries directly to the source database, enabling real-time big data reporting."
      },
      {
        id: "Q-DNA-018-05",
        text: "What is a 'Composite Model' in Power BI architecture?",
        options: [
          "A hybrid model combining high-volume Fact tables in DirectQuery mode with fast, cached Dimension tables in Import mode",
          "A model with two databases",
          "A model that contains images and text",
          "A 3D model"
        ],
        correctAnswer: 0,
        explanation: "Composite models combine in-memory Import for fast slicers with live DirectQuery for massive transaction tables."
      },
      {
        id: "Q-DNA-018-06",
        text: "What open-source transformation tool has popularized semantic metric definitions via 'dbt Semantic Layer'?",
        options: ["dbt (data build tool)", "Tableau", "PowerPoint", "Jira"],
        correctAnswer: 0,
        explanation: "dbt provides code-first semantic modeling, defining metrics as code directly within git repositories."
      },
      {
        id: "Q-DNA-018-07",
        text: "What is Column-Level Security (CLS)?",
        options: [
          "Restricting visibility of specific sensitive table columns (e.g. Social Security Numbers, salary) based on user roles",
          "Hiding column headers",
          "Setting column width to zero",
          "Sorting columns alphabetically"
        ],
        correctAnswer: 0,
        explanation: "CLS conceals designated columns containing sensitive attributes from unauthorized viewer roles."
      },
      {
        id: "Q-DNA-018-08",
        text: "What is 'Self-Service BI'?",
        options: [
          "An approach enabling non-technical business users to query data, create reports, and conduct ad-hoc analysis from governed data models",
          "Users servicing their own computer hardware",
          "A restaurant without waiters",
          "Writing raw Python scripts in production"
        ],
        correctAnswer: 0,
        explanation: "Self-service BI empowers business stakeholders to build reports safely using pre-built, governed data models."
      },
      {
        id: "Q-DNA-018-09",
        text: "What risk arises when business teams bypass the governed semantic layer and build reports from raw CSV dumps?",
        options: [
          "Metric proliferation, conflicting definitions, data leakage, and flawed business decisions based on unverified numbers",
          "The computer runs out of ink",
          "The database will automatically delete itself",
          "There is zero risk"
        ],
        correctAnswer: 0,
        explanation: "Bypassing governance leads to fragmented, conflicting metrics and untrusted executive reporting."
      },
      {
        id: "Q-DNA-018-10",
        text: "What is 'Data Certification' in enterprise BI catalogs?",
        options: [
          "A governance badge assigned by data stewards confirming that a dataset is verified, audited, and approved as the single source of truth",
          "A diploma awarded to employees",
          "A software license key",
          "An antivirus scan"
        ],
        correctAnswer: 0,
        explanation: "Certification badges indicate to users that a dataset has been formally audited and verified by data governance leads."
      }
    ]
  }
];

export const phase3 = {
  chapters: phase3Chapters,
  assessments: phase3Assessments
};

