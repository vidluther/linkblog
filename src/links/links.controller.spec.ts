import { LinksController } from './links.controller';
import { LinksService } from './links.service';
import { IS_PUBLIC_KEY } from '../auth/public.decorator';

const mockLink = {
  id: 1,
  url: 'https://example.com',
  title: 'Example',
  summary: 'A summary',
  created_at: '2026-01-01T00:00:00.000Z',
  updated_at: '2026-01-01T00:00:00.000Z',
};

describe('LinksController', () => {
  let controller: LinksController;
  let service: LinksService;

  beforeEach(() => {
    service = {
      create: vi.fn(),
      findAll: vi.fn(),
      findOne: vi.fn(),
      update: vi.fn(),
      remove: vi.fn(),
    } as unknown as LinksService;
    controller = new LinksController(service);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should delegate to LinksService.create', async () => {
      vi.mocked(service.create).mockResolvedValue(mockLink);

      const dto = { url: 'https://example.com', title: 'Example' };
      const result = await controller.create(dto);

      expect(result).toEqual(mockLink);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should delegate to LinksService.findAll', async () => {
      vi.mocked(service.findAll).mockResolvedValue([mockLink]);

      const result = await controller.findAll();

      expect(result).toEqual([mockLink]);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should delegate to LinksService.findOne with parsed id', async () => {
      vi.mocked(service.findOne).mockResolvedValue(mockLink);

      const result = await controller.findOne('1');

      expect(result).toEqual(mockLink);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should delegate to LinksService.update with parsed id', async () => {
      const updated = { ...mockLink, title: 'Updated' };
      vi.mocked(service.update).mockResolvedValue(updated);

      const dto = { title: 'Updated' };
      const result = await controller.update('1', dto);

      expect(result).toEqual(updated);
      expect(service.update).toHaveBeenCalledWith(1, dto);
    });
  });

  describe('remove', () => {
    it('should delegate to LinksService.remove with parsed id', async () => {
      vi.mocked(service.remove).mockResolvedValue(undefined);

      const result = await controller.remove('1');

      expect(result).toBeUndefined();
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });

  describe('@Public() decorator', () => {
    it('should mark findAll as public', () => {
      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, controller.findAll);
      expect(metadata).toBe(true);
    });

    it('should mark findOne as public', () => {
      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, controller.findOne);
      expect(metadata).toBe(true);
    });

    it('should NOT mark create as public', () => {
      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, controller.create);
      expect(metadata).toBeUndefined();
    });

    it('should NOT mark update as public', () => {
      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, controller.update);
      expect(metadata).toBeUndefined();
    });

    it('should NOT mark remove as public', () => {
      const metadata = Reflect.getMetadata(IS_PUBLIC_KEY, controller.remove);
      expect(metadata).toBeUndefined();
    });
  });
});
