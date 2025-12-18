import { PistonEngineService } from "@api/app/infrastructure/engine/piston.service";
import { Module } from "@nestjs/common";

@Module({
  providers: [PistonEngineService],
  exports: [PistonEngineService]
})
export class EngineModule {}
