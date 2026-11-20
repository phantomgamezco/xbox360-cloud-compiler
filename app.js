const templates = {
  hello: `#include <stdio.h>
#include <xenos/xenos.h>
#include <console/console.h>

int main(void) {
    xenos_init(VIDEO_MODE_AUTO);
    console_init();

    printf("\\nHello from Xbox 360 homebrew!\\n");
    printf("Built with the libXenon starter project.\\n");

    while (1) {
        // Your application loop goes here.
    }
    return 0;
}` ,
  controller: `#include <stdio.h>
#include <xenos/xenos.h>
#include <console/console.h>
#include <input/input.h>
#include <usb/usbmain.h>

int main(void) {
    xenos_init(VIDEO_MODE_AUTO);
    console_init();
    usb_init();

    struct controller_data_s pad;
    printf("Press A on controller 1...\\n");

    while (1) {
        usb_do_poll();
        if (get_controller_data(&pad, 0) && pad.a) {
            printf("Button A pressed!\\n");
        }
    }
    return 0;
}`
};

const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
  mode: "text/x-csrc",
  theme: "dracula",
  lineNumbers: true,
  indentUnit: 4,
  tabSize: 4,
  lineWrapping: false,
  autofocus: true
});

editor.setValue(templates.hello);

const projectNameInput = document.getElementById("projectName");
const templateSelect = document.getElementById("templateSelect");
const toast = document.getElementById("toast");
let toastTimer;

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("visible");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("visible"), 3200);
}

function safeProjectName(value) {
  const name = value.trim().replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^[.-]+|[.-]+$/g, "");
  return name || "My360App";
}

templateSelect.addEventListener("change", (event) => {
  editor.setValue(templates[event.target.value] || templates.hello);
  editor.focus();
});

projectNameInput.addEventListener("input", () => {
  document.querySelector(".project-label").lastChild.textContent = ` ${safeProjectName(projectNameInput.value)}`;
});

document.getElementById("exportZipBtn").addEventListener("click", async () => {
  if (typeof JSZip === "undefined") {
    showToast("Could not load the ZIP library. Check your connection and try again.");
    return;
  }

  const projectName = safeProjectName(projectNameInput.value);
  const makefile = `TARGET = xenon
SOURCES = src/main.c
OBJS = $(SOURCES:.c=.o)

include $(DEVKITXENON)/rules

all: $(TARGET).elf

$(TARGET).elf: $(OBJS)
\t$(LD) $(LDFLAGS) -o $@ $^ $(LIBS)

clean:
\trm -f $(OBJS) $(TARGET).elf
`;

  const githubWorkflow = `name: Build Xbox 360 Homebrew
on: [push]
jobs:
  build:
    runs-on: ubuntu-latest
    container:
      image: free60/libxenon:latest
    steps:
      - uses: actions/checkout@v4
      - name: Compile xenon.elf
        run: make
      - name: Upload xenon.elf
        uses: actions/upload-artifact@v4
        with:
          name: ${projectName}-xenon-elf
          path: xenon.elf
`;

  const readme = `# ${projectName}\n\nA starter Xbox 360 homebrew project using libXenon.\n\n## Build\n\nPush this project to GitHub with Actions enabled. The included workflow attempts to build it and upload \\`xenon.elf\\` as an artifact. Build availability depends on the libXenon container and toolchain.\n\n## Run on hardware\n\nThis ELF is for compatible homebrew-capable Xbox 360 setups. Copy the build artifact to a FAT32 USB drive and launch it using XeLL. A stock retail console cannot run arbitrary homebrew ELF files.\n`;

  const zip = new JSZip();
  zip.file("src/main.c", editor.getValue());
  zip.file("Makefile", makefile);
  zip.file("README.md", readme);
  zip.file(".github/workflows/build.yml", githubWorkflow);

  try {
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName}.zip`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
    showToast("Project ZIP exported. Add it to a GitHub repository to build.");
  } catch (error) {
    console.error("Project export failed:", error);
    showToast("Export failed. Please try again.");
  }
});
