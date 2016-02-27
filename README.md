# node module linker

A tool to pack Node.js module files with the special `require` function into one `.js` file.

1. [Version info](#version-info)
2. [First example](#first-example)
3. [Usage](#usage)
4. [Limitation and Enhancement](#limitation-and-enhancement)


## Version info:

Version: 0.9.0

Stability: [1 - Experimental](http://nodejs.org/api/documentation.html#documentation_stability_index) (but almost Stable)

Date: 2016-02-27

Changes:
- Change 'loaded' flag rule for main module. It's for original kernelfile function.
- Change option tag name in package.json, to 'nml_option'.
- Documents.

#### Related package
* ['codegs-core'](https://www.npmjs.org/package/codegs-core) includes some Node.js core modules.

## First example

main.js

```javascript
// main.js
var lib = require('./lib.js');
console.log('3 + 4 = ' + lib.sum(3, 4));
```

lib.js

```javascript
// lib.js
module.exports.sum = function (a, b) {
    return a + b;
};
```

those are valid Node.js modules.

```shell
$ node main.js
3 + 4 = 7
```

Then, try:

```shell
$ nml main.js
```

and you see merged long source code:

```shell
$ nml main.js
require('module').define('/lib.js',
function(exports, require, module, __filename, __dirname) {
// lib.js
module.exports.sum = function (a, b) {
    return a + b;
};
});
require('module').runmain('/main.js');
// main.js
var lib = require('./lib');
console.log('3 + 4 = ' + lib.sum(3, 4));
require('module').endmain('/main.js');
function require(path) {
    require = (function () {
            :
```

That code includes `main.js`, `lib.js` and special 'require' function.

```shell
$ nml main.js -o out.js
$ node out.js
3 + 4 = 7
```

In this case out.js runs alone without original lib.js.
And you can run out.js in other javascript environment.

### ex.1 Browser

    1. Create html file to load out.js.
    
        ```html
        <html>
        <head>
        </head>
        <body>
        <script type="text/javascript" src="out.js"></script>
        </body>
        </html>
        ```
    
    2. Open that file in browser.
    
    3. You'll see results in javascript console window.


### ex.2 Google apps script

    1. Create new GoogleAppsScript project and import ['gas-console'](https://www.npmjs.org/package/gas-console).
    
    2. Paste `out.js` into `code.gs` file.
    
    3. On menu bar, select `require` as execute function.
    
    4. `Run` or `Debug` button
    
    5. You'll see results in gas-console window.




## Usage

### install
```shell
$ npm install -g node-module-linker
```

### usage
```shell
$ nml MAINMODULE [ options ]
```

node-module-linker needs some information to work. Options let nml know those information.


### Minimum info to work
* Main module
* Project directory
* Source files
* Output file


#### Main module

Specify by command line, or `package.json`.

- nml let mainfile place to run first. and only this module will be put in global scope.
- It should be relative to the root of project directory.


#### Project directory

Current working directory, or directory of `package.json` specified by command line.

- nml needs file path information to pack files for `require()`. But full path(it may includes yhour personal name) is not suitable to emmbed sourcefile. For this, nml handle Project directory as a root(/).


#### Source files or directory

Command line option `-s` / `--source` or project directory by default.<br/>
Or, specified with `files` tag in `package.json`.

- One or more files/directories are able to set. Those files should be under the project directory.
- If not set by commandline option or `package.json`, nml use project directory as source directory.


#### Output file

Command line option `-o` / `--output` or `stdout` by default.



### Advanced Info to do more

* node_modules
* Core modules
* Node core modules
* nml_kernel (Experimental)

#### node_modules

No command line option. All modules in `PROJECT/node_modules/` will be packed, by default.<br/>
Or, only specified modules in `package.json` with `dependencies` tag.

- nml can handle node_modules.

- To load modules in `/node_modules`, no need to code fully filepath. Both of bellow are valid.

    ```shell
    var argv = require('/node_modules/argv.js');
    var argv = require('argv');
    ```

#### Core modules

`PROJECT/core` is default directory. or Any other directory set by option `-c` / `--core`.

Or, set in 'package.json'.

```json
}
    "nml_option": {
        "core": [ "your/core/files" ]
    }
}
```

- Core modules are able to load without directory name such as 'assert', 'http' in Node.js. It's same as node_modules, but always this takes priority.

- Modules in this directory, nml will assume to be core module. These modules will be laid out hidden path in output file.

#### NodeCore modules

`PROJECT/node_core` is default directory. or Any other directory set by option `-n` / `--nodecore`.

Or set in 'package.json'.

```json
}
    "nml_option": {
        "node_core": [ "your/node_core/files" ]
    }
}
```

- As same as Core modules. It's priority is between core module and node_modules.

    Core module > NodeCore modules > node_modules

- This directory is for Node.js core modules. If you want to use Node.js core files such as util, assert, etc. put it in
this directory.

**See also** [`codegs-core`](https://www.npmjs.org/package/codegs-core).

#### nml kernel (Experimental)

nml pack user modules with special 'require' function in 'module.js' of this project by default.
This option '-k' / '--kernel' changes that file to other user file.

- An output file of nml can be input file as nml kernel file.
- At first, pack favorite libralies in one .js file, then you can use it as kernel file including your favorite libralies.


## Limitation and Enhancement

### No Node.js Global Objects.

Node.js has some global objects (http://nodejs.org/api/globals.html).

But pure nml provides only one function 'require'. No other global namespace pollution.

**See also** [`codegs-core`](https://www.npmjs.org/package/codegs-core).


### Enhancement require to get Global Objects.

Browser or Google Apps Script also provides global objects such as `Logger`, `SpreadsheetApp`, etc.

'require()' of nml returns global object by name. It means this code returns original Logger object at Google apps script environment.

```javascript
var log = require('Logger');
```

**memo**<br>
This is for debugging target code on Node.js. Using this, It's easy to inject API objects.

When you want to use mock-Logger or mock-spreadsheet,.. write mock and put it in node_modules directory of parent directry.

ex. if your project root dir is `/home/path/to/project/`, then put mock in `/home/path/to/node_modules`.

Node.js search that path and find mock(should be named `Logger`).<br/>
nml doesn't pack that mock(Because it locate outside project.). and in GAS environment, `require` returns REAL objects.
