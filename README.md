# country-coder

📍 ➡️ 🇩🇰 Convert longitude-latitude pairs to ISO 3166-1 codes quickly and locally


## What is it?

`country-coder` is a lightweight package that looks up identifiers for geographic points without calling a geocoding server. It can also convert between alpha-2, alpha-3, numeric-3, and Wikidata identifiers.


### Advantages

Client-side coding has a number of benefits over server-side solutions:

- Works offline (of course)
- Fast, reliable, synchronous calls
- No API keys, rate-limiting, or network errors
- Privacy

### Caveats

`country-coder` prioritizes package size and lookup speed over precision. Thus, there are situations it's not suitable for:

- *Disputed Borders*: only one country, the "de facto controlling country", is returned per point
- *Maritime Borders*: only points on land are supported; borders over water are highly generalized
- *Complex Borders*: land border detail varies and may be imprecise at granular scales
- *Country Subdivisions*: ISO 3166-2 codes are not supported
- *Naming*: feature names are not provided; retrieve them with another package or Wikidata
- *Spatial Operations*: a feature's calculated area, bounding box, etc. will likely be inaccurate
- *Mapmaking*: the data is not intended for rendering
