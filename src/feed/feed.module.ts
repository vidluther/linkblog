import { Module } from '@nestjs/common';
import { LinksModule } from '../links/links.module';
import { FeedController } from './feed.controller';
import { FeedService } from './feed.service';

@Module({
  imports: [LinksModule],
  controllers: [FeedController],
  providers: [FeedService],
})
export class FeedModule {}
