import { IsMongoId, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateCommentDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  body: string;

  // Optional parent comment id — set when this is a reply.
  @IsOptional()
  @IsMongoId()
  parentId?: string;
}
