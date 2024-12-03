import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { increment, decrement, reset } from "../store/CounterSlice";
import { axiosInstance } from "utils";

const Counter = ({ data }: any) => {
  const counter = useSelector((state: any) => state.counter);
  const dispatch = useDispatch();
  /* const data = GetData("https://dummyjson.com/products"); */

  return (
    <div>
      <h1>Count - {counter}</h1>
      <button onClick={() => dispatch(increment(1))}>Increment</button>
      <button onClick={() => dispatch(decrement(1))}>Decrement</button>
      <button onClick={() => dispatch(reset())}>Reset</button>
      <button onClick={() => dispatch(increment(5))}>Increment by 5</button>
      <button onClick={() => dispatch(decrement(5))}>Decrement by 5</button>
    </div>
  );
};

export default Counter;
