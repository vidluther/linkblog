import { Controller, Get, Header } from '@nestjs/common';
import { FeedService } from './feed.service';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Get()
  @Header('Content-Type', 'application/rss+xml')
  async getFeed(): Promise<string> {
    return this.feedService.generateRssFeed();
  }
}
