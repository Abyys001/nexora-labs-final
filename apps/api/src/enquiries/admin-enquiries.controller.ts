import { Body, Controller, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Query, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import { ListEnquiriesQueryDto, listEnquiriesQuerySchema } from "./dto/list-enquiries.query.dto.js";
import { UpdateEnquiryDto, updateEnquirySchema } from "./dto/update-enquiry.dto.js";
import { EnquiriesService, EnquiryDetailResponse, EnquiryListResult, EnquiryResponse, EnquiryStats } from "./enquiries.service.js";

// Malformed ids are indistinguishable from missing ones to the caller, and must never reach Postgres' uuid cast.
const EnquiryIdPipe = new ParseUUIDPipe({ exceptionFactory: () => new NotFoundException("Enquiry not found") });

@Controller("admin/enquiries")
@UseGuards(JwtAuthGuard)
export class AdminEnquiriesController {
  constructor(private readonly enquiriesService: EnquiriesService) {}

  @Get()
  list(
    @Query(new ZodValidationPipe(listEnquiriesQuerySchema)) query: ListEnquiriesQueryDto,
  ): Promise<EnquiryListResult> {
    return this.enquiriesService.list(query);
  }

  @Get("stats")
  stats(): Promise<EnquiryStats> {
    return this.enquiriesService.stats();
  }

  @Get(":id")
  findOne(@Param("id", EnquiryIdPipe) id: string): Promise<EnquiryDetailResponse> {
    return this.enquiriesService.findDetailById(id);
  }

  @Patch(":id")
  update(
    @Param("id", EnquiryIdPipe) id: string,
    @Body(new ZodValidationPipe(updateEnquirySchema)) body: UpdateEnquiryDto,
  ): Promise<EnquiryResponse> {
    return this.enquiriesService.update(id, body);
  }
}
