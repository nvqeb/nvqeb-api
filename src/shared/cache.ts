const cache = new Map<string, Promise<any>>();

export function cachedValue<T>(key: string, durationSeconds: number, producer: () => Promise<T>): Promise<T> {
    const cached = cache.get(key);

    if (cached !== undefined)
        return cached;

    console.log(`producing cache for '${key}'`);

    const timer = setTimeout(
        () => {
            cache.delete(key);
        },
        durationSeconds * 1000,
    );

    const value = producer().catch((err) => {
        cache.delete(key);
        clearTimeout(timer);
        throw err;
    });

    cache.set(key, value);

    return value;
}
