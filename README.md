@allejo/beatrice
================

A tool to keep an inventory of when features were introduced in a library or framework

[![oclif](https://img.shields.io/badge/cli-oclif-brightgreen.svg)](https://oclif.io)
[![Version](https://img.shields.io/npm/v/@allejo/beatrice.svg)](https://npmjs.org/package/@allejo/beatrice)
[![Downloads/week](https://img.shields.io/npm/dw/@allejo/beatrice.svg)](https://npmjs.org/package/@allejo/beatrice)
[![License](https://img.shields.io/npm/l/@allejo/beatrice.svg)](https://github.com/allejo/beatrice/blob/master/package.json)

<!-- toc -->
* [Usage](#usage)
* [Commands](#commands)
<!-- tocstop -->
# Usage
<!-- usage -->
```sh-session
$ npm install -g @allejo/beatrice
$ beatrice COMMAND
running command...
$ beatrice (-v|--version|version)
@allejo/beatrice/0.0.0 darwin-x64 node-v10.13.0
$ beatrice --help [COMMAND]
USAGE
  $ beatrice COMMAND
...
```
<!-- usagestop -->
# Commands
<!-- commands -->
* [`beatrice help [COMMAND]`](#beatrice-help-command)
* [`beatrice inventory REPODIR SRCDIRS`](#beatrice-inventory-repodir-srcdirs)

## `beatrice help [COMMAND]`

display help for beatrice

```
USAGE
  $ beatrice help [COMMAND]

ARGUMENTS
  COMMAND  command to show help for

OPTIONS
  --all  see all commands in CLI
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/v3.1.0/src/commands/help.ts)_

## `beatrice inventory REPODIR SRCDIRS`

Create an inventory of an API

```
USAGE
  $ beatrice inventory REPODIR SRCDIRS

OPTIONS
  -f, --force
  -l, --lang=lang    The language to parse
  -p, --prereleases
```

_See code: [src/commands/inventory.ts](https://github.com/allejo/beatrice/blob/v0.0.0/src/commands/inventory.ts)_
<!-- commandsstop -->
