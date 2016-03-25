import babel from 'rollup-plugin-babel';
import nodeResolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';

export default {
  entry: 'src/index.js',
  moduleName: 'rollup',
  plugins: [
    babel({
      presets: ['es2015-rollup', 'stage-0'],
      exclude: 'node_modules/**',
      babelrc: false,
    }),
    nodeResolve({
      jsnext: true,
      main: true,
    }),
    commonjs({
      include: 'node_modules/**',
    }),
  ],
};
