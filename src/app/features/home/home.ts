import { Component } from '@angular/core';
import { ResourceCard} from '../home/resource-card/resource-card';
import { SerchFilter } from '../home/serch-filter/serch-filter';
import {HeroSection } from '../home/hero-section/hero-section';
import { MapSection} from '../home/map-section/map-section';
@Component({
  selector: 'app-home',
  imports: [ ResourceCard , SerchFilter ,HeroSection , MapSection],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {}
