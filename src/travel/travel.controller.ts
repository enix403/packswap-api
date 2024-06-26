import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Patch,
  Post
} from "@nestjs/common";
import {
  CreateTravelDto,
  SetTravelStopDto,
  UpdateTravelDto
} from "./dto/create-travel.dto";
import { ActiveUser, UseAuth } from "@/framework/common/guards";
import { User } from "@/auth/entities/user.entity";
import { Repository } from "typeorm";
// import { Comment, Review, Stop, Travel, TravelStop } from "./entities/stop.entity";
import { InjectRepository } from "@nestjs/typeorm";
import {
  entityCreated,
  entityDeleted,
  entityUpdated
} from "@/framework/common/response-creators";
import { UUIDParam } from "@/framework/common/decorators";
import { paginate } from "@/framework/common/paginate";
import { Review } from "./entities/review.entity";
import { Stop } from "./entities/stop.entity";
import { TravelStop } from "./entities/travel-stop.entity";
import { Travel } from "./entities/travel.entity";
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Travel Plan')
@Controller("travel")
export class TravelController {
  constructor(
    @InjectRepository(Travel)
    private readonly travelRepo: Repository<Travel>,
    @InjectRepository(Stop)
    private readonly stopRepo: Repository<Stop>,
  ) {}

  private async mapStops(stopDtos: SetTravelStopDto[]) {
    let travelStops: TravelStop[] = [];
    let index = 0;

    for (const stopDto of stopDtos) {
      let { id } = stopDto;

      let existingStop = id ? await this.stopRepo.findOneBy({ id }) : null;

      let travelStop = new TravelStop();
      travelStop.index = index++;

      if (existingStop) {
        travelStop.stop = existingStop;
      } else {
        let stop = new Stop();
        stop.address = stopDto.address;
        stop.city = stopDto.city;
        stop.country = stopDto.country;

        if (!stopDto.address || !stopDto.city || !stopDto.country) {
          throw new BadRequestException("Invalid travel stop");
        }

        travelStop.stop = stop;
      }

      travelStops.push(travelStop);
    }

    return travelStops;
  }

  @Post()
  @UseAuth()
  public async createTravel(
    @ActiveUser() user: User,
    @Body() dto: CreateTravelDto
  ) {
    let travel = new Travel();

    travel.user = user;
    travel.startDate = new Date(dto.startDate);
    travel.totalCapacity = dto.totalCapacity;
    travel.remainingCapacity = dto.totalCapacity;
    travel.travelStops = await this.mapStops(dto.travelStops);

    let savedTravel = await this.travelRepo.save(travel);
    return entityCreated(savedTravel);
  }

  @Patch(":id")
  @UseAuth()
  public async updateTravel(
    @UUIDParam("id") id: string,
    @ActiveUser() user: User,
    @Body() dto: UpdateTravelDto
  ) {
    let travel = await this.travelRepo.findOneOrFail({
      where: { id, user: { id: user.id } }
    });

    travel.startDate = dto.startDate
      ? new Date(dto.startDate)
      : travel.startDate;

    // travel.totalCapacity = dto.totalCapacity
    //   ? dto.totalCapacity
    //   : travel.totalCapacity;

    // TODO FIXME: this orphans the old TravelStop Rows
    travel.travelStops = dto.travelStops
      ? await this.mapStops(dto.travelStops)
      : travel.travelStops;

    await this.travelRepo.save(travel);
    return entityUpdated(travel);
  }

  @Delete(":id")
  @UseAuth()
  public async deleteTravel(
    @UUIDParam("id") id: string,
    @ActiveUser() user: User
  ) {
    await this.travelRepo.delete({
      id,
      user: { id: user.id }
    });

    return entityDeleted();
  }

  @Get()
  @UseAuth()
  public findAll() {
    let qb = this.travelRepo
      .createQueryBuilder("t")
      .leftJoinAndSelect("t.travelStops", "tstop")
      .leftJoinAndSelect("tstop.stop", "stop");

    return paginate(qb);
  }

  @Get(":id")
  @UseAuth()
  public async findById(@UUIDParam("id") id: string) {
    return await this.travelRepo
      .createQueryBuilder("t")
      .where("t.id = :id", { id })
      .leftJoinAndSelect("t.travelStops", "tstop")
      .leftJoinAndSelect("tstop.stop", "stop")
      .leftJoinAndSelect("t.reviews", "review")
      .leftJoinAndSelect("t.comments", "comment")
      .leftJoinAndSelect("comment.user", "c_user")
      .getOneOrFail();
  }
}
