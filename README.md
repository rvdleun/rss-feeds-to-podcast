<p align="center">
  <picture>
    <!-- When the user prefers dark mode, show the white logo -->
    <source media="(prefers-color-scheme: dark)" srcset="./images/Blueprint-logo-white.png">
    <!-- When the user prefers light mode, show the black logo -->
    <source media="(prefers-color-scheme: light)" srcset="./images/Blueprint-logo-black.png">
    <!-- Fallback: default to the black logo -->
    <img src="./images/Blueprint-logo-black.png" width="35%" alt="Project logo"/>
  </picture>
</p>


<div align="center">

[![NodeJS](https://img.shields.io/badge/Node.js-6DA55F?logo=node.js&logoColor=white)](#)
[![License](https://img.shields.io/badge/license-Apache%202.0-blue.svg)](LICENSE)
[![](https://dcbadge.limes.pink/api/server/YuMNeuKStr?style=flat)](https://discord.gg/YuMNeuKStr) <br>
[![Docs](https://github.com/rvdleun/rss-feeds-to-podcast/actions/workflows/docs.yaml/badge.svg)](https://github.com/rvdleun/rss-feeds-to-podcast/actions/workflows/docs.yaml/)
[![Tests](https://github.com/rvdleun/rss-feeds-to-podcast/actions/workflows/tests.yaml/badge.svg)](https://github.com/rvdleun/rss-feeds-to-podcast/actions/workflows/tests.yaml/)
[![Ruff](https://github.com/rvdleun/rss-feeds-to-podcast/actions/workflows/lint.yaml/badge.svg?label=Ruff)](https://github.com/rvdleun/rss-feeds-to-podcast/actions/workflows/lint.yaml/)

[Blueprints Hub](https://developer-hub.mozilla.ai/)
| [Documentation](https://mozilla-ai.github.io/Blueprint-template/)
| [Getting Started](https://mozilla-ai.github.io/Blueprint-template/getting-started)
| [Contributing](CONTRIBUTING.md)

</div>

# RSS-Feeds-to-Podcast: A Blueprint for generating podcasts from articles in RSS Feeds

This blueprint guides you to generate an audio file where two hosts will discuss randomly selected articles from a number of RSS feeds. The result is podcast that is focused solely on the user's interests.

## Quick-start

Make sure you're running the right node version, using [Node Version Manager](https://github.com/nvm-sh/nvm).

```bash
nvm use
```

Install the dependencies

```bash
npm install
```

Copy `.config.example` to `.config`

```bash
cp -r .config.example .config
```

Setup the external services in `.config/external-services.yaml`. There are docker-compose files in the [external-services](./external-services) directory to start them locally if you don't have one available.

Edit `.config/rss.yaml` and add your favorite feeds.

Start all external services via docker.
```bash
cd external-services
docker compose -f kokoro-api/docker-compose.yml -f scrapper/docker-compose.yml -f ollama/docker-compose.yml up -d
```

Make sure that you have ffmpeg installed.
```bash
apt-get install ffmpeg
```

Once everything is configured, generate a new podcast
```bash
npm run start
```

If successful, the result can be found in `output/podcast.mp3`.

## How it Works

This blueprint will generate a podcast which will discuss a number of articles from the configured RSS feeds. The podcast will consist off...

* An introduction where the hosts will hint at the selected articles
* A segment for each selected article where the hosts will discuss its contents.
* An outro

It does this by taking the following steps:

1. Gather RSS Feeds ([code](./src/rss-feeds-to-podcast/workflow/1-rss-feed/rss-feed.service.ts))
    * All the configured RSS feeds are retrieved and stored in `output/rss-feeds`
    * These can be configured in `.config/rss.yml`
2. Select articles for discussion ([code](./src/rss-feeds-to-podcast/workflow/2-segment-picker/segment-picker.service.ts))
    * At random, it will pick a number of articles from the RSS feeds.
    * There is no further logic here yet. It will be completely at random.
    * The number of segments can be configured in `.config/podcast.yml` as `numberOfSegments`.
    * The data for each selected article is stored in `output/segments`. These files will be updated throughout the pipeline.
3. Scrape content ([code](./src/rss-feeds-to-podcast/workflow/3-content-scraper/content-scraper.service.ts))
    * Using [Scrapper](https://github.com/amerkurev/scrapper), the contents of each article are retrieved.
4. Filter segments ([code](./src/rss-feeds-to-podcast/workflow/4-filter-segments/filter-segments.service.ts))
    * It will now go through each selected article and determine if they are eligible for the podcast.
    * If no content was retrieved in the previous step, it is discarded.
    * Next, it will use a LLM prompt to determine if the article is actually viable for the podcast. This will filter out pages that are, for example, just advertisements or if the scraper was only able to retrieve a request to store cookies.
    * At this point, no replacements are picked. You will likely end up with less segments than configured.
5. Generate summaries ([code](./src/rss-feeds-to-podcast/workflow/5-generate-summaries/generate-summaries.service.ts))
    * For the content of each article, it will generate a summary for the LLM to process.
    * It will also generate a one-line brief of each article which will be used in the intro.
6. Generate scripts ([code](./src/rss-feeds-to-podcast/workflow/6-generate-scripts/generate-scripts.service.ts))
    * First, it will start generating a script for each article.
    * Then using the briefs, it will generate an introduction where the hosts will give teasers about each subject.
    * An outro is generated as well.
    * Finally, all the generated scripts are merged into one big script in `output/script.json`.
      * The script will consist of the following types:
        * `delay` - A pause between audio
        * `host-speak` - A line which one of the hosts will say
        * `sfx` - An audio file to play. These can be found in `.config/assets`.
      * The general output is:
        * It will first play the `jingle` sfx.
        * The intro script is played out
        * Each segment is then added. In-between each segment, the `new-segment` sfx is played, so the listener knows when a new article is discussed.
        * Finally, the outro script is played, following by the `jingle` sfx again.
    * The hosts and their personality can be configured in `.config/podcast.yml`.
7. Generate audio ([code](./src/rss-feeds-to-podcast/workflow/7-generate-audio/generate-audio.service.ts))
    * It will first generate an audio file for each object in `script.json` and store them in `output/audio`.
    * The following actions are taken, depending on the `type`:
      * `delay` - Using ffmpeg, a silent audio file is generated with the configured duration
      * `host-speaks` - An audio file is generated with the host's line.
      * `sfx` - The audio file from `.config/assets` is copied.
    * A `concat-list.txt` is generated, containing all the files in `output/audio`.
    * Ffmpeg is using to merge all the audio files together. The end result is stored in `output/podcast.mp3`.

All the code for these steps can be found in [src/rss-feeds-to-podcast/workflow](./src/rss-feeds-to-podcast/workflow).

## Pre-requisites

- **System requirements**:
  - OS: Windows, macOS, or Linux
  - Node v22
  - Minimum RAM: 6GB
  - Disk space: 600mb

- **Dependencies**:
  - [Node.js](https://github.com/nvm-sh/nvm) (version defined in `.nvmrc`)
    - Dependencies listed in `package.json`
  - [FFmpeg](https://github.com/FFmpeg/FFmpeg)
  - Docker & Docker Compose for running external services (no need to install these services manually, as Docker will take care of that):
    - [Ollama](https://ollama.com/) (or you can use another LLM service, provided it supports the [OpenAI API standards](https://platform.openai.com/docs/api-reference/introduction))
    - [Kokoro-FastAPI](https://github.com/remsky/Kokoro-FastAPI)
    - [Scrapper](https://github.com/amerkurev/scrapper)

## License

This project is licensed under the Apache 2.0 License. See the [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! To get started, you can check out the [CONTRIBUTING.md](CONTRIBUTING.md) file.
