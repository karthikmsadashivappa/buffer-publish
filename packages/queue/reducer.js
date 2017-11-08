import { actionTypes as dataFetchActionTypes } from '@bufferapp/async-data-fetch';
import { actionTypes as profileSidebarActionTypes } from '@bufferapp/publish-profile-sidebar';

export const actionTypes = {
  POST_CREATED: 'POST_CREATED',
  POST_UPDATED: 'POST_UPDATED',
  POST_DELETED: 'POST_DELETED',
  POST_SENT: 'POST_SENT',
  POST_CLICKED_DELETE: 'POST_CLICKED_DELETE',
  POST_CONFIRMED_DELETE: 'POST_CONFIRMED_DELETE',
  POST_CANCELED_DELETE: 'POST_CANCELED_DELETE',
  POST_ERROR: 'POST_ERROR',
  POST_SHARE_NOW: 'POST_SHARE_NOW',
  POST_IMAGE_CLICKED: 'POST_IMAGE_CLICKED',
  POST_IMAGE_CLICKED_NEXT: 'POST_IMAGE_CLICKED_NEXT',
  POST_IMAGE_CLICKED_PREV: 'POST_IMAGE_CLICKED_PREV',
  POST_IMAGE_CLOSED: 'POST_IMAGE_CLOSED',
  OPEN_COMPOSER: 'OPEN_COMPOSER',
  HIDE_COMPOSER: 'HIDE_COMPOSER',
  POST_COUNT_UPDATED: 'POST_COUNT_UPDATED',
  POST_DROPPED: 'POST_DROPPED',
  POST_REQUEUE: 'POST_REQUEUE',
};

const initialState = {
  byProfileId: {},
  showComposer: false,
  enabledApplicationModes: [],
  environment: 'production',
  editMode: false,
  editingPostId: '',
};

const profileInitialState = {
  loading: true,
  loadingMore: false,
  moreToLoad: false,
  page: 1,
  posts: {},
  total: 0,
};

const determineIfMoreToLoad = (action, currentPosts) => {
  const currentPostCount = Object.keys(currentPosts).length;
  const resultUpdatesCount = Object.keys(action.result.updates).length;
  return (action.result.total > (currentPostCount + resultUpdatesCount));
};

const getProfileId = (action) => {
  if (action.profileId) { return action.profileId; }
  if (action.args) { return action.args.profileId; }
  if (action.profile) { return action.profile.id; }
};

const getPostUpdateId = (action) => {
  if (action.updateId) { return action.updateId; }
  if (action.args) { return action.args.updateId; }
  if (action.post) { return action.post.id; }
};

/**
 * movePostInArray()
 *
 * Return a new array with the item at index `from` moved to index `to`.
 *
 * @param  {Array}  arr
 * @param  {Number} from
 * @param  {Number} to
 * @return {Array}
 */
const movePostInArray = (arr, from, to) => {
  const clone = [...arr];

  // Support passing `from` and `to` in non-sequential order (e.g., 4 and 1).
  const fromIndex = from < to ? from : to;
  const toIndex = to > from ? to : from;

  // Generate the new array
  Array.prototype.splice.call(clone, toIndex, 0,
    Array.prototype.splice.call(clone, fromIndex, 1)[0],
  );
  return clone;
};

/**
 * handlePostDropped()
 *
 * This function takes an object contaning posts keyed by ID and a `POST_DROPPED`
 * action and returns the re-ordered posts map object based on that action.
 * (This action is dispatched during a drag operation when a post hovers
 * over another post in the queue. See `PostDragLayer/index.jsx`)
 *
 * Since posts are stored in a `key: value` map we can't just reorder them like
 * an array. Instead we're just shuffling values around. This means that as you
 * drag a post it's `due_at` (and other related data in the object) is 'fixed'.
 * The result is that when we render posts ordered by their `due_at` time in the
 * queue the new order reflected.
 *
 * @param  {Object} posts   key: value map of posts
 * @param  {Object} action  action dispatched from the drag operation
 * @return {Object}         new posts map
 */
const handlePostDropped = (posts, action) => {
  const orderedPosts = Object.values(posts).sort((a, b) => a.due_at - b.due_at);

  // Save values that should be fixed
  const fixedValues = orderedPosts.map(p => ({
    due_at: p.due_at,
    postAction: p.postDetails.postAction,
    day: p.day,
  }));

  // Move the post that is being dragged
  const afterMovePosts = movePostInArray(
    orderedPosts,
    action.dragIndex,
    action.hoverIndex,
  );

  // Apply the fixed values we saved
  const finalPosts = afterMovePosts.map((p, idx) => {
    p.day = fixedValues[idx].day;
    p.postDetails.postAction = fixedValues[idx].postAction;
    p.due_at = fixedValues[idx].due_at;
    return p;
  });

  // Return a new post map
  const newPostsMap = finalPosts.reduce((map, post) => { map[post.id] = post; return map; }, {});

  return newPostsMap;
};

