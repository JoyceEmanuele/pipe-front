module.exports = {
  env: {
    browser: true,
    es6: true,
    jest: true
  },
  extends: ['plugin:react/recommended', 'airbnb', 'plugin:import/typescript', 'plugin:@typescript-eslint/recommended', 'plugin:storybook/recommended'],
  globals: {
    Atomics: 'readonly',
    SharedArrayBuffer: 'readonly',
    JSX: 'readonly'
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true
    },
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  plugins: ['react', '@typescript-eslint', 'import', 'jsx-a11y', 'react-hooks'],
  rules: {
    "linebreak-style": 0,
    'react/jsx-filename-extension': ['error', {
      extensions: ['.tsx']
    }],
    'import/extensions': ['error', 'ignorePackages', {
      ts: 'never',
      tsx: 'never',
      js: 'never',
      jsx: 'never'
    }],
    "import/order": "off",
    'react/react-in-jsx-scope': 'off',
    'import/prefer-default-export': 'off',
    'no-use-before-define': 'off',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn',
    'react/jsx-no-bind': 'off',
    'import/no-extraneous-dependencies': 'off',
    'react/jsx-props-no-spreading': 'off',
    'react/require-default-props': 'off',
    'jsx-a11y/alt-text': 'off',
    'max-len': 'off',
    'no-unused-expressions': 'off',
    'no-nested-ternary': 'off',
    'react/prop-types': 'off',
    'no-plusplus': 'off',
    'react/destructuring-assignment': 'off',
    'no-continue': 'off',
    'no-param-reassign': 'off',
    'react/no-array-index-key': 'off',
    'no-mixed-operators': 'off',
    'camelcase': 'off',
    'array-callback-return': 'off',
    'consistent-return': 'off',
    'no-shadow': 'off',
    'no-restricted-syntax': 'off',
    'no-await-in-loop': 'off',
    'prefer-destructuring': 'off',
    'jsx-a11y/control-has-associated-label': 'off',
    'jsx-a11y/anchor-has-content': 'off',
    'jsx-a11y/no-static-element-interactions': 'off',
    'jsx-a11y/click-events-have-key-events': 'off',
    'jsx-a11y/label-has-associated-control': 'off',
    'no-async-promise-executor': 'off',
    'no-return-assign': 'off',
    'default-case': 'off',
    'no-sequences': 'off',
    '@typescript-eslint/ban-types': 'off',
    'jsx-a11y/anchor-is-valid': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    'no-underscore-dangle': 'off',
    'guard-for-in': 'off',
    'no-multi-assign': 'off',
    'import/no-cycle': 'off',
    'jsx-a11y/no-noninteractive-element-interactions': 'off',
    'brace-style': 'off',
    'no-empty': 'off',
    'no-prototype-builtins': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-console': 'off',
    'no-alert': 'off',
    'react/no-unused-prop-types': 'off'
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      typescript: {
        directory: '.'
      },
      node: {
        extensions: ['.ts', '.tsx', '.js', '.jsx']
      },
      'babel-plugin-root-import': {
        paths: [{
          rootPathSuffix: 'src'
        }]
      }
    }
  }
};