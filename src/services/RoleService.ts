import useFetchWithAuth from "../fetch/FetchAdmin";

// URL base từ environment
export const getRoles = async () => {
    const fetchWithAuth = useFetchWithAuth();
    return fetchWithAuth(`/roles`);
};
