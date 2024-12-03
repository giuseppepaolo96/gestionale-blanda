import React, { Suspense } from "react";
import { Skeleton } from "primereact/skeleton";

export default function ExampleSuspense() {
  // PER TESTARE IL SUSPENSE CHIAMARE API E PASSARE I DATI NEL DATA
  const data = {};
  return (
    <Suspense
      fallback={
        <div className="card">
          <div className="flex flex-wrap">
            <div className="w-full md:w-6 p-3">
              <h5>Rectangle</h5>
              <Skeleton className="mb-2"></Skeleton>
              <Skeleton width="10rem" className="mb-2"></Skeleton>
              <Skeleton width="5rem" className="mb-2"></Skeleton>
              <Skeleton height="2rem" className="mb-2"></Skeleton>
              <Skeleton width="10rem" height="4rem"></Skeleton>
            </div>
          </div>
        </div>
      }
    >
      {/* //<Counter data={data} /> */}
    </Suspense>
  );
}
