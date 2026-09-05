export const parseMessageIds = (input: unknown): number[] => {
    const raw = Array.isArray(input) ? input : input != null ? [input] : [];
    const ids = raw
        .map((value) => Number(value))
        .filter((id) => Number.isInteger(id) && id > 0);
    return [...new Set(ids)];
};
