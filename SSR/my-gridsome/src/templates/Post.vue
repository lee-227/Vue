<template>
  <Layout>
    <header
      class="masthead"
      :style="`background-image: url('http://106.75.254.155:1337${$page.post.cover.url}')`"
    >
      <div class="container position-relative px-4 px-lg-5">
        <div class="row gx-4 gx-lg-5 justify-content-center">
          <div class="col-md-10 col-lg-8 col-xl-7">
            <div class="post-heading">
              <h1>{{ $page.post.title }}</h1>
              <h2 class="subheading">
                {{ $page.post.sub_title }}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </header>
    <!-- Post Content-->
    <article class="mb-4">
      <div class="container px-4 px-lg-5">
        <div class="row gx-4 gx-lg-5 justify-content-center">
          <div class="col-md-10 col-lg-8 col-xl-7">
            <div v-html="markdown($page.post.content)"></div>
          </div>
        </div>
      </div>
    </article>
  </Layout>
</template>
<page-query>
  query($id: ID!){
    post:strapiPost(id:$id){
      id
      title
      cover{
        url
      }
      content
      sub_title
    }
  }
</page-query>
<script>
import MarkdownIt from "markdown-it";
export default {
  metaInfo: {
    title: "Post Page",
  },
  methods: {
    markdown(str) {
      const md = new MarkdownIt();
      return md.render(str);
    },
  },
};
</script>

<style scoped>
</style>
