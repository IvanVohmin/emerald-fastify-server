import '@fastify/jwt'
import type {FastifyRequest} from "fastify";
import type admin from 'firebase-admin'

declare module 'fastify' {
    interface FastifyInstance {
        firebase: typeof admin
        authenticate(
            request: FastifyRequest,
            reply: FastifyReply
        ): Promise<void>
    }
}


declare module '@fastify/jwt' {
    interface FastifyJWT {
        payload: {
            userId: number
            email: string
        }
        user: {
            userId: number
            email: string
        }
    }
}

export interface IGetAudioFileRequest {
    filename: string;
}

export interface IGetSongDataRequest {
    songId: string;
}

export type TEditSongRequest = FastifyRequest<{
    Params: { songId: string }
    Body: IEditSongBody
}>

export type TStreamSongRequest = FastifyRequest<{
  Params: { songId: string };
}>;

export interface IEditSongBody {
    name: string | undefined;
    poster_url: string | undefined;
    author: string | undefined;
}

export interface IRemoveSongRequest {
    songId: string;
}

export type TGetUsersSongsRequest = FastifyRequest<{
    Params: { userId: Number }
}>

export interface IGetUsersSongsRequest {
    userId: string;
}