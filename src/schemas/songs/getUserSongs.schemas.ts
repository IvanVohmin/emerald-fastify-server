import { Type } from '@sinclair/typebox'

export const getUserSongsParamsSchema = Type.Object({
    userId: Type.Number(),
})

export const getUserSongsResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Any()
})

export const getUserSongsErrorSchema = Type.Object({
  success: Type.Boolean(),
  error: Type.String()
})