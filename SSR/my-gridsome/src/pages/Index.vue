<template>
  <Layout>
    <header
      class="masthead"
      :style="`background-image: url('http://106.75.254.155:1337${$page.website.edges[0].node.image.url}')`"
    >
      <div class="container position-relative px-4 px-lg-5">
        <div class="row gx-4 gx-lg-5 justify-content-center">
          <div class="col-md-10 col-lg-8 col-xl-7">
            <div class="site-heading">
              <h1>{{ $page.website.edges[0].node.title }}</h1>
              <span class="subheading">{{
                $page.website.edges[0].node.sub_title
              }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>
    <div class="container px-4 px-lg-5">
      <div class="row gx-4 gx-lg-5 justify-content-center">
        <div class="col-md-10 col-lg-8 col-xl-7">
          <template v-for="(edge, index) in $page.posts.edges">
            <!-- Post preview-->
            <div class="post-preview" :key="edge.node.id">
              <g-link :to="'/post/' + edge.node.id">
                <h2 class="post-title">
                  {{ edge.node.title }}
                </h2>
              </g-link>
              <p class="post-meta">
                <span
                  v-for="tag in edge.node.tags"
                  :key="edge.node.id + tag.name"
                >
                  {{ tag.name }}
                </span>
              </p>
            </div>
            <!-- Divider-->
            <hr class="my-4" :key="edge.node.id + index" />
          </template>
          <!-- Pager-->
          <div class="d-flex justify-content-end mb-4">
            <a class="btn btn-primary text-uppercase" href="#!"
              >Older Posts →</a
            >
          </div>
          <!-- <Pager :info="$page.allStrapiPost.pageInfo" /> -->
        </div>
      </div>
    </div>
  </Layout>
</template>
<page-query>
query ($page: Int){
	posts:allStrapiPost(perPage: 2, page: $page)@paginate{
    pageInfo {
      totalPages
      currentPage
    }
    edges{
      node{
        id
        title
        tags{
          name
        }
      }
    }
  }
  website:allStrapiWebsite{
    edges{
      node{
        title
        sub_title
        image{
          url
        }
      }
    }
  }
}
</page-query>
<script>
// import { Pager } from "gridsome";
export default {
  metaInfo: {
    title: "Index Page",
  },
  // components: {
  //   Pager,
  // },
};
</script>

<style>
.home-links a {
  margin-right: 1rem;
}
</style>
