import { IsString, IsNumber, IsArray, Min } from 'class-validator';

export class CreateOfferDto {
  @IsString()
  title: string;

  @IsString()
  description: string;

  @IsString()
  category: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsArray()
  @IsString({ each: true })
  photos?: string[];
}
