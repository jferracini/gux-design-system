'use strict';

var gulp = require('gulp');
var del = require('del');
var plugins = require('gulp-load-plugins')();
var mergeStream = require('stream-series');
var runSequence = require('run-sequence');
var path = require('path');
var fs = require('fs');
var browserSync = require('browser-sync');
var browserSyncSpa = require('browser-sync-spa');
var cheerio = require('cheerio');
var through = require('through2');
var extend = require('lodash.assign');

var supportedBrowsersArray = ['ie >= 9', 'last 3 versions'];
var browsers = ['google chrome', /*'iexplore'*/ ];

var filters = {
    ICON: '**/*.ico',
    IMAGE: '**/*.{png,jpeg,jpg,gif,svg}',
    FONT: '**/*.{otf,eot,ttf,woff,woff2}',
    JSON: '**/*.json',
    CSS: '**/*.css',
    LESS: '**/*.less',
    VENDOR_LESS: 'custom-main.less',
    MAIN_LESS: 'gx-main.less',
    HTML: '**/*.html',
    INTRO: '**/*.intro.json',
    JS: '**/*.js',
    ALL: '**/*'
};

var folders = {
    ICON: 'icons',
    IMAGE: 'images',
    FONT: 'fonts',
    DATA: 'data',
    STYLE: 'styles',
    SCRIPT: 'scripts'
};

var sources = {
    VENDOR: 'bower_components',
    RESOURCES: 'src/main/resources',
    MAIN: 'src/main/web',
    TEST: 'src/test/web'
};

var targets = {
    BASE: 'target',
    MAIN: 'target/main/web',
    TMP: 'target/tmp/web',
    DIST: 'dist'
};

//== Custom
//
//## Custom plugins

var gulpNgInclude = function(options) {
    options = extend({ trim: true }, options);

    function transform(file, encoding, next) {
        if (file.isNull()) {
            return next(null, file);
        }
        var $ = cheerio.load(file.contents.toString('utf8'), { decodeEntities: false });

        function readSource(src) {
            var filePath = path.join(file.base, src);
            var result = fs.readFileSync(filePath).toString();
            return result;
        }

        function processTag(i, ng) {
            var $ng = $(ng);
            var src = $ng.attr('src') || $ng.attr('ng-include');
            if (!src.match(/^'[^']+'$/g)) {
                return false;
            }
            $ng.removeAttr('src').removeAttr('ng-include');
            var before = '\n<!-- ngInclude: ' + src + ' -->\n';
            var after = '\n<!--/ngInclude: ' + src + ' -->\n';
            var include = readSource(src.substr(1, src.length - 2));
            if (options.trim && include) {
                include = include.trim();
            }
            $ng.replaceWith(before + include + after);
            return true;
        }
        while (true) {
            var tags = $('ng-include[src], [ng-include]');
            if (tags.length === 0) {
                file.contents = new Buffer($.html());
                return next(null, file);
            }
            var results = [];
            tags.each(function() {
                results.push(processTag.apply(null, arguments));
            });
            if (results.filter(Boolean).length === 0) {
                file.contents = new Buffer($.html());
                return next(null, file);
            }
        }
    }
    return through.obj(transform);
};

//== Utils
//
//## Util functions

var onError = function(err) {
    console.log(err);
};

var getPackageJson = function() {
    return JSON.parse(fs.readFileSync('./package.json'));
}

var getProjectFullName = function() {
    var packageJson = getPackageJson();
    return packageJson.name.replace('@', '').replace('/', '-') + '-v' + packageJson.version;
}

var getBowerStream = function(filter) {
    return gulp.src('./bower.json')
        .pipe(plugins.plumber({
            errorHandler: onError
        }))
        .pipe(plugins.mainBowerFiles())
        .pipe(plugins.if(!!filter, plugins.filter(filter)));
};

var getProjectStream = function(source, filter) {
    return gulp.src([path.join(source, filter)])
        .pipe(plugins.plumber({
            errorHandler: onError
        }));
};

var processResource = function(stream, target, folder) {
    return stream
        .pipe(plugins.flatten())
        .pipe(gulp.dest(path.join(target, folder)));
}

var transpileLessToCss = function(stream, fileName, target, folder) {
    return stream
        .pipe(plugins.lessImport(fileName))
        .pipe(gulp.dest(path.join(target, folder)))
        .pipe(plugins.less())
        .pipe(plugins.autoprefixer({
            browsers: supportedBrowsersArray,
            cascade: false
        }))
        .pipe(gulp.dest(path.join(target, folder)));
};

var minifyCss = function(stream, target, folder) {
    return stream
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.csso())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(target, folder)));
}

