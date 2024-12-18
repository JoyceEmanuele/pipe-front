function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  const arrCopy = [...array];
  while (arrCopy.length) {
    const chunk = arrCopy.splice(0, size);
    chunks.push(chunk);
  }

  return chunks;
}

export async function batchRequests(promises: (() => Promise<unknown>)[], numberPromises: number): Promise<void> {
  const copyPromises = chunkArray(promises, numberPromises);
  for (const promises of copyPromises) {
    await Promise.allSettled(promises.map((p) => p()));
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
}

export async function executeSequentially(promises: Promise<unknown>[]): Promise<void> {
  for (const promise of promises) {
    await promise;
  }
}
