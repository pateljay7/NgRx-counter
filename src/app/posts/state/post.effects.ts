import { Injectable } from "@angular/core";
import { Actions, createEffect, ofType } from "@ngrx/effects";
import { Update } from "@ngrx/entity";
import { RouterNavigatedAction, ROUTER_NAVIGATION } from "@ngrx/router-store";
import { Store } from "@ngrx/store";
import { filter, map, mergeMap, of, switchMap, withLatestFrom } from "rxjs";
import { PostService } from "src/app/Auth/services/post.service";
import { Post } from "src/app/shared/component/header/interfaces/post.interface";
import { AppState } from "src/app/store/app.state";
import { dummyAction } from "src/app/store/shared/shared.action";
import {
    addPost,
    addPostSuccess,
    deletePost,
    deletePostSuccess,
    loadPosts,
    loadPostsSuccess,
    updatePost,
    updatePostLoader,
    updatePostSuccess,
} from "./post.actions";
import { getPosts } from "./post.selectors";

@Injectable()
export class PostEffects {
    constructor(
        private actions$: Actions,
        private postService: PostService,
        private store: Store<AppState>
    ) {}

    loadPost$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(loadPosts),
            mergeMap((action) => {
                this.store.dispatch(updatePostLoader({ isPostLoading: true }));
                return this.postService.getPosts().pipe(
                    map((posts) => {
                        this.store.dispatch(
                            updatePostLoader({ isPostLoading: false })
                        );
                        return loadPostsSuccess({ posts });
                    })
                );
            })
        );
    });

    addPost$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(addPost),
            mergeMap((action) => {
                return this.postService.addPost(action.post).pipe(
                    map((data) => {
                        const post = { ...action.post, id: data.name };
                        return addPostSuccess({ post });
                    })
                );
            })
        );
    });
    updatePost$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(updatePost),
            mergeMap((action) => {
                this.store.dispatch(updatePostLoader({ isPostLoading: true }));
                return this.postService.updatePost(action.post).pipe(
                    map((post) => {
                        this.store.dispatch(
                            updatePostLoader({ isPostLoading: false })
                        );
                        const updatedPost: Update<Post> = {
                            id: action.post.id!,
                            changes: {
                                ...action.post,
                            },
                        };
                        return updatePostSuccess({ post: updatedPost });
                    })
                );
            })
        );
    });
    deletePost$ = createEffect(() => {
        return this.actions$.pipe(
            ofType(deletePost),
            mergeMap((action) => {
                return this.postService.deletePost(action.post.id!).pipe(
                    map((post) => {
                        return deletePostSuccess({ post: action.post });
                    })
                );
            })
        );
    });

    getSinglePOst = createEffect(() => {
        return this.actions$.pipe(
            ofType(ROUTER_NAVIGATION),
            filter((r: RouterNavigatedAction) => {
                return r.payload.routerState.url.startsWith("/post/details");
            }),
            map((r: any) => {
                return r.payload.routerState.params.id;
            }),
            withLatestFrom(this.store.select(getPosts)),
            switchMap(([id, posts]) => {
                if (!posts.length)
                    return this.postService.getPostById(id).pipe(
                        map((post) => {
                            const singlePost = post ? [{ ...post, id }] : [];
                            return loadPostsSuccess({ posts: singlePost });
                        })
                    );
                else return of(dummyAction());
            })
        );
    });
}
