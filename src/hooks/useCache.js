import { useState, useEffect } from "react"

// Глобальное хранилище для кеша между рендерами компонентов
const cacheStore = {}

// Время жизни кеша в миллисекундах (например, 5 минут)
const CACHE_TTL = 5 * 60 * 1000

// Функция для создания ресурса, совместимого с React 19's use хуком
export function createResource(key, fetchFn, ttl = CACHE_TTL) {
    // Создаем или используем существующую запись кеша
    if (!cacheStore[key]) {
        cacheStore[key] = {
            data: null,
            timestamp: null,
            promise: null,
            error: null,
        }
    }

    const entry = cacheStore[key]

    // Создаем объект, совместимый с thenable, который может быть использован React's use хуком
    const resource = {
        // Для React 19's use хука
        then(resolve, reject) {
            const now = Date.now()
            // Если данные есть и они не устарели, возвращаем их
            if (entry.data && entry.timestamp && now - entry.timestamp < ttl) {
                if (entry.error) reject(entry.error)
                else resolve(entry.data)
                return
            }

            // Если данные устарели или их нет, но промис уже запущен
            if (entry.promise) {
                return entry.promise.then(resolve, reject)
            }

            // Создаем новый промис для загрузки данных
            entry.promise = fetchFn()
                .then((data) => {
                    entry.data = data
                    entry.timestamp = Date.now()
                    entry.promise = null
                    resolve(data)
                    return data
                })
                .catch((error) => {
                    entry.error = error
                    entry.promise = null
                    reject(error)
                    throw error
                })

            return entry.promise.then(resolve, reject)
        },
        // Для совместимости с методом read
        read() {
            const now = Date.now()
            // Если данные есть и они не устарели, возвращаем их
            if (entry.data && entry.timestamp && now - entry.timestamp < ttl) {
                if (entry.error) throw entry.error
                return entry.data
            }

            // Если данные устарели или их нет, но промис уже запущен
            if (entry.promise) {
                throw entry.promise
            }

            // Создаем новый промис для загрузки данных
            entry.promise = fetchFn()
                .then((data) => {
                    entry.data = data
                    entry.timestamp = Date.now()
                    entry.promise = null
                    return data
                })
                .catch((error) => {
                    entry.error = error
                    entry.promise = null
                    throw error
                })

            throw entry.promise
        },
        preload() {
            const now = Date.now()
            // Если данные свежие, нет необходимости запускать предзагрузку
            if (entry.data && entry.timestamp && now - entry.timestamp < ttl) {
                return
            }

            // Если предзагрузка еще не запущена, запускаем
            if (!entry.promise) {
                entry.promise = fetchFn()
                    .then((data) => {
                        entry.data = data
                        entry.timestamp = Date.now()
                        entry.promise = null
                        return data
                    })
                    .catch((error) => {
                        entry.error = error
                        entry.promise = null
                    })
            }
        },
    }

    return resource
}

// Оригинальный хук для обратной совместимости
export const useCache = (key, fetchFn, ttl = CACHE_TTL) => {
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchData = async () => {
            // Проверяем, есть ли валидные кешированные данные
            const now = Date.now()
            if (
                cacheStore[key] &&
                cacheStore[key].data &&
                cacheStore[key].timestamp &&
                now - cacheStore[key].timestamp < ttl
            ) {
                setData(cacheStore[key].data)
                setLoading(false)
                return
            }

            try {
                setLoading(true)
                const result = await fetchFn()

                // Обновляем глобальный кеш и состояние компонента
                cacheStore[key] = {
                    data: result,
                    timestamp: now,
                }

                setData(result)
                setError(null)
            } catch (err) {
                setError(err)
                console.error(`Error fetching data for key ${key}:`, err)
            } finally {
                setLoading(false)
            }
        }

        fetchData()
    }, [key, fetchFn, ttl])

    return { data, loading, error }
}
