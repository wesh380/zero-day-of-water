export type CLDNode = { id: string; label: string; group?: string };
export type CLDEdge = { id?: string; source: string; target: string; sign?: '+' | '-'; weight?: number; delay?: number };

