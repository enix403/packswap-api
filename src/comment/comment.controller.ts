import { User } from "@/auth/entities/user.entity";
import { UUIDParam } from "@/common/decorators";
import { UseAuth, ActiveUser } from "@/common/guards";
import { entityCreated } from "@/common/response-creators";
import { AddCommentDto, AddReviewDto } from "./dto/add-comment.dto";
import { Comment, Travel } from "@/travel/entities/stop.entity";
import { Controller, Post } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";

@Controller("comment")
export class CommentController {

  constructor(
    @InjectRepository(Travel)
    private readonly travelRepo: Repository<Travel>,
    @InjectRepository(Comment)
    private readonly commentRepo: Repository<Comment>,
  ) {}

  @Post()
  @UseAuth()
  public async addComment(
    @ActiveUser() user: User,
    dto: AddCommentDto
  ) {
    let travel = await this.travelRepo.findOneOrFail({
      where: { id: dto.travelId }
    });
    let comment = new Comment();
    comment.body = dto.body;
    comment.travel = travel;
    comment.user = user;

    comment = await this.commentRepo.save(comment);
    return entityCreated(comment);
  }

  // @Post()
  // @UseAuth()
  // public async updateComment(
  //   @ActiveUser() user: User,
  //   dto: AddCommentDto
  // ) {
  //   let travel = await this.travelRepo.findOneOrFail({
  //     where: { id: dto.travelId }
  //   });
  //   let comment = new Comment();
  //   comment.body = dto.body;
  //   comment.travel = travel;
  //   comment.user = user;

  //   comment = await this.commentRepo.save(comment);
  //   return entityCreated(comment);
  // }
}
