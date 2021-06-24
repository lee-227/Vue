// This is where project configuration and plugin options are located.
// Learn more: https://gridsome.org/docs/config

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

module.exports = {
  siteName: 'Lee',
  siteDescription: '一款由 gridsome 实现的静态博客',
  plugins: [
    {
      use: '@gridsome/source-filesystem',
      options: {
        path: 'content/**/*.md',
        typeName: 'markdownPost'
      }
    },
    {
      use: '@gridsome/source-strapi',
      options: {
        apiURL: 'http://localhost:1337',
        queryLimit: 1000, // Defaults to 100
        contentTypes: ['post', 'tag']
        // singleTypes: ['impressum'],
        // Possibility to login with a Strapi user,
        // when content types are not publicly available (optional).
        // loginData: {
        //   identifier: '',
        //   password: ''
        // }
      }
    }
  ],
  templates: {
    StrapiPost: [
      {
        path: '/post/:id',
        component: './src/templates/Post.vue'
      }
    ]
  }
}
