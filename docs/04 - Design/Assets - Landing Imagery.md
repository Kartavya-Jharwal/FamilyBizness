# Landing Imagery

The landing uses landscape photography to express continuity and stewardship. These are illustrative photographs, not portraits of family members or evidence of family-owned property. The page discloses this distinction and retains `data-photo-slot` hooks for a later family-approved photography set. Product facts remain in [Identity](../00%20-%20Canonical/Identity.md).

## Sources

Downloaded on 9 November 2026. Each source page identifies the photograph as free under the [Unsplash License](https://unsplash.com/license), which permits downloading, modifying and using images, including commercial use. Attribution is retained here even though the licence does not require it. No Unsplash+ assets are used.

| Local asset under `apps/web/public/images/` | Photographer | Original photograph | Use |
| --- | --- | --- | --- |
| `legacy-oak.webp`, `legacy-oak-mobile.webp` | Cristina Anne Costello | [Old oak on a hillside](https://unsplash.com/photos/a-large-tree-with-no-leaves-on-a-hill-68_UN8Qfo7Q) | Hero and current generation |
| `heritage-house.webp` | T / @tanyabarrow | [Historic manor house surrounded by parkland](https://unsplash.com/photos/historic-manor-house-surrounded-by-lush-green-parkland-IEaMLhVLS3w) | Foundations |
| `woodland-path.webp` | Hannah Wright | [Pathway between trees](https://unsplash.com/photos/pathway-between-trees-during-daytime-Nb_4U27IPwM) | Next generation |

## Delivery and presentation

The photographs are stored locally as cropped WebP assets. The browser does not depend on a third-party image host. The hero loads eagerly with high fetch priority; below-fold photographs use lazy loading and asynchronous decoding. Explicit dimensions and aspect-ratio containers reserve layout space. Captions sit on solid, token-derived surfaces so their contrast does not depend on photographic detail. The existing palette, typography and spacing remain defined in [tokens.css](../../packages/tokens/tokens.css).

CDN source identifiers: `photo-1685031581938-1db7e584c972`, `photo-1777297821363-3f9b43e068cb`, and `photo-1572206200748-c820705f123f`, respectively, on `images.unsplash.com`. Requested transformations are WebP (`fm=webp`), centre crop (`fit=crop`) and quality 35. The oak is 800 × 800; the other photographs are 640 × 480.

The hero selects the 480 × 480 mobile derivative through a `picture` source at viewport widths up to 640px. Its relative `srcset` works both at the domain root and under the GitHub Pages project prefix. The same smaller asset is reused for the current-generation card. The desktop oak remains 800 × 800 (the rendered 4:3 container crops this on mobile; the intrinsic file is square). Local WebP encoding uses quality 65, with the resized mobile derivative at quality 60. Final sizes: desktop oak 149,216 bytes; mobile oak 50,642 bytes; heritage house 81,432 bytes; woodland 98,086 bytes. Mobile hero transfer is reduced by approximately 68% from the original 157,470-byte asset.
