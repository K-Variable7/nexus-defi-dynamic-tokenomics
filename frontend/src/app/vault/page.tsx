import { Suspense } from "react";
import MultiplierVault from "./MultiplierVault";

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MultiplierVault />
    </Suspense>
  );
}
