import 'zone.js';
import 'zone.js/testing';
import '@angular/compiler';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserTestingModule,
    platformBrowserTesting,
} from '@angular/platform-browser/testing';

// Inicializa o ambiente de testes do Angular para o Vitest/JSDOM
getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
);