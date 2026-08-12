import { configureStore } from "@reduxjs/toolkit";
import postsSliceReducer from "../lib/postsslice";
import registerSliceReducer from "../lib/registerslice";
import loginSliceReducer from "../lib/loginslice";
import profileReducer from "../lib/profileslce";
import  commentssliceReducer from "../lib/commentsslice"
import notificationsSliceReducer from "../lib/notifiactionslice"
 export let store=configureStore({
    reducer:{
    register: registerSliceReducer,
    login: loginSliceReducer,
    posts: postsSliceReducer,
    photos :profileReducer ,
    comments:commentssliceReducer,
    notifications:notificationsSliceReducer
    }
})