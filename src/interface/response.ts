export interface Response<T = void> {
    status: boolean;
    data: T;
    message: string;
}