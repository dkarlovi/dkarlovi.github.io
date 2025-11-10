const Encore = require('@symfony/webpack-encore');

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

Encore
    .setOutputPath('public/assets')
    .setPublicPath(Encore.isProduction() ? new URL(process.env.BASE_URL).pathname.replace(/\/$/, '') + '/assets' : '/assets')
    .setManifestKeyPrefix('assets/')
    .addEntry('app', './assets/app.ts')
    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .copyFiles({
        from: './assets/images',
        to: 'images/[path][name].[hash:8].[ext]',
    })
    .configureDevServerOptions((options) => {
        options.allowedHosts = 'all';
        options.liveReload = true;
        options.hot = true;
        options.watchFiles = [
            './templates/**/*',
            './content/**/*',
        ];
    })
    .cleanupOutputBeforeBuild()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = 3;
    })
    .enableSassLoader((options) => {
        options.sassOptions = {
            silenceDeprecations: ['import'],
            quietDeps: true,
        };
    })
    // .enableTypeScriptLoader()
    .enableIntegrityHashes(Encore.isProduction())
;

module.exports = Encore.getWebpackConfig();
