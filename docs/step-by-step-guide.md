# **Step-by-Step Guide: How this Blueprint Works**

Creating a podcast via RSS Feeds is done by first selecting a number of articles from the feeds, generating a summary of each for better processing, creating a script for the entire podcast, and then generating audio. Here's how it works under the hood.

---

## **Overview**

This system has seven core stages:

🌐 **1. Gather RSS Feeds**
Retrieve all articles from configured RSS feeds.

📝 **2. Select Articles for Discussion**
Pick which articles will be featured in the podcast episode.

🔍 **3. Scrape Content**
Extract the full content from each selected article.

🚫 **4. Filter Segments**
Remove articles that are ineligible for podcast discussion.

📄 **5. Generate Summaries**
Create concise summaries and one-line briefs for each article.

🎭 **6. Generate Scripts**
Write conversational scripts for each segment plus intro/outro.

🎙️ **7. Generate Audio**
Convert scripts into audio and merge into final podcast.

All retrieved data will be stored in the `output` directory.

Each step is performed sequentially when calling the CLI tool. However, you can also pass a parameter to just run one step which helps during development.

---

## **Step 1: Gather RSS Feeds**

The process begins with retrieving articles from configured RSS feeds. This step establishes the foundation by collecting all available content that could potentially be featured in your podcast.

Having a diverse pool of articles ensures that your podcast can cover a wide range of topics and provides flexibility in content selection for each episode.

### ⚙️ **Key Components in this Step**

**1 - RSS Feed Configuration**
- All RSS feeds are configured in `config/rss.yml`
- Supports multiple feed URLs to diversify content sources

### 🔍 **Configuration Example**

```yaml
# config/rss.yml
feeds:
  - url: "https://example.com/rss"
    name: "Example News"
  - url: "https://another-site.com/feed"
    name: "Tech Updates"
```

### 💻 **Running This Step**

`npm run start -- retrieve-rss-feeds`

---

## **Step 2: Select Articles for Discussion**

In this step, the system randomly selects a subset of articles from the gathered RSS feeds to feature in the podcast episode.

### ⚙️ **Key Components in this Step**

**1 - Random Selection**
- Articles are selected completely at random from all available RSS feed articles
- No filtering or prioritization logic is applied at this stage
- The selection is purely based on chance to ensure variety

**2 - Segment Configuration**
- The number of articles to select is configured in `config/podcast.yml` as `numberOfSegments`
- Each selected article becomes a potential podcast segment
- Selected article data is stored in `output/segments` for further processing

### 🔍 **Configuration Example**

```yaml
# config/podcast.yml
numberOfSegments: 15
```

### 💻 **Running This Step**

`npm run start -- create-segments`

---

## **Step 3: Scrape Content**

This step extracts the full content from each selected article URL. Since RSS feeds typically only provide headlines and brief descriptions, content scraping is essential to gather the detailed information needed for meaningful podcast discussions.

### ⚙️ **Key Components in this Step**

