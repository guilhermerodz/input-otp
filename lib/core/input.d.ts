import type { HTMLInputElementWithMetadata } from './internal/types';
import type { ContainerAttributes } from './types';
export declare function onMount({ container, input, maxLength, regexp, onChange, onComplete, updateMirror, }: {
    container: HTMLElement;
    input: HTMLInputElementWithMetadata;
    maxLength: number;
    onChange: (value: string) => void;
    onComplete?: (value: string) => void;
    regexp?: RegExp;
    updateMirror: <K extends keyof ContainerAttributes, V extends ContainerAttributes[K]>(key: K, value: V) => void;
}): {
    unmount: () => void;
};
