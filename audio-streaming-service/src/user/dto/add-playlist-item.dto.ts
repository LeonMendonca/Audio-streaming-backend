import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';

export class AddPlaylistItemDto {
  @IsString()
  @IsNotEmpty()
  songId: string;

  @IsInt()
  @Min(0)
  position: number;
}
