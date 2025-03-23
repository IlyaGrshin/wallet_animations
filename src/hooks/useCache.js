import { useState, useEffect } from "react"

// Глобальное хранилище для кеша между рендерами компонентов
const cacheStore = {}

// Время жизни кеша в миллисекундах (например, 5 минут)
const CACHE_TTL = 5 * 60 * 1000

// Функция для создания ресурса, совместимого с Suspense
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

    return {
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
