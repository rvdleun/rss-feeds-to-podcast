# 🎨 **Customization Guide**

This Blueprint is designed to be flexible and easily adaptable to your specific needs. This guide will walk you through some key areas you can customize to make the Blueprint your own.

---

## ⚙️ Configuration

After copying `.config.example` to `.config`, you can update the following settings:

### external-services.yaml

This file configures all the external services used in the pipeline.

**LLM Configuration**
* Supports any provider that follows OpenAI API standards
* Primarily tested with Ollama, but other providers should work
* Configure the `service`, `baseURL`, `model`, and `apiKey` fields
* Multiple configurations can be commented out for easy switching

**Text-To-Speech**
* The `href` should point to a [Kokoro-FastAPI](https://github.com/remsky/Kokoro-FastAPI) instance
* Used for generating host voices in the final audio step

**Web Scraper**
* Configures the [scrapper](https://hub.docker.com/r/amerkurev/scrapper) Docker service
* `cache`: Whether to cache scraped content between runs
* `incognito`: Run browser in incognito mode to avoid tracking
* `timeout`: Maximum time to wait for page load (milliseconds)
* `waitUntil`: When to consider page loading complete (`networkidle` waits for network activity to stop)

### podcast.yaml

This file configures the podcast hosts, their personalities, and episode settings.

**Episode Configuration**
* `name`: The podcast title used in introductions and outros
* `numberOfSegments`: How many articles to select for each episode
* `behaviour`: Defines the overall dynamic between hosts during discussions

**Host Configuration**
* Each host requires an `id`, `description`, and `voice` assignment
* `description`: Should include the host's name and personality traits that guide script generation
* `voice`: Must correspond to a valid voice ID from your Kokoro-FastAPI instance
* The LLM uses personality descriptions to generate authentic dialogue for each host

### rss.yaml

This file configures RSS feed sources and article freshness settings.

**Feed Configuration**
* `feeds`: List of RSS feed URLs to monitor for articles
* `src`: The RSS feed URL to retrieve articles from
* `title`: Optional custom name for the feed (defaults to feed's own title if not specified)

**Article Filtering**
* `maxAgeHours`: Only considers articles published within this timeframe
* Articles older than the specified hours are ignored during selection
* Helps ensure podcast content discusses recent and relevant topics


## 📝 **Modifying System Prompts**

You can modify host-related prompts in the `podcast.yaml` configuration file.

**Prompt File Locations**
Each step that uses LLM prompts stores them in a `.prompts.ts` file within the corresponding workflow directory:

* **Filter segments**: `src/rss-feeds-to-podcast/workflow/4-filter-segments/filter-segments.prompts.ts`
* **Generate summaries**: `src/rss-feeds-to-podcast/workflow/5-generate-summaries/generate-summaries.prompts.ts`
* **Generate scripts**: `src/rss-feeds-to-podcast/workflow/6-generate-scripts/generate-scripts.prompts.ts`

**Making Changes**
* Edit the `.prompts.ts` files directly to modify LLM behavior
* Host personality and behavior prompts are pulled from `podcast.yaml`

## 🤝 **Contributing to the Blueprint**

Want to help improve or extend this Blueprint? Check out the **[Future Features & Contributions Guide](future-features-contributions.md)** to see how you can contribute your ideas, code, or feedback to make this Blueprint even better!
