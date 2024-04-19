<template>
  <div>
    <!-- Display a loading spinner overlay if inProgress is true -->
    <div v-if="inProgress" class="loading-overlay">
      <div class="spinner"></div>
    </div>
    <div class="editor-page">
      <div class="container page">
        <div class="row">
          <div class="col-md-10 offset-md-1 col-xs-12">
            <RwvListErrors :errors="errors" />
            <form @submit.prevent="onPublish(article.slug)">
              <fieldset :disabled="inProgress">
                <fieldset class="form-group">
                  <input
                    type="text"
                    class="form-control form-control-lg"
                    v-model="article.title"
                    placeholder="Article Title"
                  />
                </fieldset>
                <div class="form-check">
                  <input
                    class="form-check-input custom-checkbox"
                    type="checkbox"
                    id="generateImages"
                    v-model="generateImages"
                  />
                  <label
                    class="form-check-label custom-label"
                    for="generateImages"
                  >
                    Generate images
                  </label>
                </div>
                <fieldset class="form-group">
                  <input
                    type="text"
                    class="form-control"
                    v-model="article.description"
                    placeholder="What's this article about?"
                  />
                </fieldset>
                <fieldset class="form-group">
                  <textarea
                    class="form-control"
                    rows="8"
                    v-model="article.body"
                    placeholder="Write your article (in markdown)"
                  >
                  </textarea>
                </fieldset>
                <fieldset class="form-group">
                  <input
                    type="text"
                    class="form-control"
                    placeholder="Enter tags"
                    v-model="tagInput"
                    @keypress.enter.prevent="addTag(tagInput)"
                  />
                  <div class="tag-list">
                    <span
                      class="tag-default tag-pill"
                      v-for="(tag, index) of article.tagList"
                      :key="tag + index"
                    >
                      <i class="ion-close-round" @click="removeTag(tag)"> </i>
                      {{ tag }}
                    </span>
                  </div>
                </fieldset>
              </fieldset>
              <button
                :disabled="inProgress"
                class="btn btn-lg pull-xs-right btn-primary"
                type="submit"
              >
                Publish Article
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from "vuex";
import store from "@/store";
import RwvListErrors from "@/components/ListErrors";
import {
  ARTICLE_PUBLISH,
  ARTICLE_EDIT,
  FETCH_ARTICLE,
  ARTICLE_EDIT_ADD_TAG,
  ARTICLE_EDIT_REMOVE_TAG,
  ARTICLE_RESET_STATE,
  GENERATE_IMAGES
} from "@/store/actions.type";

export default {
  name: "RwvArticleEdit",
  components: { RwvListErrors },
  props: {
    previousArticle: {
      type: Object,
      required: false
    }
  },
  async beforeRouteUpdate(to, from, next) {
    // Reset state if user goes from /editor/:id to /editor
    // The component is not recreated so we use to hook to reset the state.
    await store.dispatch(ARTICLE_RESET_STATE);
    return next();
  },
  async beforeRouteEnter(to, from, next) {
    // SO: https://github.com/vuejs/vue-router/issues/1034
    // If we arrive directly to this url, we need to fetch the article
    await store.dispatch(ARTICLE_RESET_STATE);
    if (to.params.slug !== undefined) {
      await store.dispatch(
        FETCH_ARTICLE,
        to.params.slug,
        to.params.previousArticle
      );
    }
    return next();
  },
  async beforeRouteLeave(to, from, next) {
    await store.dispatch(ARTICLE_RESET_STATE);
    next();
  },
  data() {
    return {
      tagInput: null,
      inProgress: false,
      errors: {},
      generateImages: false
    };
  },
  computed: {
    ...mapGetters(["article"])
  },
  methods: {
    async onPublish(slug) {
      let action = slug ? ARTICLE_EDIT : ARTICLE_PUBLISH;
      this.inProgress = true;

      try {
        // Create the article
        let { data } = await this.$store.dispatch(action);

        // If generateImages is true, generate the images
        if (this.generateImages) {
          let images = await this.$store.dispatch(GENERATE_IMAGES, {
            articleId: data.article.id,
            articleSlug: data.article.slug,
            articleBody: data.article.body
          });
          console.info(images);
        }

        // Navigate to the article view
        this.$router.push({
          name: "article",
          params: { slug: data.article.slug }
        });
      } catch ({ response }) {
        console.info(response);
        this.errors = response.data.errors;
      } finally {
        this.inProgress = false;
      }
    },
    removeTag(tag) {
      this.$store.dispatch(ARTICLE_EDIT_REMOVE_TAG, tag);
    },
    addTag(tag) {
      this.$store.dispatch(ARTICLE_EDIT_ADD_TAG, tag);
      this.tagInput = null;
    }
  }
};
</script>

<style scoped>
.custom-checkbox {
  margin-left: 10px;
  margin-top: 5px;
}

.custom-label {
  margin-left: 5px;
}
</style>
