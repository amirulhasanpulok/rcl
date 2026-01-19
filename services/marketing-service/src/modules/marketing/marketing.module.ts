import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MarketingService } from './marketing.service';
import { MarketingController } from './marketing.controller';
import { SEOMetadata, SEOMetadataSchema } from '@/entities/seo-metadata.schema';
import { TagConfig, TagConfigSchema } from '@/entities/tag-config.schema';
import { ConversionEvent, ConversionEventSchema } from '@/entities/conversion-event.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: SEOMetadata.name, schema: SEOMetadataSchema },
      { name: TagConfig.name, schema: TagConfigSchema },
      { name: ConversionEvent.name, schema: ConversionEventSchema },
    ]),
  ],
  controllers: [MarketingController],
  providers: [MarketingService],
  exports: [MarketingService],
})
export class MarketingModule {}
