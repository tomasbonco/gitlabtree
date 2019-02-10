export function expandPath( path: string )
{
    const [_, __, folder, base, ext] = path.match( /^((.*)[\/\\])?([^\/\\]+?)\.([a-zA-Z0-9\-\_$]+)$/ );
    return { folder, base, ext };
}