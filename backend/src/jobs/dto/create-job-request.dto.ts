import { ArrayMinSize, IsArray, IsUrl } from 'class-validator';

export class CreateJobRequestDto {
    @IsArray()
    @ArrayMinSize(1)
    @IsUrl({}, { each: true })
    urls!: string[];
}