var concatJs = function(stream, fileName, target, folder) {
    return stream
        .pipe(plugins.concat(fileName))
        .pipe(gulp.dest(path.join(target, folder)));
};

var minifyJs = function(stream, target, folder) {
    return stream
        .pipe(plugins.sourcemaps.init())
        .pipe(plugins.uglify())
        .pipe(plugins.rename({
            suffix: '.min'
        }))
        .pipe(plugins.sourcemaps.write('./'))
        .pipe(gulp.dest(path.join(target, folder)));
};

var injectIndexHtml = function(target, stream, name) {
    var targetIndexPath = path.join(target, 'index.html');
    var targetIndexStream = gulp.src(targetIndexPath);
    var sourceIndexPath = path.join(sources.TEST, 'index.html');
    var sourceIndexStream = gulp.src(sourceIndexPath);
    return plugins.if(fs.existsSync(targetIndexPath), targetIndexStream)
        .pipe(plugins.if(!fs.existsSync(targetIndexPath), sourceIndexStream))
        .pipe(plugins.inject(stream, {
            name: name,
            ignorePath: [sources.VENDOR, sources.MAIN, sources.TEST, targets.TMP, targets.MAIN],
            transform: function(filepath, file, i, length) {
                if (filepath.slice(-4) === '.css') {
                    return '<link rel=\"stylesheet\" href=\"' + filepath.substring(1) + '">';
                } else if (filepath.slice(-3) === '.js') {
                    return '<script src="' + filepath.substring(1) + '"></script>';
                }
            }
        }))
        .pipe(gulp.dest(target));
};

var startServer = function(baseDir, browser) {
    browserSync.use(
        browserSyncSpa({
            selector: '[ng-app]'
        })
    );
    browserSync.init({
        host: 'localhost',
        port: 8080,
        startPath: '/',
        server: {
            baseDir: baseDir,
            index: 'index.html'
        },
        browser: browser === undefined ? 'default' : browser,
        ui: {
            port: 8088,
            weinre: {
                port: 8089
            }
        }
    });
};

//== Streams
//
//##

var getVendorCssStream = function() {
    var stream = mergeStream(getBowerStream([filters.LESS]), getProjectStream(path.join(sources.MAIN, folders.STYLE), filters.VENDOR_LESS));
    stream = transpileLessToCss(stream, getProjectFullName() + '-vendor.less', targets.MAIN, folders.STYLE);
    return (mergeStream(getBowerStream([filters.CSS]), stream))
        .pipe(plugins.concat(getProjectFullName() + '-vendor.css'))
        .pipe(plugins.bless({
            imports: false
        }))
        .pipe(plugins.rename(function(path) {
            path.basename = path.basename.replace('blessed', '');
        }))
        .pipe(gulp.dest(path.join(targets.MAIN, folders.STYLE)));
};

var getVendorMinCssStream = function() {
    return minifyCss(getVendorCssStream(), targets.MAIN, folders.STYLE);
};

var getMainCssStream = function() {
    return transpileLessToCss(getProjectStream(path.join(sources.MAIN, folders.STYLE), filters.MAIN_LESS), getProjectFullName() + '-main.less', targets.MAIN, folders.STYLE);
};

var getMainMinCssStream = function() {
    return minifyCss(getMainCssStream(), targets.MAIN, folders.STYLE);
};

var getTestCssStream = function() {
    return transpileLessToCss(getProjectStream(path.join(sources.MAIN, folders.STYLE), filters.MAIN_LESS), getProjectFullName() + '-test.less', targets.MAIN, folders.STYLE);
};

var getTestMinCssStream = function() {
    return minifyCss(getTestCssStream(), targets.MAIN, folders.STYLE);
};

var getVendorJsStream = function() {
    return getBowerStream(filters.JS);
};

var getVendorMinJsStream = function() {
    return minifyJs(concatJs(getVendorJsStream(), getProjectFullName() + '-vendor.js', targets.MAIN, folders.SCRIPT), targets.MAIN, folders.SCRIPT);
};

/*var getMainJsStream = function () {
	return getProjectStream(sources.MAIN, filters.JS)
		.pipe(plugins.angularFilesort());
};

var getMainHtmlStream = function () {
	return gulp.src(path.join(sources.MAIN, filters.HTML))
		.pipe(gulpNgInclude())
		.pipe(gulp.dest(targets.TMP));
};

var getMainMinJsStream = function () {
	var stream = getMainJsStream()
		.pipe(plugins.angularEmbedTemplates({ basePath: targets.TMP, minimize: { empty: true, quotes: true } }))
		.pipe(gulp.dest(path.join(targets.MAIN, folders.SCRIPT)));
	stream = concatJs(stream, getProjectFullName() + '-main.js', targets.MAIN, folders.SCRIPT);
	return minifyJs(stream, targets.MAIN, folders.SCRIPT);
};*/

