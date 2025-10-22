import { IsArray } from 'class-validator';

export class CreateSessionWithAnswersDto {
  @IsArray()
  answers: {
    questionId: number;
    choice: 'A' | 'B';
  }[];
}
