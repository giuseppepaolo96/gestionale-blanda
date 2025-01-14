import { useLoaderData } from "react-router-dom";

export default function RouterLoaderDataExample() {
  const data = useLoaderData();

  return <h2>"OK"</h2>;
}
 