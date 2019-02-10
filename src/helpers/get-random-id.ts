export function getRandomId(): string
{
    // https://stackoverflow.com/a/38622545
    return Math.random().toString(36).substr(2, 5);
}