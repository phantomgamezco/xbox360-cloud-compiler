# Xbox 360 Homebrew Studio

A small browser-based starter editor for creating C projects targeting Xbox 360 homebrew with libXenon. It is a static site and can be hosted with GitHub Pages.

## Use the studio

1. Open the published site, choose a starter template, and edit `src/main.c` in the browser.
2. Select **Export project** to download a ZIP containing the source, Makefile, README, and a GitHub Actions workflow.
3. Extract the ZIP into a GitHub repository and push it. The included workflow attempts to build `xenon.elf` and upload it as an artifact.
4. Download the artifact from that repository's Actions run.

The build workflow depends on the availability and compatibility of the `free60/libxenon` container/toolchain; it is a starter configuration, not a hosted compilation service. The editor runs in the visitor's browser and does not upload source code.

## Run on an Xbox 360

The resulting ELF is intended for compatible homebrew-capable Xbox 360 setups. Transfer it on a FAT32 USB drive and launch it using XeLL. A stock retail Xbox 360 does not run arbitrary homebrew ELF files. This project does not modify consoles or provide a way to bypass console security.

## Publish with GitHub Pages

In the repository settings, enable GitHub Pages and select the `main` branch and `/ (root)` as the publishing source. Once Pages finishes deploying, use the URL shown in the Pages settings.

The editor and ZIP exporter load CodeMirror and JSZip from cdnjs, so an internet connection is needed to load those libraries.
