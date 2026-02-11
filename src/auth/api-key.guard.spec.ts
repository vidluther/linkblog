import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ApiKeyGuard } from './api-key.guard';

describe('ApiKeyGuard', () => {
  let guard: ApiKeyGuard;
  let reflector: Reflector;
  let configService: ConfigService;

  const API_KEY = 'test-api-key-123';

  function createMockContext(
    headers: Record<string, string> = {},
  ): ExecutionContext {
    return {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ headers }),
      }),
    } as unknown as ExecutionContext;
  }

  beforeEach(() => {
    reflector = new Reflector();
    configService = {
      get: jest.fn().mockReturnValue(API_KEY),
    } as unknown as ConfigService;
    guard = new ApiKeyGuard(reflector, configService);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access when route is marked @Public()', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should allow access with valid API key', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockContext({ 'x-api-key': API_KEY });

    expect(guard.canActivate(context)).toBe(true);
  });

  it('should throw UnauthorizedException when x-api-key header is missing', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockContext();

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow(
      'Missing x-api-key header',
    );
  });

  it('should throw UnauthorizedException when API key is wrong', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockContext({ 'x-api-key': 'wrong-key' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('Invalid API key');
  });

  it('should throw UnauthorizedException when API_KEY env var is not configured', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    (configService.get as jest.Mock).mockReturnValue(undefined);
    const context = createMockContext({ 'x-api-key': 'some-key' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
    expect(() => guard.canActivate(context)).toThrow('API_KEY not configured');
  });

  it('should reject keys of different lengths', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);
    const context = createMockContext({ 'x-api-key': 'short' });

    expect(() => guard.canActivate(context)).toThrow(UnauthorizedException);
  });

  it('should not check API key for public routes', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);
    // No x-api-key header, but route is public — should still pass
    const context = createMockContext();

    expect(guard.canActivate(context)).toBe(true);
    expect(configService.get).not.toHaveBeenCalled();
  });
});
