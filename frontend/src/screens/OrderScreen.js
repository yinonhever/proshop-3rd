import React, { useState, useEffect } from "react";
import axios from "axios";
import { PayPalButton } from "react-paypal-button-v2";
import { Link } from "react-router-dom";
import { Row, Col, ListGroup, Image, Card, Button } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import Message from "../components/Message";
import Loader from "../components/Loader";
import { getOrderDetails, payOrder, deliverOrder } from "../actions/orderActions";
import { ORDER_PAY_RESET, ORDER_DELIVER_RESET } from "../constants/orderConstants";

const OrderScreen = ({ match, history }) => {
    const orderId = match.params.id;

    const [sdkReady, setSdkReady] = useState(false);

    const dispatch = useDispatch();

    const { order, loading, error } = useSelector(state => state.orderDetails);
    const { loading: loadingPay, success: successPay } = useSelector(state => state.orderPay);
    const { loading: loadingDeliver, success: successDeliver } = useSelector(state => state.orderDeliver);
    const { userInfo } = useSelector(state => state.userLogin);

    const {
        user,
        shippingAddress,
        paymentMethod,
        orderItems,
        isDelivered,
        deliveredAt,
        isPaid,
        paidAt,
        shippingPrice,
        taxPrice,
        totalPrice
    } = order || {};
    const { address, city, postalCode, country } = shippingAddress || {};

    const addDecimals = num => (Math.round(num * 100) / 100).toFixed(2);
    const itemsPrice = orderItems && addDecimals(orderItems.reduce(
        (acc, item) => acc + item.price * item.qty,
        0
    ));

    useEffect(() => {
        if (!userInfo) {
            history.push("/login");
        }

        const addPayPalScript = async () => {
            const { data: clientId } = await axios.get("/api/config/paypal");
            const script = document.createElement("script");
            script.type = "text/javascript";
            script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}`;
            script.async = true;
            script.onload = () => setSdkReady(true);
            document.body.appendChild(script);
        }

        if (!order || order._id !== orderId || successPay || successDeliver) {
            dispatch({ type: ORDER_PAY_RESET });
            dispatch({ type: ORDER_DELIVER_RESET });
            dispatch(getOrderDetails(orderId));
        }
        else if (!isPaid) {
            if (!window.paypal) {
                addPayPalScript();
            }
            else {
                setSdkReady(true);
            }
        }
    }, [userInfo, order, orderId, successPay, successDeliver, isPaid, dispatch, history])

    const successPaymentHandler = paymentResult => {
        dispatch(payOrder(orderId, paymentResult));
    }

    const deliverHandler = () => {
        dispatch(deliverOrder(order));
    }

    return loading ? <Loader /> : error ? <Message variant="danger">{error}</Message> :
        <>
            <h1>Order {order._id}</h1>
            <Row>
                <Col md={8}>
                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <h2>Shipping</h2>
                            <p><strong>Name: </strong> {user.name}</p>
                            <p>
                                <strong>Email: </strong>
                                <a href={`mailto:${user.email}`}>{user.email}</a></p>
                            <p>
                                <strong>Address: </strong>
                                {address}, {city}, {postalCode}, {country}
                            </p>
                            {isDelivered ?
                                <Message variant="success">Delivered on {deliveredAt}</Message> :
                                <Message variant="danger">Not delivered</Message>}
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Payment Method</h2>
                            <p>
                                <strong>Method: </strong> {paymentMethod}
                            </p>
                            {isPaid ?
                                <Message variant="success">Paid on {paidAt}</Message> :
                                <Message variant="danger">Not paid</Message>}
                        </ListGroup.Item>

                        <ListGroup.Item>
                            <h2>Order Items</h2>
                            {orderItems.length === 0 ?
                                <Message>Order is empty</Message> :
                                <ListGroup variant="flush">
                                    {orderItems.map((item, index) =>
                                        <ListGroup.Item key={index}>
                                            <Row>
                                                <Col md={1}>
                                                    <Image src={item.image} alt={item.name} fluid rounded />
                                                </Col>
                                                <Col>
                                                    <Link to={`/product/${item.product}`}>
                                                        {item.name}
                                                    </Link>
                                                </Col>
                                                <Col md={4}>
                                                    {item.qty} x ${item.price} = ${(item.qty * item.price).toFixed(2)}
                                                </Col>
                                            </Row>
                                        </ListGroup.Item>
                                    )}
                                </ListGroup>}
                        </ListGroup.Item>
                    </ListGroup>
                </Col>

                <Col md={4}>
                    <Card>
                        <ListGroup variant="flush">
                            <ListGroup.Item>
                                <h2>Order Summary</h2>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Items</Col>
                                    <Col>${itemsPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Shipping</Col>
                                    <Col>${shippingPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col>Tax</Col>
                                    <Col>${taxPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            <ListGroup.Item>
                                <Row>
                                    <Col><strong>Total</strong></Col>
                                    <Col>${totalPrice}</Col>
                                </Row>
                            </ListGroup.Item>
                            {!isPaid &&
                                <ListGroup.Item>
                                    {loadingPay && <Loader />}
                                    {!sdkReady ?
                                        <Loader /> :
                                        <PayPalButton
                                            amount={order.totalPrice}
                                            onSuccess={successPaymentHandler}
                                        />}
                                </ListGroup.Item>}
                            {loadingDeliver && <Loader />}
                            {userInfo && userInfo.isAdmin && isPaid && !isDelivered &&
                                <ListGroup.Item>
                                    <Button type="button" className="btn btn-block" onClick={deliverHandler}>
                                        Mark as Delivered
                                    </Button>
                                </ListGroup.Item>}
                        </ListGroup>
                    </Card>
                </Col>
            </Row>
        </>
}

export default OrderScreen;
