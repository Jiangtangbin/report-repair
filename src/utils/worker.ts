interface DisposableWorker<T extends any[]> extends Worker {
    post<R>(message: T): DisposableWorkerS<R>;
    stop(): void;
}

interface DisposableWorkerS<T> extends Promise<T> {
    worker: DisposableWorker<any>;
}

/**
 * @description: 执行一次性的 webworker
 * @param {Function} work: 执行的 work 函数
 * @param {...Array} args: work 执行所需的参数
 */
export function run<T extends((...args: any[]) => any)>(work: T, ...args: Parameters<T>) {
    const worker = createDisposableWorker<Parameters<T>>(makeResponse(work));
    return worker.post<ReturnType<T>>(args);
}

/**
 * @description: 创建一次性的 worker
 * @param {String} response: 可执行的 js 字符串
 */
export function createDisposableWorker<T extends any[]>(response: string): DisposableWorker<T> {
    const URL = window.URL || (window as any).webkitURL;
    const blob = new Blob([response], { type: 'application/javascript' });
    const objectURL = URL.createObjectURL(blob);
    const worker = new Worker(objectURL) as DisposableWorker<T>;
    worker.post = function post<R>(message: T) {
        const result = new Promise((resolve, reject) => {
            worker.onmessage = event => {
                URL.revokeObjectURL(objectURL);
                resolve(event.data);
            };
            worker.onerror = e => {
                console.error(`Error: Line ${e.lineno} in ${e.filename}: ${e.message}`);
                reject(e);
            };
            worker.postMessage(message);
        }) as DisposableWorkerS<R>;

        result.worker = worker;
        return result;
    };
    worker.stop = function stop() {
        worker.terminate();
    };
    return worker;
}

/**
 * @description: 将 work 转换成字符串
 * @param {String} response: 可执行的 js 字符串
 */
export function makeResponse(work: (...args: any[]) => any): string {
    return `
        self.onmessage = event => {
            const args = event.data;
            if (args) {
            self.postMessage((${work}).apply(null, args));
            return close();
            }
            self.postMessage((${work})());
            return close();
        }
    `;
}