/**
 * Reducers
 */

const postReducer = (state, action) => {
  switch (action.type) {
    case actionTypes.POST_CREATED:
    case actionTypes.POST_UPDATED:
      return action.post;
    case actionTypes.POST_ERROR:
      return state;
    case actionTypes.POST_CLICKED_DELETE:
      return { ...state, isConfirmingDelete: true };
    case actionTypes.POST_CONFIRMED_DELETE:
      return {
        ...state,
        isConfirmingDelete: false,
        isDeleting: true,
      };
    case actionTypes.POST_SHARE_NOW:
      return {
        ...state,
        isWorking: true,
      };
    case actionTypes.POST_CANCELED_DELETE:
      return {
        ...state,
        isConfirmingDelete: false,
      };
    case actionTypes.POST_IMAGE_CLICKED:
      return {
        ...state,
        isLightboxOpen: true,
        currentImage: 0,
      };
    case actionTypes.POST_IMAGE_CLOSED:
      return {
        ...state,
        isLightboxOpen: false,
      };
    case actionTypes.POST_IMAGE_CLICKED_NEXT:
      return {
        ...state,
        currentImage: state.currentImage + 1,
      };
    case actionTypes.POST_IMAGE_CLICKED_PREV:
      return {
        ...state,
        currentImage: state.currentImage - 1,
      };
    case `sharePostNow_${dataFetchActionTypes.FETCH_FAIL}`:
      return {
        ...state,
        isWorking: false,
      };
    default:
      return state;
  }
};

const postsReducer = (state = {}, action) => {
  switch (action.type) {
    case `queuedPosts_${dataFetchActionTypes.FETCH_SUCCESS}`: {
      const { updates } = action.result;
      if (action.args.isFetchingMore) {
        return { ...state, ...updates };
      }
      return updates;
    }
    case actionTypes.POST_DELETED:
    case actionTypes.POST_SENT: {
      const { [getPostUpdateId(action)]: deleted, ...currentState } = state;
      return currentState;
    }
    case actionTypes.POST_CREATED:
    case actionTypes.POST_UPDATED:
    case actionTypes.POST_CLICKED_DELETE:
    case actionTypes.POST_CONFIRMED_DELETE:
    case actionTypes.POST_CANCELED_DELETE:
    case actionTypes.POST_SHARE_NOW:
    case actionTypes.POST_IMAGE_CLICKED:
    case actionTypes.POST_IMAGE_CLOSED:
    case actionTypes.POST_IMAGE_CLICKED_NEXT:
    case actionTypes.POST_IMAGE_CLICKED_PREV:
    case actionTypes.POST_ERROR:
    case `sharePostNow_${dataFetchActionTypes.FETCH_FAIL}`:
      return {
        ...state,
        [getPostUpdateId(action)]: postReducer(state[getPostUpdateId(action)], action),
      };
    default:
      return state;
  }
};

const profileReducer = (state = profileInitialState, action) => {
  switch (action.type) {
    case `queuedPosts_${dataFetchActionTypes.FETCH_START}`:
      return {
        ...state,
        loading: !action.args.isFetchingMore && !action.args.isReordering,
        loadingMore: action.args.isFetchingMore,
      };
    case `queuedPosts_${dataFetchActionTypes.FETCH_SUCCESS}`:
      return {
        ...state,
        loading: false,
        loadingMore: false,
        moreToLoad: determineIfMoreToLoad(action, state.posts),
        page: state.page + 1,
        posts: postsReducer(state.posts, action),
        total: action.result.total,
      };
    case `queuedPosts_${dataFetchActionTypes.FETCH_FAIL}`:
      return {
        ...state,
        loading: false,
      };
    case actionTypes.POST_COUNT_UPDATED:
      return {
        ...state,
        total: action.counts.pending,
      };
    case actionTypes.POST_DROPPED: {
      return {
        ...state,
        posts: handlePostDropped(state.posts, action),
      };
    }
    case `sharePostNow_${dataFetchActionTypes.FETCH_FAIL}`:
    case actionTypes.POST_ERROR:
    case actionTypes.POST_CREATED:
    case actionTypes.POST_UPDATED:
    case actionTypes.POST_CLICKED_DELETE:
    case actionTypes.POST_CONFIRMED_DELETE:
    case actionTypes.POST_DELETED:
    case actionTypes.POST_CANCELED_DELETE:
    case actionTypes.POST_ERROR: //eslint-disable-line
    case actionTypes.POST_IMAGE_CLICKED:
    case actionTypes.POST_IMAGE_CLOSED:
    case actionTypes.POST_IMAGE_CLICKED_NEXT:
    case actionTypes.POST_IMAGE_CLICKED_PREV:
    case actionTypes.POST_SHARE_NOW:
    case actionTypes.POST_SENT:
      return {
        ...state,
        posts: postsReducer(state.posts, action),
      };
    default:
      return state;
  }
};

