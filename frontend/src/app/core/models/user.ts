export interface User {
    id?: number;
    name: string;
    email: string;
    registration: string;
    password?: string;
}

export interface UserPaginatedResponse {
    data: User[];
    meta: {
        totalItems: number;
        itemCount: number;
        itemsPerPage: number;
        totalPages: number;
        currentPage: number;
    };
}