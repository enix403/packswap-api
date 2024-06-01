import { User } from "@/auth/entities/user.entity";
import { UUIDParam } from "@/common/decorators";
import { UseAuth, ActiveUser } from "@/common/guards";
import { entityCreated } from "@/common/response-creators";
import { AddReviewDto } from "./dto/add-comment.dto";
import { Review, Travel } from "@/travel/entities/stop.entity";
import { Controller, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Controller("review")
export class ReviewController {
  constructor(
    @InjectRepository(Travel)
    private readonly travelRepo: Repository<Travel>,
    @InjectRepository(Review)
    private readonly reviewRepo: Repository<Review>
  ) {}

  @Post()
  @UseAuth()
  public async addReview(@ActiveUser() user: User, dto: AddReviewDto) {
    // TODO: validate the target travel is valid (has an order with the reviewer)

    let travel = await this.travelRepo.findOneOrFail({
      where: { id: dto.travelId }
    });


    // this.reviewRepo.

    let review = new Review();
    review.body = dto.body;
    review.rating = dto.rating;
    review.travel = travel;
    review.user = user;

    review = await this.reviewRepo.save(review);
    return entityCreated(review);
  }
}
