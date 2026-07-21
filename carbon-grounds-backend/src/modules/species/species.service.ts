import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Species } from './entities/species.entity';
import { CreateSpeciesDto } from './dto/create-species.dto';
import { UpdateSpeciesDto } from './dto/update-species.dto';

const SEED_SPECIES: Partial<Species>[] = [
  {
    commonName: 'Teak',
    scientificName: 'Tectona grandis',
    woodDensity: 0.65,
    carbonFraction: 0.47,
    allometricA: -2.134,
    allometricB: 2.53,
    maxRotationYears: 40,
  },
  {
    commonName: 'Sal',
    scientificName: 'Shorea robusta',
    woodDensity: 0.85,
    carbonFraction: 0.47,
    allometricA: -2.134,
    allometricB: 2.53,
    maxRotationYears: 60,
  },
  {
    commonName: 'Gamhar',
    scientificName: 'Gmelina arborea',
    woodDensity: 0.42,
    carbonFraction: 0.47,
    allometricA: -2.134,
    allometricB: 2.53,
    maxRotationYears: 12,
  },
  {
    commonName: 'Mango',
    scientificName: 'Mangifera indica',
    woodDensity: 0.56,
    carbonFraction: 0.47,
    allometricA: -2.134,
    allometricB: 2.53,
    maxRotationYears: 40,
  },
  {
    commonName: 'Bamboo',
    scientificName: 'Bambusa bambos',
    woodDensity: 0.5,
    carbonFraction: 0.47,
    allometricA: -2.134,
    allometricB: 2.53,
    maxRotationYears: 5,
  },
  {
    commonName: 'Eucalyptus',
    scientificName: 'Eucalyptus tereticornis',
    woodDensity: 0.55,
    carbonFraction: 0.47,
    allometricA: -2.134,
    allometricB: 2.53,
    maxRotationYears: 8,
  },
  {
    commonName: 'Neem',
    scientificName: 'Azadirachta indica',
    woodDensity: 0.6,
    carbonFraction: 0.47,
    allometricA: -2.134,
    allometricB: 2.53,
    maxRotationYears: 25,
  },
];

@Injectable()
export class SpeciesService implements OnModuleInit {
  constructor(
    @InjectRepository(Species)
    private speciesRepo: Repository<Species>,
  ) {}

  async onModuleInit() {
    if ((await this.speciesRepo.count()) === 0) {
      await this.speciesRepo.save(this.speciesRepo.create(SEED_SPECIES));
    }
  }

  create(dto: CreateSpeciesDto): Promise<Species> {
    return this.speciesRepo.save(this.speciesRepo.create(dto));
  }

  findAll(): Promise<Species[]> {
    return this.speciesRepo.find({ order: { commonName: 'ASC' } });
  }

  async findOne(id: string): Promise<Species> {
    const species = await this.speciesRepo.findOne({ where: { id } });
    if (!species) throw new NotFoundException(`Species #${id} not found`);
    return species;
  }

  async update(id: string, dto: UpdateSpeciesDto): Promise<Species> {
    const species = await this.findOne(id);
    Object.assign(species, dto);
    return this.speciesRepo.save(species);
  }

  count(): Promise<number> {
    return this.speciesRepo.count();
  }
}
