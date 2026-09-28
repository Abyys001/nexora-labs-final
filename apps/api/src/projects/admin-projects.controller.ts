import { Body, Controller, Delete, Get, NotFoundException, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { CurrentAdmin } from "../auth/current-admin.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import type { JwtPayload } from "../auth/jwt-payload.type.js";
import { Roles } from "../auth/roles.decorator.js";
import { RolesGuard } from "../auth/roles.guard.js";
import { ZodValidationPipe } from "../common/zod-validation.pipe.js";
import type { ProjectRow } from "../db/schema.js";
import { CreateProjectDto, createProjectSchema, UpdateProjectDto, updateProjectSchema } from "./dto/project.dto.js";
import { ProjectsService } from "./projects.service.js";

const IdPipe = new ParseUUIDPipe({ exceptionFactory: () => new NotFoundException("Not found") });

@Controller("admin/projects")
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Roles("viewer")
  list(): Promise<ProjectRow[]> {
    return this.projectsService.listAll();
  }

  @Get(":id")
  @Roles("viewer")
  get(@Param("id", IdPipe) id: string): Promise<ProjectRow> {
    return this.projectsService.getById(id);
  }

  @Post()
  @Roles("manager")
  create(
    @Body(new ZodValidationPipe(createProjectSchema)) body: CreateProjectDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<ProjectRow> {
    return this.projectsService.create(body, admin.sub);
  }

  @Patch(":id")
  @Roles("manager")
  update(
    @Param("id", IdPipe) id: string,
    @Body(new ZodValidationPipe(updateProjectSchema)) body: UpdateProjectDto,
    @CurrentAdmin() admin: JwtPayload,
  ): Promise<ProjectRow> {
    return this.projectsService.update(id, body, admin.sub);
  }

  @Delete(":id")
  @Roles("manager")
  archive(@Param("id", IdPipe) id: string, @CurrentAdmin() admin: JwtPayload): Promise<ProjectRow> {
    return this.projectsService.archive(id, admin.sub);
  }
}
