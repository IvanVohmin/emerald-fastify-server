import { Type } from '@sinclair/typebox'

export const editSongParamsSchema = Type.Object({
  songId: Type.String({ minLength: 1 })
})

export const editSongBodySchema = Type.Object(
  {
    name: Type.Optional(Type.String()),
    poster_url: Type.Optional(Type.String()),
    author: Type.Optional(Type.String())
  },
  { minProperties: 1 }
)

export const editSongResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Any()
})

export const editSongErrorSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.String()
})
