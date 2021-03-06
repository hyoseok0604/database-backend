import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Theater } from 'src/theaters/entities/theater.entity';
import { getRepository, Repository } from 'typeorm';
import { CreateScreenInput } from './dtos/create-screen.input';
import { CreateSpecialScreenInput } from './dtos/create-specialScreen.input';
import { UpdateScreenInput } from './dtos/update-screen.input';
import { UpdateSpecialScreenInput } from './dtos/update-specialScreen.input';
import { Screen } from './entities/screen.entity';
import { SpecialScreen } from './entities/specialScreen.entity';

@Injectable()
export class ScreensService {
    constructor(
        @InjectRepository(Screen)
        private readonly screenRepository: Repository<Screen>,
        @InjectRepository(SpecialScreen)
        private readonly specialScreenRepository: Repository<SpecialScreen>,
    ) {}

    async createScreen(createScreenInput: CreateScreenInput): Promise<Screen> {
        let screen = new Screen();
        screen.name = createScreenInput.name;

        if(createScreenInput.theaterId) {
            const theater = await getRepository(Theater).findOne({id: createScreenInput.theaterId});
            if(!theater) throw new NotFoundException(`Theater ${createScreenInput.theaterId} is not found`);

            screen.theater = theater;
        }

        if(createScreenInput.specialScreenId) {
            const specialScreen = await this.specialScreenRepository.findOne({id: createScreenInput.specialScreenId});
            if(!specialScreen) throw new NotFoundException(`SpecialScreen id : ${createScreenInput.specialScreenId} is not found`)

            screen.specialScreen = specialScreen;
        }

        return this.screenRepository.save(screen);
    }

    async createSpecialScreen(createSpecialScreenInput: CreateSpecialScreenInput): Promise<SpecialScreen> {
        let specialScreen = new SpecialScreen();
        specialScreen.name = createSpecialScreenInput.name;
        specialScreen.screens = [];

        if(createSpecialScreenInput.screenIds) {
            for(const screenId of createSpecialScreenInput.screenIds) {
                const screen = await this.screenRepository.findOne({id: screenId});

                specialScreen.screens.push(screen);
            }
        }

        return this.specialScreenRepository.save(specialScreen);
    }

    async findAllScreen(): Promise<Array<Screen>> {
        return await this.screenRepository.find({relations: ["theater", "specialScreen"]});
    }

    async findOneScreenById(id: number): Promise<Screen> {
        const screen = await this.screenRepository.findOne({id: id}, {relations: ["theater", "specialScreen"]});
        if(!screen) throw new NotFoundException(`Screen id : ${id} is not found`);

        return screen;
    }

    async findAllScreenByTheaterId(id: number): Promise<Array<Screen>> {
        const theater = await getRepository(Theater).findOne({id: id});
        if(!theater) throw new NotFoundException(`Theater id ${id} is not found`);

        return await this.screenRepository.find({
            where: {
                theater: theater,
            },
            relations: ["theater", "specialTheater"],
        });
    }

    async findAllScreenBySpecialScreenId(id: number): Promise<Array<Screen>> {
        const specialScreen = await this.specialScreenRepository.findOne({id: id});
        if(!specialScreen) throw new NotFoundException(`SpecialScreen id : ${id} is not found`);

        return await this.screenRepository.find({
            where: {
                specialScreen: specialScreen,
            },
            relations: ["theater", "specialTheater"],
        })
    }

    async findAllSpecialScreen(): Promise<Array<SpecialScreen>> {
        return await this.specialScreenRepository.find();
    }

    async findOneSpecialScreenById(id: number): Promise<SpecialScreen> {
        const specialScreen = await this.specialScreenRepository.findOne({id: id});
        if(!specialScreen) throw new NotFoundException(`SpecialScreen id : ${id} is not found`);

        return specialScreen;
    }

    async updateScreen(id: number, updateScreenInput: UpdateScreenInput): Promise<Screen> {
        let screen = await this.screenRepository.findOne({id: id});
        if(!screen) throw new NotFoundException(`Screen id : ${id} is not found`);

        Object.assign(screen, updateScreenInput);
        if(!updateScreenInput.specialScreenId) screen.specialScreen = null;
        else {
            const specialScreen = await this.specialScreenRepository.findOne({id: updateScreenInput.specialScreenId});
            if(!specialScreen) throw new NotFoundException(`SpecialScreen id : ${updateScreenInput.specialScreenId} is not found`)

            screen.specialScreen = specialScreen;
        }

        return await this.screenRepository.save(screen);
    }

    async updateSpecialScreen(id: number, updateSpecialScreenInput: UpdateSpecialScreenInput): Promise<SpecialScreen> {
        let specialScreen = await this.specialScreenRepository.findOne({id: id});
        if(!specialScreen) throw new NotFoundException(`SpecialScreen id : ${id} is not found`);

        Object.assign(specialScreen, updateSpecialScreenInput);
        specialScreen.screens = []
        if(updateSpecialScreenInput.screenIds) {
            for(const screenId of updateSpecialScreenInput.screenIds) {
                const screen = await this.screenRepository.findOne({id: screenId});

                specialScreen.screens.push(screen);
            }
        }

        return await this.specialScreenRepository.save(specialScreen);
    }

    async deleteScreen(id: number): Promise<boolean> {
        const screen = await this.screenRepository.findOne({id: id});
        if(!screen) throw new NotFoundException(`Screen id : ${id} is not found`);

        await this.screenRepository.remove(screen);
        return true;
    }

    async deleteSpecialScreen(id: number): Promise<boolean> {
        const specialScreen = await this.specialScreenRepository.findOne({id: id});
        if(!specialScreen) throw new NotFoundException(`SpecialScreen id : ${id} is not found`);

        await this.specialScreenRepository.remove(specialScreen);
        return true;
    }
}
