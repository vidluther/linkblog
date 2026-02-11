import { Controller, Get, Header } from '@nestjs/common';
import { FeedService } from './feed.service';
import { Public } from '../auth/public.decorator';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  @Public()
  @Get()
  @Header('Content-Type', 'application/rss+xml')
  async getFeed(): Promise<string> {
    return this.feedService.generateRssFeed();
  }
}
