/**
 * Minimum webpack Config for WordPress Block Plugin
 *
 * webpack basics — If you are new the webpack here's all you need to know:
 *     1. webpack is a module bundler. It bundles different JS modules together.
 *     2. webpack needs and entry point and an ouput to process file(s) and bundle them.
 *     3. By default webpack only understands JavaScript but Loaders enable webpack to
 *        process more than just JavaScript files.
 *     4. In the file below you will find an entry point, an ouput, and a babel-loader
 *        that tests all .js files excluding the ones in node_modules to process the
 *        modern JavaScript and make it compatible with older browsers i.e. it converts the
 *        code written witten with modern JavaScript (new standards of JavaScript) into old
 *        JavaScript through a Babel loader.
 *
 * Instructions: How to build or develop with this Webpack config:
 *     1. In the command line browse the folder `02-basic-esnext` where
 *        this `webpack.config.js` file is present.
 *     2. Run the `npm run dev` or `npm run build` for development or
 *        production respectively.
 *     3. To read what these NPM Scripts do, read the `package.json` file.
 *
 * @link webpack https://webpack.js.org/
 * @link webpack concepts https://webpack.js.org/concepts/
 * @author Ahmad Awais https://github.com/ahmadawais
 * @since 1.0.0
 */
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");

function recursiveIssuer(m) {
	if (m.issuer) {
		return recursiveIssuer(m.issuer);
	} else if (m.name) {
		return m.name;
	} else {
		return false;
	}
}

module.exports = {
	// Entry.
	entry: {
		block: "./blocks.js",
		editor: "./block/editor.scss",
		style: "./block/style.scss",
	}, // Import all JavaScript dependencies in this file.
	
	// Output.
	output: {
		path: __dirname, // Path to produce the output. Set to the current directory.
		filename: "../dist/[name].build.js" // Filename of the file that webpack builds.
	},

	// Loaders.
	// The configuration below has defined a rules property for a single module with
	// two required properties: test and use. This tells webpack's compiler the following:
	// "Hey webpack compiler, when you come across a '.js' or '.jsx' file inside of a
	// require()/import statement, use the babel-loader to transform it before you add
	// it to the bundle."
	plugins: [
		new MiniCssExtractPlugin({
			filename: "../dist/[name].build.css"
		})
	],
	module: {
		rules: [
			{
				test: /\.(js|jsx)$/, // Identifies which file or files should be transformed.
				use: { loader: "babel-loader" }, // Babel loader to transpile modern JavaScript.
				exclude: /(node_modules|bower_components)/ // JavaScript files to be ignored.
			},
			
			{
				test: /\.(sa|sc|c)ss$/i,
				use: [
					MiniCssExtractPlugin.loader,
					"css-loader",
					"postcss-loader",
					"sass-loader",
				],
			},
		]
	},
	optimization: {
		minimizer: [
			`...`,
			new CssMinimizerPlugin(),
		],
		splitChunks: {
			cacheGroups: {
				editorStyles: {
					name: 'editor',
					test: (m, c, entry = 'editor') =>
						m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
					chunks: 'all',
					enforce: true,
				},
				frontendStyles: {
					name: 'frontend',
					test: (m, c, entry = 'frontend') =>
						m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
					chunks: 'all',
					enforce: true,
				},
			},
		},
	}
};