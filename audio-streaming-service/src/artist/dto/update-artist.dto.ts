import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class UpdateArtistDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}