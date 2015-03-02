module.exports = function () {

    var packageinfo = require('../package.json'),
        version = packageinfo.version || '0.0.0',
        name = 'nml';

    var argv = require('argv')
        .version(version)
        .info("Usage: " + name + " FILE [options]\n\n" +
              "FILE:  main '.js' file.\n\n" +
              "Options:")
        .option([
            {   name:           'source',
                short:          's',
                type:           'csv,path',
                description:    'Source files or directories to merge.',
                example:        "'" + name + " --source=file1,file2,..' or '" + name + " -s file1 -s file2..'"
            },
            {   name:           'output',
                short:          'o',
                type:           'path',
                description:    'Output file',
                example:        "'" + name + " --outout=file' or '" + name + " -o file'"
            },
            {   name:           'core',
                short:          'c',
                type:           'path',
                description:    "'Directry of core modules. (default is './core')",
                example:        "'" + name + " --core=path' or '" + name + " -c path'"
            },
            {   name:           'nodecore',
                short:          'n',
                type:           'path',
                description:    "'Directry of Node.js core modules. (default is './node_core')",
                example:        "'" + name + " --nodecore=path' or '" + name + " -n path'"
            },
            {   name:           'kernel',
                short:          'k',
                type:           'path',
                description:    "nml-kernel file.",
                example:        "'" + name + " --kernel=file' or '" + name + " -k file'"
            }
        ])
        .run();

    if (argv.targets.length > 1) {
        console.error('Error: too many main files.');
        process.exit(1);
    }

    var fs = require('fs');
    var path = require('path');

    var cwd = process.cwd(),
        packageJson = null,
        projectdir = cwd,
        mainfile = argv.targets.length === 0 ? cwd : path.join(cwd, argv.targets[0]);
        // TODO: check if resolve is better way?

    if (fs.existsSync(mainfile)) {
        var stat = fs.statSync(mainfile);

        if (stat.isDirectory()) {
            if (fs.existsSync(path.join(mainfile, './package.json'))) {
                packageJson = path.join(mainfile, './package.json');
                projectdir = mainfile;
                mainfile = null;
            }

        } else if (stat.isFile() && (path.extname(mainfile) === '.json')) {
            packageJson = mainfile;
            projectdir = path.dirname(mainfile);
            mainfile = null;
        }
    }

    // all options should be fully resolved path.
    // and be possibly using platform path delimiter('\').
    var config = {
        rootdir:    projectdir,
        mainfile:   mainfile,

        source:     argv.options.source     || null,
        output:     argv.options.output     || null,
        core:       argv.options.core       || null,
        node_core:  argv.options.nodecore   || null,
        kernel:     argv.options.kernel     || null
    };

    // Create configure Application.
    var codegs = require('./codegs');
    var code = codegs.create();
    var error;

    if (packageJson) {
        error = code.loadPackageJson(packageJson);
        _check(error);
    }

    error = code.addConfig(config);
    _check(error);

    error = code.run();
    _check(error);

    process.exit(0);
};

function _check(error) {
    if (error !== null) {
        if (error.substr(0, 6) === 'Error:') {
            console.error(error);
            console.log('');
            process.exit(1);
        } else {
            console.log(error);
        }
    }
}


if (module.parent === null) {
    module.exports();
}
