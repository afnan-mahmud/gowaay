module.exports = {
  apps: [{
    name: 'gowaay-api',
    script: './dist/index.js',
    instances: 'max', // Use all available CPUs
    exec_mode: 'cluster', // Enable cluster mode
    watch: false,
    max_memory_restart: '500M', // Restart if memory exceeds 500MB
    env: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    autorestart: true, // Auto restart if crash
    max_restarts: 10, // Maximum 10 restarts within 1 minute
    min_uptime: '10s', // Minimum uptime before considered stable
    restart_delay: 4000, // Delay between restarts (4 seconds)
    kill_timeout: 5000, // Grace period for shutdown
    listen_timeout: 10000, // Time to wait for app to be ready
    shutdown_with_message: true,
    wait_ready: false,
    
    // Advanced PM2 features
    exp_backoff_restart_delay: 100, // Exponential backoff for restarts
    instance_var: 'INSTANCE_ID',
    
    // Monitoring
    pmx: true,
    automation: false,
    
    // Environment-specific settings
    env_production: {
      NODE_ENV: 'production',
      PORT: 8080
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 8080
    }
  }]
};

