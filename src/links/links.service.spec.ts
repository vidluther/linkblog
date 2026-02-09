import { Test, TestingModule } from '@nestjs/testing';
import { LinksService } from './links.service';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';

const mockSupabaseClient = {
  from: jest.fn().mockReturnThis(),
  select: jest.fn().mockReturnThis(),
  order: jest.fn().mockResolvedValue({ data: [], error: null }),
};

describe('LinksService', () => {
  let service: LinksService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        { provide: SUPABASE_CLIENT, useValue: mockSupabaseClient },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('findAll should return data from supabase', async () => {
    const mockLinks = [
      {
        id: 1,
        url: 'https://example.com',
        title: 'Example',
        summary: 'A summary',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    mockSupabaseClient.order.mockResolvedValueOnce({
      data: mockLinks,
      error: null,
    });

    const result = await service.findAll();
    expect(result).toEqual(mockLinks);
    expect(mockSupabaseClient.from).toHaveBeenCalledWith('links');
    expect(mockSupabaseClient.select).toHaveBeenCalledWith('*');
    expect(mockSupabaseClient.order).toHaveBeenCalledWith('created_at', {
      ascending: false,
    });
  });

  it('findAll should throw on supabase error', async () => {
    mockSupabaseClient.order.mockResolvedValueOnce({
      data: null,
      error: { message: 'db error' },
    });

    await expect(service.findAll()).rejects.toThrow('db error');
  });
});