**1 - Web Scraping Engine**
- Uses [Scrapper](https://github.com/amerkurev/scrapper) for content extraction
- Handles various website structures and content formats
- Extracts readable text while filtering out navigation, ads, and other non-content elements

**2 - Content Storage**
- Scraped content is added to the corresponding segment files in `output/segments`
- Each segment file is updated with the full article text

### 💻 **Running This Step**

`npm run start -- scrape-content`

---

## **Step 4: Filter Segments**

The filtering step ensures that only high-quality, podcast-worthy content proceeds to script generation. This involves both technical filtering (removing articles with no content) and content quality assessment using LLM evaluation.

### ⚙️ **Key Components in this Step**

**1 - Technical Filtering**
- Articles with no scraped content are automatically discarded
- Segments with insufficient text length are removed
- Technical failures from the scraping step are handled

**2 - LLM-Powered Content Evaluation**
- Uses a Language Model prompt to assess article viability for podcast discussion
- Filters out advertisements, cookie notices, and other non-content pages
- Evaluates whether the content is substantive enough for meaningful discussion

**3 - Segment Reduction**
- No replacement articles are selected if segments are filtered out
- The final podcast may have fewer segments than originally configured
- Quality is prioritized over quantity in the final selection

### 🔍 **Filtering Criteria**

**Technical Filtering:**
- Must have successfully scraped content
- Must contain sufficient text length

**LLM Content Evaluation - Good Podcast Content:**
- **Discussion potential**: Contains topics that invite opinions, debate, or analysis
- **Human interest**: Affects people's lives, emotions, or decisions
- **Narrative elements**: Has stories, characters, conflicts, or developments
- **Broader relevance**: Connects to larger trends, issues, or cultural moments
- **Audience engagement**: Would listeners care about or relate to this topic?

**Automatically Filtered Out:**
- Step-by-step tutorials or how-to guides
- Dense technical specifications or API documentation
- Pure code examples or configuration files
- Academic papers without broader implications
- Content that's better consumed visually (charts, diagrams)

**Special Case**: Product announcements, even technical ones, can pass if they have broader implications, competitive angles, or societal impact.

### 💻 **Running This Step**

`npm run start -- filter-segments`

---

## **Step 5: Generate Summaries**

This step creates two types of summaries for each viable article: detailed summaries for LLM processing and concise one-line briefs for the podcast introduction. This preparation ensures that the script generation process has well-structured input material.

### ⚙️ **Key Components in this Step**

**1 - Detailed Summary Generation**
- Converts article content into spoken radio news format
- Summaries are written to sound natural and engaging when read aloud
- Uses professional yet conversational tone with active voice
- Starts with attention-grabbing opening lines that immediately engage listeners
- Avoids structured formatting (bullets, headers) in favor of flowing sentences
- Does not include introductory phrases or source attribution

- **2 - One-Line Brief Creation**
- Creates one-line sentences that introduce topics to podcast listeners
- Designed to work as natural podcast transitions or intros
- Focuses on the most discussion-worthy aspect of each article
- Avoids technical jargon in favor of conversational language
- Written to make listeners want to hear more about the topic
- Optimized to sound engaging when spoken aloud

### 🔍 **Output Examples**

**Detailed Summary:**
```
"Solar panel installations could become significantly more affordable for homeowners 
after the government announced new incentives worth up to five thousand dollars per 
household. The policy targets middle-income families who previously couldn't afford 
the upfront costs, potentially bringing renewable energy to two million additional 
homes by next year..."
```

**One-Line Brief:**
```
"We'll dive into how the government's latest move could put solar panels on two million more rooftops"
```

### 💻 **Running This Step**

`npm run start -- generate-summaries`

---

## **Step 6: Generate Scripts**

The script generation phase transforms the summarized content into conversational podcast dialogue. This involves creating individual segment scripts, introduction teasers, and outro content, then combining everything into a cohesive podcast structure.

### ⚙️ **Key Components in this Step**

**1 - Individual Segment Scripts**
- Each article summary is converted into conversational dialogue
- Scripts feature the configured podcast hosts discussing the topic
- Natural conversation flow with questions, responses, and commentary

**2 - Introduction Script Generation**
- Uses the one-line briefs to create engaging teasers
- Hosts introduce themselves and preview upcoming topics
- Sets the tone and expectations for the episode

**3 - Outro Script Creation**
- Concluding remarks and episode wrap-up
- Typically includes calls-to-action and episode summary
- Maintains consistent host personalities

**4 - Script Compilation**
- All individual scripts are merged into `output/script.json`
- Scripts are structured with specific object types for audio generation
- Includes timing elements and audio cues

### 🔍 **Script Structure**

The final script consists of different object types:

- **`delay`**: Pauses between audio segments
- **`host-speak`**: Dialogue lines for specific hosts
- **`sfx`**: Sound effects and audio files from `config/assets`

**General Output Flow:**
1. `jingle` sound effect
2. Introduction script with topic teasers
3. Individual article segments (separated by `new-segment` sound effects)
4. Outro script
5. Closing `jingle` sound effect

### 🔍 **Host Configuration**

```yaml
# config/podcast.yml
hosts:
  - name: "Alex"
    personality: "Enthusiastic and analytical, asks probing questions"
  - name: "Jordan"
    personality: "Thoughtful and curious, provides context and insights"
```

### 💻 **Running This Step**

`npm run start -- generate-segment-scripts`

`npm run start -- generate-intro-outro-scripts`

`npm run start -- generate-final-script`

---

## **Step 7: Generate Audio**

The final step converts the generated script into audio format, creating individual audio files for each script element and then merging them into the complete podcast episode.

### ⚙️ **Key Components in this Step**

**1 - Individual Audio File Generation**
- Each object in `script.json` is converted to an audio file
- Audio files are stored in `output/audio` with sequential naming
- Different processing approaches based on object type

**2 - Audio Processing by Type**
- **`delay`**: Uses ffmpeg to generate silent audio files with specified duration
- **`host-speak`**: Text-to-speech generation with host-specific voice profiles
- **`sfx`**: Copies pre-recorded audio files from `config/assets`

**3 - Audio Compilation**
- Generates `concat-list.txt` containing all audio files in sequence
- Uses ffmpeg to merge all audio files into a single podcast episode
- Final output is saved as `output/podcast.mp3`

### 💻 **Running This Step**

`npm run start -- generate-audio`

## 🎨 **Customizing the Blueprint**

To better understand how you can tailor this Blueprint to suit your specific needs, please visit the **[Customization Guide](customization.md)**.

## 🤝 **Contributing to the Blueprint**

Want to help improve or extend this Blueprint? Check out the **[Future Features & Contributions Guide](future-features-contributions.md)** to see how you can contribute your ideas, code, or feedback to make this Blueprint even better!
