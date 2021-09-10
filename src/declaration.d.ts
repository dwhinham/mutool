declare module "*.css" {
    const mapping: Record<string, string>;
    export default mapping;
}

declare module 'xg_drum_kits.json' {
    export const notes: Array<any>;
    export const drum_kits: Array<any>;
}
