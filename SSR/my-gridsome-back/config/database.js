// module.exports = ({ env }) => ({
//   defaultConnection: 'default',
//   connections: {
//     default: {
//       connector: 'bookshelf',
//       settings: {
//         client: 'sqlite',
//         filename: env('DATABASE_FILENAME', '.tmp/data.db'),
//       },
//       options: {
//         useNullAsDefault: true,
//       },
//     },
//   },
// });

module.exports = ({ env }) => ({
  defaultConnection: "default",
  connections: {
    default: {
      connector: "bookshelf",
      settings: {
        client: "mysql",
        host: env("DATABASE_HOST", "106.75.254.155"),
        port: env.int("DATABASE_PORT", 3306),
        database: env("DATABASE_NAME", "gridsome"),
        username: env("DATABASE_USERNAME", "lee"),
        password: env("DATABASE_PASSWORD", "lijinlai"),
      },
      options: {},
    },
  },
});
