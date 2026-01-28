module.exports = {
  apps: [
    {
      name: "rcl-auth",
      script: "dist/main.js",
      cwd: "/opt/rcl/services/auth-service",
      env_file: ".env",
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
