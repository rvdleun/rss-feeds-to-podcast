# CLI API Reference

## retrieve-rss-feeds

Fetches all items from the RSS feeds configured in `rss.yaml`.

**Description:**
Retrieves articles from all configured RSS feed sources and stores them in `output/rss-feeds`. Only articles within the `maxAgeHours` timeframe are collected.

**Usage:**
```bash
npm run start -- retrieve-rss-feeds
```

**Output:**
- Creates files in `output/rss-feeds/` directory
- Each feed generates a separate JSON file with article metadata

**Configuration:**
- RSS feeds configured in `.config/rss.yaml`
- Respects `maxAgeHours` setting for article freshness

---

## create-segments

Create segments from items in the RSS feeds.

**Description:**
Randomly selects articles from the retrieved RSS feeds to create podcast segments. The number of segments is determined by the `numberOfSegments` configuration.

**Usage:**
```bash
npm run start -- create-segments
```

**Dependencies:**
- Requires `retrieve-rss-feeds` to be completed first

**Output:**
- Creates segment files in `output/segments/` directory
- Each segment contains article metadata and URL

**Configuration:**
- Number of segments controlled by `numberOfSegments` in `podcast.yaml`

---

## scrape-content

Scrapes content from all segments.

**Description:**
Extracts the full article content from each selected segment URL using the configured web scraper service.

**Usage:**
```bash
npm run start -- scrape-content
```

**Dependencies:**
- Requires `create-segments` to be completed first
- Uses [scrapper](https://hub.docker.com/r/amerkurev/scrapper) service

**Output:**
- Updates segment files in `output/segments/` with scraped content
- Failed scrapes are logged but segments remain for filtering

**Configuration:**
- Web scraper settings in `external-services.yaml`

---

## filter-segments

Filter segments on content scraped.

**Description:**
Evaluates each segment to determine if it's suitable for podcast discussion. Removes segments with no content and uses LLM evaluation to filter out unsuitable articles.

**Usage:**
```bash
npm run start -- filter-segments
```

**Dependencies:**
- Requires `scrape-content` to be completed first

**Output:**
- Removes unsuitable segment files from `output/segments/`

**Configuration:**
- LLM service configured in `external-services.yaml`
- Filtering prompt in `src/rss-feeds-to-podcast/workflow/4-filter-segments/filter-segments.prompts.ts`

---

## generate-summaries

Generates summaries for all segments.

**Description:**
Creates summaries and one-line briefs for each remaining segment. Summaries are optimized for spoken audio format.

**Usage:**
```bash
npm run start -- generate-summaries
```

**Dependencies:**
- Requires `filter-segments` to be completed first

**Output:**
- Updates segment files with:
    - `summary`: Summary for podcast discussion
    - `brief`: One-line sentence for introductions

**Configuration:**
- LLM service configured in `external-services.yaml`
- Summary prompts in `src/rss-feeds-to-podcast/workflow/5-generate-summaries/generate-summaries.prompts.ts`

---

## generate-segment-scripts

Generates scripts for all segments.

**Description:**
Converts each segment summary into conversational dialogue between the configured podcast hosts.

**Usage:**
```bash
npm run start -- generate-segment-scripts
```

**Dependencies:**
- Requires `generate-summaries` to be completed first

**Output:**
- Updates segment files with `script` containing host dialogue

**Configuration:**
- Host personalities defined in `podcast.yaml`
- Script generation prompts in `src/rss-feeds-to-podcast/workflow/6-generate-scripts/generate-scripts.prompts.ts`

---

## generate-intro-outro-scripts

Generates scripts for the intro and outro.

**Description:**
Creates introduction script using segment briefs to preview topics, and generates concluding outro script.

**Usage:**
```bash
npm run start -- generate-intro-outro-scripts
```

**Dependencies:**
- Requires `generate-summaries` to be completed first

**Output:**
- Creates `output/intro-script.json` with opening dialogue
- Creates `output/outro-script.json` with closing dialogue
- Uses segment briefs to create topic teasers in introduction

**Configuration:**
- Host behavior and personalities from `podcast.yaml`
- Intro/Outro prompts in `src/rss-feeds-to-podcast/workflow/6-generate-scripts/generate-scripts.prompts.ts`

---

## generate-final-script

Generates final script.

**Description:**
Combines all individual scripts (intro, segments, outro) with audio cues and sound effects into the complete podcast script.

**Usage:**
```bash
npm run start -- generate-final-script
```

**Dependencies:**
- Requires `generate-segment-scripts` and `generate-intro-outro-scripts` and `generate-intro-outro-scripts` to be completed first

**Script Structure:**
- `jingle` sound effect
- Introduction script
- Segment scripts (separated by `new-segment` sound effects)
- Outro script
- Closing `jingle` sound effect

**Output:**
- Creates `output/script.json` with complete podcast structure
- Script objects include: `delay`, `host-speak`, and `sfx` types

---

## generate-audio

Generates audio from the script.

**Description:**
Converts each script object into individual audio files using text-to-speech and sound effect assets.

**Usage:**
```bash
npm run start -- generate-audio
```

**Dependencies:**
- Requires `generate-final-script` to be completed first
- Requires Fastkoko and FFmpeg

**Audio Generation:**
- `host-speak`: Generated using TTS with host voice profiles
- `sfx`: Copied from `.config/assets/` directory
- `delay`: Silent audio files created with specified duration

**Output:**
- Creates individual audio files in `output/audio/` directory
- Generates `concat-list.txt` for audio merging

**Configuration:**
- TTS service configured in `external-services.yaml`
- Host voice mappings in `podcast.yaml`
- Sound effect files in `.config/assets/`

---

## merge-audio

Merges all generated audio.

**Description:**
Combines all individual audio files into the final podcast episode using ffmpeg.

**Usage:**
```bash
npm run start -- merge-audio
```

**Dependencies:**
- Requires `generate-audio` to be completed first
- Requires FFmpeg

**Output:**
- Creates `output/podcast.mp3` - the final podcast episode