export default (state = initialState, action) => {
  let profileId;
  switch (action.type) {
    case actionTypes.POST_DROPPED:
    case `sharePostNow_${dataFetchActionTypes.FETCH_FAIL}`:
    case profileSidebarActionTypes.SELECT_PROFILE:
    case `queuedPosts_${dataFetchActionTypes.FETCH_START}`:
    case `queuedPosts_${dataFetchActionTypes.FETCH_SUCCESS}`:
    case `queuedPosts_${dataFetchActionTypes.FETCH_FAIL}`:
    case actionTypes.POST_CREATED:
    case actionTypes.POST_UPDATED:
    case actionTypes.POST_CLICKED_DELETE:
    case actionTypes.POST_CONFIRMED_DELETE:
    case actionTypes.POST_DELETED:
    case actionTypes.POST_CANCELED_DELETE:
    case actionTypes.POST_ERROR:
    case actionTypes.POST_IMAGE_CLICKED:
    case actionTypes.POST_IMAGE_CLOSED:
    case actionTypes.POST_IMAGE_CLICKED_NEXT:
    case actionTypes.POST_IMAGE_CLICKED_PREV:
    case actionTypes.POST_SHARE_NOW:
    case actionTypes.POST_SENT:
    case actionTypes.POST_COUNT_UPDATED: {
      profileId = getProfileId(action);
      if (profileId) {
        return {
          ...state,
          byProfileId: {
            ...state.byProfileId,
            [profileId]: profileReducer(state.byProfileId[profileId], action),
          },
        };
      }
      return state;
    }
    case `enabledApplicationModes_${dataFetchActionTypes.FETCH_SUCCESS}`:
      return {
        ...state,
        enabledApplicationModes: action.result.enabledApplicationModes,
      };
    case `environment_${dataFetchActionTypes.FETCH_SUCCESS}`:
      return {
        ...state,
        environment: action.result.environment,
      };
    case actionTypes.OPEN_COMPOSER:
      return {
        ...state,
        showComposer: true,
        editMode: action.editMode,
        editingPostId: action.updateId,
      };
    case actionTypes.HIDE_COMPOSER:
      return {
        ...state,
        showComposer: false,
        editMode: false,
      };
    default:
      return state;
  }
};

export const actions = {
  handleEditClick: ({ post, profileId }) => ({
    type: actionTypes.OPEN_COMPOSER,
    updateId: post.id,
    editMode: true,
    post,
    profileId,
  }),
  handleDeleteClick: ({ post, profileId }) => ({
    type: actionTypes.POST_CLICKED_DELETE,
    updateId: post.id,
    post,
    profileId,
  }),
  handleDeleteConfirmClick: ({ post, profileId }) => ({
    type: actionTypes.POST_CONFIRMED_DELETE,
    updateId: post.id,
    post,
    profileId,
  }),
  handleCancelConfirmClick: ({ post, profileId }) => ({
    type: actionTypes.POST_CANCELED_DELETE,
    updateId: post.id,
    post,
    profileId,
  }),
  handleShareNowClick: ({ post, profileId }) => ({
    type: actionTypes.POST_SHARE_NOW,
    updateId: post.id,
    post,
    profileId,
  }),
  handleImageClick: ({ post, profileId }) => ({
    type: actionTypes.POST_IMAGE_CLICKED,
    updateId: post.id,
    post,
    profileId,
  }),
  handleImageClickNext: ({ post, profileId }) => ({
    type: actionTypes.POST_IMAGE_CLICKED_NEXT,
    updateId: post.id,
    post,
    profileId,
  }),
  handleImageClickPrev: ({ post, profileId }) => ({
    type: actionTypes.POST_IMAGE_CLICKED_PREV,
    updateId: post.id,
    post,
    profileId,
  }),
  handleImageClose: ({ post, profileId }) => ({
    type: actionTypes.POST_IMAGE_CLOSED,
    updateId: post.id,
    post,
    profileId,
  }),
  handleRequeue: ({ post, profileId }) => ({
    type: actionTypes.POST_REQUEUE,
    updateId: post.id,
    post,
    profileId,
  }),
  handleComposerPlaceholderClick: () => ({
    type: actionTypes.OPEN_COMPOSER,
  }),
  // TODO: rename to more representative name
  handleComposerCreateSuccess: () => ({
    type: actionTypes.HIDE_COMPOSER,
  }),
  postCountUpdated: (profileId, counts) => ({
    type: actionTypes.POST_COUNT_UPDATED,
    profileId,
    counts,
  }),
  onDropPost: ({ dragIndex, hoverIndex, profileId }) => ({
    type: actionTypes.POST_DROPPED,
    profileId,
    dragIndex,
    hoverIndex,
  }),
};
