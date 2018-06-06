import { TestBed, inject } from '@angular/core/testing';

import { DatabaseService } from './db-service';
import { PlatformMock } from 'ionic-mocks';
import { Platform } from 'ionic-angular';
import { SQLite } from '@ionic-native/sqlite';
import { SQLiteMock } from '../../../mocks/sqlite.mocks';

describe('Database Service', () => {

  let instance: DatabaseService;

  beforeAll(() => {
    TestBed.configureTestingModule({
      providers: [
        { provide: Platform, useFactory: () => PlatformMock.instance() },
        { provide: SQLite, useClass: SQLiteMock },
      ],
    }).compileComponents();
  });

  beforeAll(inject([Platform, SQLite], (platform, sqlite) => {
    instance = new DatabaseService(platform, sqlite);
    instance.setup();
    return new Promise((resolve) => {
      setTimeout(() => resolve(), 3000);
    });
  }));

  beforeAll(() => {
    return instance.start();
  });

  beforeEach(() => {
    return instance.deleteStorage();
  });

  afterAll(() => {
    return instance.deleteStorage().then(() => instance.stop());
  });

  it('Create database service', () => {
    expect(instance).toBeTruthy();
  });

  it('Create a device', () => {
    return instance.createDevice('testing_device_sn')
      .catch(e => expect(e).toBeUndefined());
  });

  it('Create a device with owner', () => {
    return instance.createDeviceWithOwner('testing_device_sn', 'Tester')
      .catch(e => expect(e).toBeUndefined());
  });

});
