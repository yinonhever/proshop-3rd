import { createStore, combineReducers, applyMiddleware } from "redux";
import thunk from "redux-thunk";
import { composeWithDevTools } from "redux-devtools-extension";
import * as product from "./reducers/productReducers";
import * as user from "./reducers/userReducers";
import * as order from "./reducers/orderReducers";
import { cartReducer } from "./reducers/cartReducers";

const reducer = combineReducers({
    productList: product.productListReducer,
    productDetails: product.productDetailsReducer,
    productDelete: product.productDeleteReducer,
    productCreate: product.productCreateReducer,
    productUpdate: product.productUpdateReducer,
    productReviewCreate: product.productReviewCreateReducer,
    productTopRated: product.productTopRatedReducer,

    cart: cartReducer,

    userLogin: user.userLoginReducer,
    userRegister: user.userRegisterReducer,
    userDetails: user.userDetailsReducer,
    userUpdateProfile: user.userUpdateProfileReducer,
    userList: user.userListReducer,
    userDelete: user.userDeleteReducer,
    userUpdate: user.userUpdateReducer,

    orderCreate: order.orderCreateReducer,
    orderDetails: order.orderDetailsReducer,
    orderPay: order.orderPayReducer,
    orderDeliver: order.orderDeliverReducer,
    orderMyList: order.orderMyListReducer,
    orderList: order.orderListReducer
});


const initialState = {};

const middleware = [thunk];

const store = createStore(
    reducer,
    initialState,
    composeWithDevTools(applyMiddleware(...middleware))
);

export default store;