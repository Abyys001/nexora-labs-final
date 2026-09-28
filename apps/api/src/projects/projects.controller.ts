import { Controller, Get, Header, Param, Query } from "@nestjs/common";
import type { ProjectRow } from "../db/schema.js";
import { ProjectsService } from "./projects.service.js";

@Controller("public/projects")
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Get()
  @Header("Cache-Control", "public, max-age=300")
  list(@Query("homepage") homepage?: string): Promise<ProjectRow[]> {
    return this.projectsService.listPublic({ homepageOnly: homepage === "true" });
  }

  @Get(":slug")
  @Header("Cache-Control", "public, max-age=300")
  get(@Param("slug") slug: string): Promise<ProjectRow> {
    return this.projectsService.getPublicBySlug(slug);
  }
}