var getMainHtmlStream = function() {
    return gulp.src(path.join(sources.MAIN, filters.HTML))
        .pipe(gulpNgInclude())
        .pipe(gulp.dest(targets.TMP));
};

var getMainJsStream = function() {
    return getProjectStream(sources.MAIN, filters.JS)
        .pipe(plugins.angularEmbedTemplates({ basePath: targets.TMP, minimize: { empty: true, quotes: true } }))
        .pipe(plugins.angularFilesort())
        .pipe(gulp.dest(targets.TMP));
};

var getMainMinJsStream = function() {
    return minifyJs(concatJs(getMainJsStream(), getProjectFullName() + '-main.js', targets.MAIN, folders.SCRIPT), targets.MAIN, folders.SCRIPT);
};

var getTestJsStream = function() {
    return getProjectStream(sources.TEST, filters.JS)
        .pipe(plugins.angularFilesort());
};

var getTestMinJsStream = function() {
    var testTemplateJsStream = gulp.src(path.join(sources.TEST, filters.HTML))
        .pipe(plugins.angularTemplatecache(getProjectFullName() + '-test-templates.js', {
            module: 'app',
            root: ''
        }));
    return minifyJs(concatJs(mergeStream(getTestJsStream(), testTemplateJsStream), getProjectFullName() + '-test.js', targets.MAIN, folders.SCRIPT), targets.MAIN, folders.SCRIPT);
};

//== Tasks
//
//## Gulp tasks.

gulp.task('checkstyle', function() {
    return null;
});

gulp.task('clean:target', ['checkstyle'], function() {
    return del([targets.BASE + '/*']);
});

gulp.task('icon:vendor', function() {
    return processResource(getBowerStream([filters.ICON]), targets.MAIN, folders.ICON);
});

gulp.task('icon:main', function() {
    return processResource(getProjectStream(sources.MAIN, filters.ICON), targets.MAIN, folders.ICON);
});

gulp.task('icon:test', function() {
    return processResource(getProjectStream(sources.TEST, filters.ICON), targets.MAIN, folders.ICON);
});

gulp.task('image:vendor', function() {
    return processResource(getBowerStream([filters.IMAGE]), targets.MAIN, folders.IMAGE);
});

gulp.task('image:main', function() {
    return processResource(getProjectStream(sources.MAIN, filters.IMAGE), targets.MAIN, folders.IMAGE);
});

gulp.task('image:test', function() {
    return processResource(getProjectStream(sources.TEST, filters.IMAGE), targets.MAIN, folders.IMAGE);
});

gulp.task('font:vendor', function() {
    return processResource(getBowerStream([filters.FONT]), targets.MAIN, folders.FONT);
});

gulp.task('font:main', function() {
    return processResource(getProjectStream(sources.MAIN, filters.FONT), targets.MAIN, folders.FONT);
});

gulp.task('font:test', function() {
    return processResource(getProjectStream(sources.TEST, filters.FONT), targets.MAIN, folders.FONT);
});

gulp.task('css:vendor', function() {
    return injectIndexHtml(targets.TMP, getVendorCssStream(), 'vendor');
});

gulp.task('css:vendor:min', function() {
    return injectIndexHtml(targets.MAIN, getVendorMinCssStream(), 'vendor');
});

gulp.task('css:main', function() {
    return injectIndexHtml(targets.TMP, getMainCssStream(), 'main');
});

gulp.task('css:main:min', function() {
    return injectIndexHtml(targets.MAIN, getMainMinCssStream(), 'main');
});

gulp.task('css:test', function() {
    return injectIndexHtml(targets.TMP, getTestCssStream(), 'test');
});

gulp.task('css:test:min', function() {
    return injectIndexHtml(targets.MAIN, getTestMinCssStream(), 'test');
});

gulp.task('data:main', function() {
    return processResource(getProjectStream(sources.MAIN, filters.JSON), targets.MAIN, folders.DATA);
});

gulp.task('data:test', function() {
    return processResource(getProjectStream(sources.TEST, filters.JSON), targets.MAIN, folders.DATA);
});

gulp.task('js:vendor', function() {
    return injectIndexHtml(targets.TMP, getVendorJsStream(), 'vendor');
});

gulp.task('js:vendor:min', function() {
    return injectIndexHtml(targets.MAIN, getVendorMinJsStream(), 'vendor');
});

