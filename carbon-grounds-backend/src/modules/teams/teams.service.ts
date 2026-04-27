import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TeamMember } from './entities/team-member.entity';
import { AddTeamMemberDto } from './dto/create-team-member.dto';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(TeamMember)
    private teamRepo: Repository<TeamMember>,
  ) {}

  async addMember(dto: AddTeamMemberDto): Promise<TeamMember> {
    const existing = await this.teamRepo.findOne({ where: { userId: dto.userId } });
    if (existing) throw new ConflictException('User is already a team member');
    const member = this.teamRepo.create(dto);
    return this.teamRepo.save(member);
  }

  async findAll(): Promise<TeamMember[]> {
    return this.teamRepo.find({
      relations: ['user'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<TeamMember> {
    const member = await this.teamRepo.findOne({ where: { id }, relations: ['user'] });
    if (!member) throw new NotFoundException(`Team member #${id} not found`);
    return member;
  }

  async update(id: string, dto: Partial<AddTeamMemberDto>): Promise<TeamMember> {
    const member = await this.findOne(id);
    Object.assign(member, dto);
    return this.teamRepo.save(member);
  }

  async remove(id: string): Promise<{ message: string }> {
    const member = await this.findOne(id);
    await this.teamRepo.remove(member);
    return { message: 'Team member removed successfully' };
  }

  async count(): Promise<number> {
    return this.teamRepo.count();
  }
}
