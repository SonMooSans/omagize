export const api = "http://localhost:8080"

export type ReturnOptions<T> = Options & {
    /**
     * Map result if status code is not equal to 200
     * @param status
     */
    allowed?: {
        [status: number]: (res: Response) => T
    }
}

export type Options = RequestInit & {
    /**
     * throw an error if status code is not equal to 200
     *
     * default: false
     */
    errorOnFail?: boolean
}

export async function call(url: string, init?: RequestInit) {
    return fetch(`${api}${url}`, init)
}

export async function callDefault(url: string, init?: Options) {
    return fetch(`${api}${url}`, init).then(r => handle(r, init))
}

export async function callReturnText(url: string, init?: ReturnOptions<string>) {
    return call(url, init).then(res => handleResult<string>(res, init, res => res.text()))
}

export async function callReturn<T>(url: string, init?: ReturnOptions<T>): Promise<T> {
    return call(url, init).then(res => handleResult<T>(res, init, res => res.json()))
}

async function handleResult<T>(res: Response, options: ReturnOptions<T>, mapper: (res: Response) => Promise<T>): Promise<T> {
    if (!res.ok) {
        if (options.allowed && options.allowed[res.status]) {
            return options.allowed[res.status](res)
        } else if (options.errorOnFail ?? false) {
            throw new Error(await res.text())
        }
    }

    return await mapper(res)
}

async function handle(res: Response, options: Options) {
    if (!res.ok && (options.errorOnFail ?? false)) {
        throw new Error(await res.text())
    }

    return res
}

export function withDefault<T extends Options>(options: T, contentType: string | undefined = "application/json"): T {
    return {
        credentials: "include",
        ...options,

        headers: {
            "Content-Type": contentType,
            ...options.headers
        },
    }
}

export function withDefaultForm<T extends Options>(options: T): T {
    return {
        credentials: "include",
        ...options,
    }
}