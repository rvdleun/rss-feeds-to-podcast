Get started with rss-feeds-to-podcast using one of the options below:
---

## Setup options

=== "💻 Local Installation"

      1. **Clone the Repository**

         ```bash
         git clone https://github.com/rvdleun/rss-feeds-to-podcast.git
         cd rss-feeds-to-podcast
         ```

      2. **Load the right node version via [Node Version Manager](https://github.com/nvm-sh/nvm).**

         ```bash
         nvm use
         ```

      3. **Copy the config.example directory to config.**

      ```bash
      cp -r config.example config
      ```

      4. **Start generating a new podcast**

      ```bash
      sh demo/run.sh
      ```

=== "☁️ GitHub Codespaces"

      Click the button below to launch the project directly in GitHub Codespaces:

      <p align="center"><a href="https://github.com/codespaces/new?hide_repo_select=true&ref=main&repo=888426876&skip_quickstart=true&machine=standardLinux32gb"><img src="https://github.com/codespaces/badge.svg" /></a></p>

      Once the Codespaces environment launches, inside the terminal, first copy the config.example directory to config.

      ```bash
      cp -r config.example config
      ```

      Optionally, you may want to setup the external-services in `config/external-services.yml`. In particular, Ollama won't run fast enough, unless you're willing to have the codespace open for awhile.

      Once you're ready, run:

      ```bash
      sh demo/run.sh
      ```

