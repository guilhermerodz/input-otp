// Source https://github.com/bryanmylee/svelte-previous/

import type { Readable, Updater, Writable } from 'svelte/store'
import { derived, writable } from 'svelte/store'

type WithPreviousOptions<T, N extends number> = {
  numToTrack?: N
  initPrevious?: Array<T>
  requireChange?: boolean
  isEqual?: IsEqual<T>
}

type WithPreviousResult<T, N extends number> = [
  Writable<T>,
  ...Tuple<Readable<T | null>, N>,
]

export function withPrevious<T, N extends number = 1>(
  initValue: T,
  {
    numToTrack = 1 as N,
    initPrevious = [],
    requireChange = true,
    isEqual = (a, b) => a === b,
  }: WithPreviousOptions<T, N> = {},
): WithPreviousResult<T, N> {
  if (numToTrack <= 0) {
    throw new Error('Must track at least 1 previous')
  }

  // Generates an array of size numToTrack with the first element set to
  // initValue and all other elements set to ...initPrevious or null.
  const rest: Array<T | null> = initPrevious.slice(0, numToTrack)
  while (rest.length < numToTrack) {
    rest.push(null)
  }

  const values = writable<NonNullFirstArray<T>>([initValue, ...rest])
  const updateCurrent = (fn: Updater<T>) => {
    values.update($values => {
      const newValue = fn($values[0])
      // Prevent updates if values are equal as defined by an isEqual
      // comparison. By default, use a simple === comparison.
      if (requireChange && isEqual(newValue, $values[0])) {
        return $values
      }
      // Adds the new value to the front of the array and removes the oldest
      // value from the end.
      return [newValue, ...$values.slice(0, numToTrack)]
    })
  }
  const current = {
    subscribe: derived(values, $values => $values[0]).subscribe,
    update: updateCurrent,
    set: (newValue: T) => {
      updateCurrent(() => newValue)
    },
  }
  // Create an array of derived stores for every other element in the array.
  const others = [...Array(numToTrack)].map((_, i) =>
    derived(values, $values => $values[i + 1]),
  )
  return [current, ...others] as WithPreviousResult<T, N>
}

/**
 * @deprecated Since version 2.0.1. Use `withPrevious` instead.
 */
export const usePrevious = withPrevious

// UTILITY TYPES
// =============
type IsEqual<T> = (a: T, b: T) => boolean
type NonNullFirstArray<T> = [T, ...Array<T | null>]

/**
 * Adopted from https://github.com/microsoft/TypeScript/issues/26223#issuecomment-674514787
 */
type BuildPowersOf2LengthArrays<
  N extends number,
  R extends never[][],
> = R[0][N] extends never
  ? R
  : BuildPowersOf2LengthArrays<N, [[...R[0], ...R[0]], ...R]>

type ConcatLargestUntilDone<
  N extends number,
  R extends never[][],
  B extends never[],
> = B['length'] extends N
  ? B
  : [...R[0], ...B][N] extends never
  ? ConcatLargestUntilDone<
      N,
      R extends [R[0], ...infer U] ? (U extends never[][] ? U : never) : never,
      B
    >
  : ConcatLargestUntilDone<
      N,
      R extends [R[0], ...infer U] ? (U extends never[][] ? U : never) : never,
      [...R[0], ...B]
    >

type Replace<R extends unknown[], T> = { [K in keyof R]: T }

type Tuple<T, N extends number> = number extends N
  ? T[]
  : {
      [K in N]: BuildPowersOf2LengthArrays<K, [[never]]> extends infer U
        ? U extends never[][]
          ? Replace<ConcatLargestUntilDone<K, U, []>, T>
          : never
        : never
    }[N]
