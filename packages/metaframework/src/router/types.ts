import { L, O, S } from 'ts-toolbelt'

type Params<List extends readonly string[]> = List extends [
  infer Start,
  ...infer Rest extends readonly string[],
]
  ? Start extends `[${infer Param}]`
    ? O.Merge<{ [K in Param]: string }, Params<Rest>>
    : Params<Rest>
  : {}
type ParamsList<Segments extends readonly string[]> = L.Filter<
  L.Select<Segments, `[${string}]`>,
  '[]'
>
type Segments<Path extends string> = L.Filter<S.Split<Path, '/'>, ''>

export type PathParams<Path extends string> = Params<ParamsList<Segments<Path>>>
