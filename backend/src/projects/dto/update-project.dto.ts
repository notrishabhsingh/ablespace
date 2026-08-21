import { PartialType } from '@nestjs/mapped-types';
import { CreateProjectDto } from './create-project.dto';

// All fields become optional while keeping their validation rules.
export class UpdateProjectDto extends PartialType(CreateProjectDto) {}
