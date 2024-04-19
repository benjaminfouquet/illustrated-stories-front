import {
  ArticlesService,
  CommentsService,
  ImagesService
} from "@/common/api.service";
import { FETCH_ARTICLE, FETCH_COMMENTS, FETCH_IMAGES } from "./actions.type";
import { SET_ARTICLE, SET_COMMENTS, SET_IMAGES } from "./mutations.type";

export const state = {
  article: {},
  comments: [],
  iamges: []
};

export const actions = {
  [FETCH_ARTICLE](context, articleSlug) {
    return ArticlesService.get(articleSlug)
      .then(({ data }) => {
        context.commit(SET_ARTICLE, data.article);
      })
      .catch(error => {
        throw new Error(error);
      });
  },
  [FETCH_COMMENTS](context, articleSlug) {
    return CommentsService.get(articleSlug)
      .then(({ data }) => {
        context.commit(SET_COMMENTS, data.comments);
      })
      .catch(error => {
        throw new Error(error);
      });
  },
  [FETCH_IMAGES](context, articleSlug) {
    return ImagesService.get(articleSlug)
      .then(({ data }) => {
        context.commit(SET_IMAGES, data.images);
      })
      .catch(error => {
        throw new Error(error);
      });
  }
};

/* eslint no-param-reassign: ["error", { "props": false }] */
export const mutations = {
  [SET_ARTICLE](state, article) {
    state.article = article;
  },
  [SET_COMMENTS](state, comments) {
    state.comments = comments;
  },
  [SET_IMAGES](state, images) {
    state.images = images;
  }
};

export default {
  state,
  actions,
  mutations
};
