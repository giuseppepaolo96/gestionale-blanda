import { Outlet, useNavigation } from "react-router-dom";

export default function PageWithLoadingPlaceholder() {
  const { state } = useNavigation();

  if (state === "loading") {
    return <h1>LOADING</h1>;
  }

  return <Outlet />;
}
 