# Machine Learning Case Studies - Canvas Common Cartridge

This directory contains a Canvas LMS Common Cartridge for a 15-week Machine Learning course using a case-based learning approach.

## Course Structure

The course consists of 15 modules, one for each week:

1. **Week 1**: Opening the Case — What does it mean to "see" a pattern?
2. **Week 2**: The Shared Case File — Features, labels, targets
3. **Week 3**: Case 1 (Student-Selected Path) — Core Concepts
4. **Week 4**: Case 1 Deep Dive — Evidence and uncertainty
5. **Week 5**: Case 1 Wrap — Your first Case File
6. **Week 6**: Cross-Case Checkpoint 1 — Sharing what you've seen
7. **Week 7**: Case 2 (Your Second Path) — New lens, same data
8. **Week 8**: Case 2 Deep Dive — Interpreting behavior
9. **Week 9**: Case 2 Wrap — Finishing your second Case File
10. **Week 10**: Cross-Case Checkpoint 2 — Bias, overfitting, false leads
11. **Week 11**: Case 3 (Your Final Path) — Closing the loop
12. **Week 12**: Case 3 Deep Dive — Blind spots and strengths
13. **Week 13**: Case 3 Wrap — Final Case File
14. **Week 14**: The Network of Clues — Putting models together
15. **Week 15**: The Reveal — What was actually learned?

## Files Included

- `imsmanifest.xml` - The main manifest file defining the course structure
- `web_resources/` - Directory containing all 15 HTML content pages (week01.html through week15.html)
- `README.md` - This file

## How to Import into Canvas

### Method 1: Import as Common Cartridge (Recommended)

1. **Create a ZIP file** of the entire `canvas_course` directory:
   ```bash
   cd canvas_course
   zip -r ml_course_cartridge.zip imsmanifest.xml web_resources/
   ```
   Or use the provided ZIP file if available.

2. **In Canvas**:
   - Navigate to your course
   - Go to **Settings** → **Import Course Content**
   - Select **Content Type**: "Common Cartridge 1.x Package"
   - Click **Choose File** and select the ZIP file you created
   - Click **Import**

3. Canvas will process the import and create 15 modules, each containing its respective week's content page.

### Method 2: Manual Upload

If the Common Cartridge import doesn't work:

1. Create 15 modules in Canvas (one for each week)
2. Upload each HTML file individually as a Page in its respective module
3. Name each page according to the week title

## Content Structure

Each weekly page includes:
- **Learning Goals**: Clear learning objectives for the week
- **Activities for the Week**: List of readings, videos, labs, and discussions
- **Deliverable for Grading**: Assignment description with point values and due dates

## Customization

You can customize:
- Point values for assignments
- Due dates (currently shown as "End of Week X")
- Activities and readings to match your actual course materials
- Learning goals to align with your specific course outcomes

## Technical Notes

- All HTML files are self-contained with embedded CSS
- No external dependencies required
- Pages are responsive and mobile-friendly
- Compatible with Canvas LMS accessibility standards
- Files use UTF-8 encoding

## Canvas Module Structure

When imported, each week becomes a separate module containing:
- One content page with learning goals, activities, and deliverables

You can add additional items to each module after import, such as:
- Assignment links
- Discussion topics
- Quiz links
- External tool integrations

## Support

For issues with importing or using this Common Cartridge, consult:
- Canvas LMS Documentation on Common Cartridge imports
- Your institution's Canvas support team
- IMS Global Common Cartridge specification

## Version

- Common Cartridge Version: 1.3.0
- Created: 2025
- Course Type: Machine Learning / Data Science
