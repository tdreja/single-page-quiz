# Single Page Quiz - English

This guide describes how to use the Single Page Quiz application and how to build and extend it.

## Usage

Download the latest release from the [releases page](https://github.com/tdreja/single-page-quiz/releases) and open the `index.html` file in your web browser. 
The entire quiz runs locally in your browser and doesn't require an internet connection.

Currently you have to supply your quiz as a YAML file (see Schema) and import it.

In the future, an editor within the quiz may be added.

## Architecture

The quiz uses [ReactJS](https://react.dev/) as its core. It is build into a single HTML file using Vite and the [vite-plugin-singlefile](https://github.com/richardtallent/vite-plugin-singlefile).

The overall application style is based upon [Bootstrap](https://getbootstrap.com/). Icons are from [Material-Icons](https://fonts.google.com/icons).

# Single Page Quiz - Deutsch

Um da Quiz zu nutzen, wird nur die aktuellste `index.html` Datei aus [Releases](https://github.com/tdreja/single-page-quiz/releases) benötigt.

Diese kann man einfach im Browser öffnen und dann läuft das Quiz komplett ohne Internetverbindung.

Aktuell muss die Inhalt des Quiz als YAML Datei importiert werden (siehe Schema), aber in Zukunft könnte es auch einen Editor direkt in der App geben.