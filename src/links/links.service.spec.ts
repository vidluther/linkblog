import { Test, TestingModule } from '@nestjs/testing';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { LinksService } from './links.service';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';

const mockLink = {
  id: 1,
  url: 'https://example.com',
  title: 'Example',
  summary: 'A summary',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

function createMockSupabase() {
  const chain = {
    from: jest.fn().mockReturnThis(),
    select: jest.fn().mockReturnThis(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    single: jest.fn(),
  };
  return chain;
}

describe('LinksService', () => {
  let service: LinksService;
  let supabase: ReturnType<typeof createMockSupabase>;

  beforeEach(async () => {
    supabase = createMockSupabase();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LinksService,
        { provide: SUPABASE_CLIENT, useValue: supabase },
      ],
    }).compile();

    service = module.get<LinksService>(LinksService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should insert and return the new link', async () => {
      supabase.single.mockResolvedValue({ data: mockLink, error: null });

      const result = await service.create({
        url: 'https://example.com',
        title: 'Example',
      });

      expect(result).toEqual(mockLink);
      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(supabase.insert).toHaveBeenCalledWith({
        url: 'https://example.com',
        title: 'Example',
      });
    });

    it('should throw InternalServerErrorException on supabase error', async () => {
      supabase.single.mockResolvedValue({
        data: null,
        error: { message: 'insert failed' },
      });

      await expect(
        service.create({ url: 'https://example.com', title: 'Example' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('findAll', () => {
    it('should return all links ordered by created_at desc', async () => {
      const mockLinks = [mockLink];
      supabase.order.mockResolvedValue({ data: mockLinks, error: null });

      const result = await service.findAll();

      expect(result).toEqual(mockLinks);
      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(supabase.select).toHaveBeenCalledWith('*');
      expect(supabase.order).toHaveBeenCalledWith('created_at', {
        ascending: false,
      });
    });

    it('should throw InternalServerErrorException on supabase error', async () => {
      supabase.order.mockResolvedValue({
        data: null,
        error: { message: 'db error' },
      });

      await expect(service.findAll()).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('findOne', () => {
    it('should return a single link by id', async () => {
      supabase.single.mockResolvedValue({ data: mockLink, error: null });

      const result = await service.findOne(1);

      expect(result).toEqual(mockLink);
      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(supabase.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should throw NotFoundException when link does not exist', async () => {
      supabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
      await expect(service.findOne(999)).rejects.toThrow('Link #999 not found');
    });

    it('should throw InternalServerErrorException on generic supabase error', async () => {
      supabase.single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'unexpected' },
      });

      await expect(service.findOne(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('update', () => {
    it('should update and return the link', async () => {
      const updated = { ...mockLink, title: 'Updated' };
      supabase.single.mockResolvedValue({ data: updated, error: null });

      const result = await service.update(1, { title: 'Updated' });

      expect(result).toEqual(updated);
      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(supabase.update).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Updated',
          updated_at: expect.any(String),
        }),
      );
      expect(supabase.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should throw NotFoundException when link does not exist', async () => {
      supabase.single.mockResolvedValue({
        data: null,
        error: { code: 'PGRST116', message: 'not found' },
      });

      await expect(service.update(999, { title: 'Nope' })).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw InternalServerErrorException on generic supabase error', async () => {
      supabase.single.mockResolvedValue({
        data: null,
        error: { code: 'OTHER', message: 'unexpected' },
      });

      await expect(service.update(1, { title: 'Fail' })).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('should delete the link without returning data', async () => {
      supabase.single.mockResolvedValue({ error: null });

      const result = await service.remove(1);

      expect(result).toBeUndefined();
      expect(supabase.from).toHaveBeenCalledWith('links');
      expect(supabase.delete).toHaveBeenCalled();
      expect(supabase.eq).toHaveBeenCalledWith('id', 1);
    });

    it('should throw NotFoundException when link does not exist', async () => {
      supabase.single.mockResolvedValue({
        error: { code: 'PGRST116', message: 'not found' },
      });

      await expect(service.remove(999)).rejects.toThrow(NotFoundException);
    });

    it('should throw InternalServerErrorException on generic supabase error', async () => {
      supabase.single.mockResolvedValue({
        error: { code: 'OTHER', message: 'unexpected' },
      });

      await expect(service.remove(1)).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
