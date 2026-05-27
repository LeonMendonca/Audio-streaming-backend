export type CreateArtistDto = {
    name: string;
    bio: string;
    imageUrl: string;
}

export type UpdateArtistDto = Partial<CreateArtistDto>