import { Injectable } from '@nestjs/common';
import { PokeResponse } from './interfaces/poke-response.interface';
import { InjectModel } from '@nestjs/mongoose';
import { Pokemon } from 'src/pokemon/entities/pokemon.entity';
import { Model } from 'mongoose';
import { AxiosAdapter } from 'src/common/adapters/axios.adapter';

@Injectable()
export class SeedService {

  constructor(
    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>,
    private readonly http: AxiosAdapter
  ) { }

  async executeSeed() {

    await this.pokemonModel.deleteMany({}); // delete * from pokemons;

    const data = await this.http.get<PokeResponse>('https://pokeapi.co/api/v2/pokemon?limit=650');

    // 1 Ejecuto un insert a la bd por cada elemento
    // data.results.forEach( async({ name, url }) => {
    //   const segments = url.split('/');
    //   const numero = +segments[segments.length -2];
    //   const pokemon = await this.pokemonModel.create({ name, numero });
    // });

    // 2 Creo un array de promesas y luego ejecuto todas las promesas juntas.
    // const insertPromisesArray = [];
    // data.results.forEach(async ({ name, url }) => {
    //   const segments = url.split('/');
    //   const numero = +segments[segments.length - 2];

    //   insertPromisesArray.push(this.pokemonModel.create({ name, numero }));
    // });
    // await Promise.all(insertPromisesArray);
    
    // 3 Uso la misma estructura del foreach y solo creo una inserción. (con el anterior son muchos create)    
    //a lo siguiente puedo definirlo en línea o crearme una interfaz.
    const pokemonToInsert: {name: string, numero: number}[] = [];
    
    data.results.forEach( ({ name, url }) => {
      const segments = url.split('/');
      const numero = +segments[segments.length - 2 ];

      pokemonToInsert.push({ name, numero }) // [{ name: bulbasaur, numero: 1 }]
    
    });

    await this.pokemonModel.insertMany(pokemonToInsert);
    return 'Seed executed';
  }
}
