# Design QA

final result: passed

Reference sources:
- Live site: https://grand-meridian-city.com/
- User-provided gallery, mobile hero, and duplicate hero text screenshots.

Local checks:
- Desktop viewport: 1366 x 768.
- Mobile viewport: 390 x 844.
- Preview URL: http://localhost:4173/

Results:
- Gallery now auto-slides and keeps the active foreground image synchronized with the crossfaded background image.
- Hero mobile layout uses mobile-specific banner assets, hides the manual duplicate text overlay, and avoids horizontal overflow.
- Project snapshot includes the 12 Grand Meridian City facts from the provided reference.
- The duplicate dark project highlights section has been replaced with the light Grand Meridian City Mumbra overview section from the provided reference.
- Floor plans include 2 BHK and 3 BHK cards with local plan images, carpet areas, and pricing.
- Brand creatives section has been restored after the animated gallery.
- Contact section includes a map, address, mobile, email, RERA details, and the existing enquiry form.
- After the contact text was removed, the contact section now fits the remaining map and enquiry form as a balanced two-column layout.
- Contact map now uses the provided Google Maps coordinates, and the enquiry form width has been increased while preserving the two-column fit.
- FAQ answers now stay closed on load and use plus/minus indicators.
- FAQ and contact now share the same emerald theme, while other content sections use one warm brand wash for better visual consistency.
- Ad-ready Privacy Policy, Terms & Conditions, and Disclaimer pages were added and linked from the footer plus both enquiry forms.
- Gallery and hero image paths resolve from local project assets.
- Console sweep found no warnings or errors.
- Broken image sweep found no broken images.

Remaining notes:
- The sticky contact bar remains visible because it is part of the existing conversion flow and matches the reference-style fixed CTA behavior.
