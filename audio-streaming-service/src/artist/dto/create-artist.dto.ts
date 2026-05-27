import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateArtistDto {
    @IsString()
    @IsNotEmpty()
    name: string;

    @IsString()
    @IsOptional()
    bio?: string;

    @IsString()
    @IsOptional()
    imageUrl?: string;
}