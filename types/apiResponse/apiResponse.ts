export interface apiResponse<T> {
    status: string;
    message: string;
    data: T
}

export interface apiError extends apiResponse<string> {}