# Tips and Profiles

## Table of Contents
- [Tips and Profiles](#tips-and-profiles)
  - [Table of Contents](#table-of-contents)
    - [Tips for VS Code configurations](#tips-for-vs-code-configurations)
    - [Profiles](#profiles)

### Tips for VS Code configurations
```json
{
    "java.configuration.runtimes": [
        {
            "name": "JavaSE-8",
            "path": "/path/for/jdk-8",
        },
        {
            "name": "JavaSE-17",
            "path": "/path/for/jdk-17",
        }
    ],
    "java.home": "/path/for/jdk",
    "sonarlint.ls.javaHome": "/path/for/jdk",
    "editor.codeLens": true,
    "javascript.referencesCodeLens.enabled": true,
    "typescript.referencesCodeLens.enabled": true,
    "java.referencesCodeLens.enabled": true,
    "editor.fontSize": 12,
    "php.suggest.basic": false,
    "php.validate.run": "onType",
    "explorer.confirmDelete": true,
    "explorer.confirmDragAndDrop": true,
}
```

### Profiles
```json
[
    {
        "name": "VSCode",
        "hide": true,
        "data": [
            "gruntfuggly.todo-tree",
            "CoenraadS.bracket-pair-colorizer",
            "alefragnani.project-manager",
            "alefragnani.Bookmarks",
            "SirTori.indenticator",
            "nobuhito.printcode",
            "naumovs.color-highlight",
            "wayou.vscode-todo-highlight",
            "IBM.output-colorizer",
            "formulahendry.terminal",
            "ryu1kn.partial-diff",
            "BriteSnow.vscode-toggle-quotes",
            "wwm.better-align",
            "Rubymaniac.vscode-paste-and-indent",
            "mkxml.vscode-filesize",
            "ms-devlabs.extension-manifest-editor"
        ]
    },
    {
        "name": "Themes",
        "hide": true,
        "data": [
            "rokoroku.vscode-theme-darcula",
            "vscode-icons-team.vscode-icons",
            "orepor.color-tabs-vscode-ext"
        ]
    },
    {
        "name": "Generic",
        "hide": true,
        "data": [
            "christian-kohler.path-intellisense",
            "aaron-bond.better-comments",
            "kevinkyang.auto-comment-blocks",
            "stackbreak.comment-divider",
            "VisualStudioExptTeam.vscodeintellicode",
            "rpinski.shebang-snippets",
            "SonarSource.sonarlint-vscode",
            "chrmarti.regex",
            "DominicVonk.parameter-hints",
            "vincaslt.highlight-matching-tag",
            "stylelint.vscode-stylelint",
            "usernamehw.errorlens",
            "hediet.debug-visualizer",
            "formulahendry.code-runner"
        ]
    },
    {
        "name": "Multi-Profile Dependencies",
        "hide": true,
        "data": [
            "Pivotal.vscode-manifest-yaml", // Spring, YML
            "pivotal.vscode-concourse", // Spring, CI-CD
            "redhat.vscode-yaml" // XML/HTML, OpenAPI
        ]
    },
    {
        "name": "Git/CI-CD",
        "data": [
            "eamodio.gitlens",
            "rubbersheep.gi"
        ]
    },
    {
        "name": "Markdown",
        "data": [
            "yzhang.markdown-all-in-one",
            "xuzn.pikchr-markdown-preview"
        ]
    },
    {
        "name": "WSL",
        "data": [
            "ms-vscode-remote.remote-wsl"
        ]
    },
    {
        "name": "Server Connection",
        "data": [
            "liximomo.sftp"
        ]
    },
    {
        "name": "Latex",
        "data": [
            "torn4dom4n.latex-support"
        ]
    },
    {
        "name": "JSON",
        "data": [
            "nickdemayo.vscode-json-editor"
        ]
    },
    {
        "name": "ASCIIDOC",
        "data": [
            "asciidoctor.asciidoctor-vscode"
        ]
    },
    {
        "name": "OpenAPI",
        "data": [
            "42Crunch.vscode-openapi"
        ]
    },
    {
        "name": "Excel",
        "data": [
            "GrapeCity.gc-excelviewer"
        ]
    },
    {
        "name": "UML",
        "data": [
            "jebbs.plantuml"
        ]
    },
    {
        "name": "Drawio",
        "data": [
            "hediet.vscode-drawio"
        ]
    },
    {
        "name": "CSV",
        "data": [
            "mechatroner.rainbow-csv"
        ]
    },
    {
        "name": "Docker",
        "data": [
            "ms-azuretools.vscode-docker",
            "p1c2u.docker-compose"
        ]
    },
    {
        "name": "Angular",
        "data": [
            "Angular.ng-template",
            "johnpapa.Angular2"
        ]
    },
    {
        "name": "React",
        "data": [
            "dsznajder.es7-react-js-snippets",
            "msjsdiag.vscode-react-native",
            "team-sapling.sapling"
        ]
    },
    {
        "name": "VueJS",
        "data": [
            "octref.vetur"
        ]
    },
    {
        "name": "Python",
        "data": [
            "njpwerner.autodocstring",
            "ms-python.python",
            "magicstack.MagicPython",
            "ms-python.vscode-pylance",
            "mgesbert.python-path",
            "KevinRose.vsc-python-indent"
        ]
    },
    {
        "name": "C/C++/CMAKE",
        "data": [
            "ms-vscode.cpptools",
            "Hyeon.c-math-viewer",
            "amiralizadeh9480.cpp-helper",
            "davidbroetje.algorithm-mnemonics-vscode",
            "jeff-hykin.better-cpp-syntax",
            "danielpinto8zz6.c-cpp-compile-run",
            "austin.code-gnu-global",
            "twxs.cmake",
            "cschlosser.doxdocgen",
            "Hiyajo.cppcomment",
            "ms-vscode.cmake-tools"
        ]
    },
    {
        "name": "PHP",
        "data": [
            "bmewburn.vscode-intelephense-client",
            "neilbrayfield.php-docblocker",
            "rexshi.phpdoc-comment-vscode-plugin",
            "felixfbecker.php-debug",
            "rifi2k.format-html-in-php",
            "junstyle.php-cs-fixer",
            "ikappas.phpcs",
            "kokororin.vscode-phpfmt",
            "ikappas.composer",
            "robberphex.php-debug"
        ]
    },
    {
        "name": "Typescript/Javascript/Node",
        "data": [
            "steoates.autoimport",
            "ms-vscode.vscode-typescript-tslint-plugin",
            "xabikos.JavaScriptSnippets",
            "christian-kohler.npm-intellisense",
            "dbaeumer.vscode-eslint",
            "stevencl.adddoccomments",
            "NicholasHsiang.vscode-javascript-comment",
            "rbbit.typescript-hero",
            "lannonbr.vscode-js-annotations",
            "tusaeff.vscode-typescript-destructure-plugin",
            "dotup.dotup-vscode-interface-generator",
            "vilicvane.es-quotes",
            "wallabyjs.quokka-vscode",
            "mikehanson.auto-barrel",
            "idered.npm",
            "juanallo.vscode-dependency-cruiser"
        ]
    },
    {
        "name": "Bash/Ksh",
        "data": [
            "remisa.shellman",
            "foxundermoon.shell-format",
            "mads-hartmann.bash-ide-vscode",
            "rogalmic.bash-debug",
            "rogalmic.ksh-debug",
            "timonwong.shellcheck",
            "truman.autocomplate-shell"
        ]
    },
    {
        "name": "Power Shell",
        "data": [
            "ms-vscode.powershell"
        ]
    },
    {
        "name": "XML/HTML",
        "data": [
            "dotjoshjohnson.xml",
            "Zignd.html-css-class-completion",
            "krizzdewizz.tag-rename",
            "formulahendry.auto-close-tag",
            "abusaidm.html-snippets",
            "redhat.vscode-xml",
            "formulahendry.auto-rename-tag",
            "fabianlauer.vs-code-xml-format"
        ]
    },
    {
        "name": "CSS/SASS/SCSS/LESS",
        "data": [
            "sporiley.css-auto-prefix",
            "michelemelluso.code-beautifier",
            "pranaygp.vscode-css-peek",
            "mrmlnc.vscode-autoprefixer"
        ]
    },
    {
        "name": "Azure",
        "data": [
            "bencoleman.armview"
        ]
    },
    {
        "name": "C#/.Net",
        "data": [
            "ms-dotnettools.csharp",
            "formulahendry.dotnet-test-explorer",
            "k--kato.docomment",
            "formulahendry.dotnet",
            "jmrog.vscode-nuget-package-manager",
            "Fudge.auto-using",
            "richardzampieriprog.csharp-snippet-productivity",
            "roadsidejesus.csharp-helper"
        ]
    },
    {
        "name": "Cypress",
        "data": [
            "andrew-codes.cypress-snippets",
            "shelex.vscode-cy-helper"
        ]
    },
    {
        "name": "Jest",
        "data": [
            "firsttris.vscode-jest-runner",
            "andys8.jest-snippets"
        ]
    },
    {
        "name": "Java/Maven",
        "data": [
            "redhat.java",
            "youmaycallmev.vscode-java-saber",
            "vscjava.vscode-maven",
            "vscjava.vscode-java-debug",
            "vscjava.vscode-java-test",
            "ithildir.java-properties",
            "dgileadi.java-decompiler"
        ]
    },
    {
        "name": "Spring",
        "data": [
            "vscjava.vscode-spring-boot-dashboard",
            "vscjava.vscode-spring-initializr",
            "Pivotal.vscode-spring-boot"
        ]
    },
    {
        "name": "Tomcat",
        "data": [
            "adashen.vscode-tomcat"
        ]
    }
]
```