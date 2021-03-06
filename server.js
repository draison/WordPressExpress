/* eslint no-console: 0 */
import path from 'path';
import browserSync from 'browser-sync';
import express from 'express';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import webpackMiddleware from 'webpack-dev-middleware';
import webpackHotMiddleware from 'webpack-hot-middleware';
import config from './webpack.config.js';
import {graphql} from 'graphql';
import graphqlHTTP from 'express-graphql';
import Schema from './schema/schema';

const isDeveloping = process.env.NODE_ENV !== 'production';
const APP_PORT = isDeveloping ? 3100 : process.env.PORT || 3000;
const GRAPHQL_PORT = 8080;

const graphQLServer = express();
let app = express();

graphQLServer.use('/', graphqlHTTP({
  graphiql: true,
  pretty: true,
  schema: Schema,
}));

graphQLServer.listen(GRAPHQL_PORT, () => console.log(
  `GraphQL Server is now running on http://localhost:${GRAPHQL_PORT}`
));

if (isDeveloping) {

  const compiler = webpack(config);

  app = new WebpackDevServer(compiler, {
    hot: true,
    historyApiFallback: true,
    contentBase: 'src',
    proxy: {'/graphql': `http://localhost:${GRAPHQL_PORT}`},
    publicPath: config.output.publicPath,
    stats: {
      colors: true,
      hash: false,
      timings: true,
      chunks: false,
      chunkModules: false,
      modules: false
    }
   });

   app.use(webpackHotMiddleware(compiler));

} else {
  app.use(express.static('./dist'));
  app.use('/graphql', graphqlHTTP(request => ({
      graphiql: true,
      pretty: true,
      schema: WordExpressSchema,
    })
  ));
  app.get('*', function response(req, res, next) {
    res.sendFile(path.join(__dirname, '/index.html'));
  });
}

app.listen(APP_PORT, () => {
  console.log(`App is now running on http://localhost:${APP_PORT}`);
});