gulp.task('html:main', function() {
    return getMainHtmlStream();
});

gulp.task('js:main', ['html:main'], function() {
    return injectIndexHtml(targets.TMP, getMainJsStream(), 'main');
});

gulp.task('js:main:min', ['html:main'], function() {
    return injectIndexHtml(targets.MAIN, getMainMinJsStream(), 'main');
});

gulp.task('js:test', function() {
    return injectIndexHtml(targets.TMP, getTestJsStream(), 'test');
});

gulp.task('js:test:min', function() {
    return injectIndexHtml(targets.MAIN, getTestMinJsStream(), 'test');
});

gulp.task('watch:src', function() {

    gulp.watch(path.join(sources.MAIN, filters.ICON))
        .on('change', browserSync.reload);
    gulp.watch(path.join(sources.MAIN, filters.IMAGE))
        .on('change', browserSync.reload);
    gulp.watch(path.join(sources.MAIN, filters.FONT))
        .on('change', browserSync.reload);
    gulp.watch(path.join(sources.MAIN, '**/custom-*.less'), ['css:vendor']);
    gulp.watch(path.join(sources.MAIN, '**/gx-*.less'), ['css:main']);
    gulp.watch([path.join(sources.MAIN, filters.HTML), path.join(sources.MAIN, filters.JS)], ['js:main']);

    gulp.watch(path.join(sources.TEST, filters.ICON))
        .on('change', browserSync.reload);
    gulp.watch(path.join(sources.TEST, filters.IMAGE))
        .on('change', browserSync.reload);
    gulp.watch(path.join(sources.TEST, filters.FONT))
        .on('change', browserSync.reload);
    gulp.watch(path.join(sources.TEST, filters.LESS), ['css:test']);
    gulp.watch(path.join(sources.TEST, filters.HTML))
        .on('change', browserSync.reload);
    gulp.watch(path.join(sources.TEST, filters.JS))
        .on('change', browserSync.reload);

    gulp.watch(path.join(targets.TMP, filters.JS))
        .on('change', browserSync.reload);
    gulp.watch(path.join(targets.MAIN, filters.ALL))
        .on('change', browserSync.reload);
});

gulp.task('build:src', function(callback) {
    runSequence('clean:target', ['icon:vendor', 'image:vendor', 'font:vendor'], 'css:vendor', 'css:main', 'css:test', 'js:vendor', 'js:main', 'js:test', 'watch:src', callback);
});

gulp.task('serve:src', ['build:src'], function() {
    startServer([targets.TMP, targets.MAIN, sources.VENDOR, sources.RESOURCES, sources.MAIN, sources.TEST], browsers)
});

gulp.task('serve:doc', ['build:src'], function() {
    startServer([targets.TMP, targets.MAIN, sources.VENDOR, sources.RESOURCES, sources.MAIN, sources.TEST], browsers)
});

gulp.task('build:target', function(callback) {
    runSequence('clean:target', ['icon:vendor', 'icon:main', 'icon:test',
        'image:vendor', 'image:main', 'image:test',
        'font:vendor', 'font:main', 'font:test',
        'data:main', 'data:test'
    ], 'css:vendor:min', 'css:main:min', 'css:test:min', 'js:vendor:min', 'js:main:min', 'js:test:min', callback);
});

gulp.task('serve:target', ['build:target'], function() {
    startServer([targets.MAIN], browsers)
});

gulp.task('clean:dist', ['checkstyle'], function() {
    return del([targets.DIST + '/*']);
});

gulp.task('intro', ['clean:dist'], function() {
    gulp.src([path.join(sources.TEST, '/**/intro/*.json')])
        .pipe(gulp.dest('./dist'));
});

gulp.task('resources:dist', ['clean:dist'], function() {
    return gulp.src([path.join(sources.RESOURCES, filters.ALL)])
        .pipe(gulp.dest(targets.DIST));
});

gulp.task('build:dist', ['build:target', 'intro', 'resources:dist'], function() {
    return gulp.src(path.join(targets.MAIN, filters.ALL))
        .pipe(gulp.dest(targets.DIST));
});

gulp.task('build:post-dist', ['build:dist'], function() {
    return gulp.src(path.join(targets.DIST, 'index.html'))
        // REPLACE BASE HREF .pipe(plugins.replace('<base href="/" target="_self">', '<base href="http://yoururl/" target="_self">'))
        .pipe(plugins.rename({
            basename: 'index'
        }))
        .pipe(gulp.dest(targets.DIST));
});


gulp.task('serve:dist', ['build:post-dist'], function() {
    startServer([targets.DIST], browsers)
});

gulp.task('default', ['build:post-dist']);