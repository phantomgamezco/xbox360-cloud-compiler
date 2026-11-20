const templates = {
  hello: `#include <stdio.h>
#include <stdlib.h>
#include <xenos/xenos.h>
#include <console/console.h>
#include <xenon_smc/xenon_smc.h>

int main() {
    xenos_init(VIDEO_MODE_AUTO);
    console_init();

    printf("\\n====================================\\n");
    printf("  Hello from Xbox 360 Homebrew!\\n");
    printf("====================================\\n\\n");
    printf("Running natively via libXenon.\\n");

    while (1) {
        // Main loop
    }
    return 0;
}`,
  controller: `#include <stdio.h>
#include <xenos/xenos.h>
#include <console/console.h>
#include <input/input.h>
#include <usb/usbmain.h>

int main() {
    xenos_init(VIDEO_MODE_AUTO);
    console_init();
    usb_init();
    usb_do_poll();

    struct controller_data_s pad;
    printf("Press A on Controller 1...\\n");

    while (1) {
        usb_do_poll();
        if (get_controller_data(&pad, 0)) {
            if (pad.a) {
                printf("Button A pressed!\\n");
            }
        }
    }
    return 0;
}`
};

const editor = CodeMirror.fromTextArea(document.getElementById("codeEditor"), {
  mode: "text/x-csrc",
  theme: "dracula",
  lineNumbers: true,
  indentUnit: 4
});

editor.setValue(templates.hello);

document.getElementById("templateSelect").addEventListener("change", (e) => {
  editor.setValue(templates[e.target.value]);
});

document.getElementById("exportZipBtn").addEventListener("click", async () => {
  const projectName = document.getElementById("projectName").value.trim() || "My360App";
  const cCode = editor.getValue();

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

  const zip = new JSZip();
  zip.file("src/main.c", cCode);
  zip.file("Makefile", makefile);
  zip.file(".github/workflows/build.yml", githubWorkflow);

  const blob = await zip.generateAsync({ type: "blob" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${projectName}.zip`;
  link.click();
});
