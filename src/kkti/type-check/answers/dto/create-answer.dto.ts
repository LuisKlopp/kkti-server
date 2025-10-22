import { IsIn, IsInt } from 'class-validator';

export class CreateAnswerDto {
  @IsInt()
  sessionId: number;

  @IsInt()
  questionId: number;

  @IsIn(['A', 'B'])
  choice: 'A' | 'B';
}
