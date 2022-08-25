const path = require('path');

function getLoader(loader) {
  const nullstackPath = path.dirname(require.resolve('nullstack'));
  return path.join(nullstackPath, 'loaders', loader);
}

const nullstackJavascript = {
  test: /\.(njs|nts|jsx|tsx)$/,
  use: {
    loader: require.resolve('swc-loader'),
    options: {
      jsc: {
        parser: {
          syntax: 'ecmascript',
          exportDefaultFrom: true,
          jsx: true,
        },
        transform: {
          react: {
            pragma: 'Nullstack.element',
            pragmaFrag: 'Nullstack.fragment',
            throwIfNamespace: true,
          },
        },
      },
      env: {
        targets: { node: '10' },
      },
    },
  },
};

const nullstackTypescript = {
  test: /\.(nts|tsx)$/,
  use: {
    loader: require.resolve('swc-loader'),
    options: {
      jsc: {
        parser: {
          syntax: 'typescript',
          exportDefaultFrom: true,
          tsx: true,
        },
        transform: {
          react: {
            pragma: 'Nullstack.element',
            pragmaFrag: 'Nullstack.fragment',
            throwIfNamespace: true,
          },
        },
      },
      env: {
        targets: { node: '10' },
      },
    },
  },
};

module.exports = {
  stories: ['../src/**/*.stories.mdx', '../src/**/*.stories.tsx'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials', '@storybook/addon-interactions'],
  framework: '@storybook/html',
  core: {
    disableTelemetry: true,
    builder: '@storybook/builder-webpack5',
  },
  webpackFinal: (config) => {
    config.module.rules.unshift(
      {
        test: /nullstack.js$/,
        loader: getLoader('string-replace.js'),
        options: {
          multiple: [
            {
              search: /{{NULLSTACK_ENVIRONMENT_NAME}}/gi,
              replace: 'client',
            },
          ],
        },
      },
      nullstackJavascript,
      {
        test: /\.(njs|nts|jsx|tsx)$/,
        loader: getLoader('remove-import-from-client.js'),
      },
      {
        test: /\.(njs|nts|jsx|tsx)$/,
        loader: getLoader('inject-nullstack.js'),
      },
      {
        test: /\.(njs|nts|jsx|tsx)$/,
        loader: getLoader('remove-static-from-client.js'),
      },
      nullstackTypescript,
      {
        test: /\.(njs|nts|jsx|tsx)$/,
        loader: getLoader('add-source-to-node.js'),
      },
      {
        test: /\.(njs|nts|jsx|tsx)$/,
        loader: getLoader('register-inner-components.js'),
      }
    );

    return config;
  },
};
