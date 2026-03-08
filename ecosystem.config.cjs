module.exports = {
  apps: [{
    name: 'starbright-web',
    script: 'dist/index.cjs',
    cwd: '/root/starbrightnights',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
