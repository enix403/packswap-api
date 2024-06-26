import { OmitType, PartialType } from "@nestjs/swagger";
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsUUID,
  Max,
  Min
} from "class-validator";

export class AddCommentDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsUUID()
  travelId: string;
}

export class UpdateCommentDto extends PartialType(
  OmitType(AddCommentDto, ["travelId"] as const)
) {}

export class AddReviewDto {
  @IsString()
  @IsNotEmpty()
  body: string;

  @IsNumber()
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsUUID()
  travelId: string;
}

export class UpdateReviewDto extends PartialType(
  OmitType(AddReviewDto, ["travelId"] as const)
) {}
