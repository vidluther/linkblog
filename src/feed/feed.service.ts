import { Injectable } from '@nestjs/common';
import { Feed } from 'feed';
import { LinksService } from '../links/links.service';

@Injectable()
export class FeedService {
  constructor(private readonly linksService: LinksService) {}

  async generateRssFeed(): Promise<string> {
    const links = await this.linksService.findAll();

    const feed = new Feed({
      title: 'Linkblog',
      description: 'Links worth reading',
      id: 'https://luther.io/blogroll',
      link: 'https://luther.io/blogroll',
      language: 'en',
      copyright: '',
    });

    for (const link of links ?? []) {
      feed.addItem({
        title: link.title,
        id: link.url,
        link: link.url,
        description: link.summary ?? '',
        date: new Date(link.created_at),
      });
    }

    return feed.rss2();
  }
}
