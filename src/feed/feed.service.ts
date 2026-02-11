import { Injectable } from '@nestjs/common';
import { LinksService } from '../links/links.service';

@Injectable()
export class FeedService {
  constructor(private readonly linksService: LinksService) {}

  async generateRssFeed(): Promise<string> {
    const { Feed } = await import('feed');
    const links = await this.linksService.findAll();

    const feed = new Feed({
      title: 'Linkblog',
      description: 'Things that I found interesting',
      id: 'https://luther.io/blogroll',
      link: 'https://luther.io/blogroll',
      language: 'en',
      generator: 'Linkblog',
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
