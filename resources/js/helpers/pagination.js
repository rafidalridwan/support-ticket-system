export const DEFAULT_PER_PAGE = 25;
export const DEFAULT_PER_PAGE_OPTIONS = [25, 50, 100];

export function resolvePagination(pagination) {
    const perPage = Number(pagination?.per_page);
    const options = Array.isArray(pagination?.options) ? pagination.options.map(Number).filter(Boolean) : [];

    return {
        perPage: Number.isFinite(perPage) && perPage > 0 ? perPage : DEFAULT_PER_PAGE,
        options: options.length ? options : DEFAULT_PER_PAGE_OPTIONS,
    };
}
