# @ricokahler/promise-suspender

This is an **experimental** package that plays around with the idea of using suspense for promises.

```js
import { Suspense } from 'react';
import { createPromiseSuspender } from '@ricokahler/promise-suspender';
import { somethingAsync } from '../';

const usePromise = createPromiseSuspender();

function MySuspendingComponent({ foo }) {
  const value = usePromise(async () => {
    const { data } = await somethingAsync(foo, bar);
    return data;
  }, [foo, bar]); // 👈 Note: these have to be strings

  return <>{value}</>;
}

function Parent() {
  return (
    <Suspense fallback={<>Loading...</>}>
      <MySuspendingComponent />
    </Suspense>
  );
}
```
