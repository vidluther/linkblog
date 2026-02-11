import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase.module.js';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';

@Injectable()
export class LinksService {
  constructor(
    @Inject(SUPABASE_CLIENT) private readonly supabase: SupabaseClient,
  ) {}

  async create(createLinkDto: CreateLinkDto) {
    console.log('Adding link:', createLinkDto);

    const { data, error } = await this.supabase
      .from('links')
      .insert(createLinkDto)
      .select()
      .single();

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async findAll() {
    const { data, error } = await this.supabase
      .from('links')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async findOne(id: number) {
    const { data, error } = await this.supabase
      .from('links')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Link #${id} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async update(id: number, updateLinkDto: UpdateLinkDto) {
    const { data, error } = await this.supabase
      .from('links')
      .update({ ...updateLinkDto, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Link #${id} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }

    return data;
  }

  async remove(id: number) {
    const { error } = await this.supabase
      .from('links')
      .delete()
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new NotFoundException(`Link #${id} not found`);
      }
      throw new InternalServerErrorException(error.message);
    }
  }
}
