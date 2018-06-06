import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HttpClientModule } from '@angular/common/http';

import { MuranoApiService } from './murano-api-service';
import { PlatformMock } from 'ionic-mocks';
import { Platform } from 'ionic-angular';
import { Facebook } from '@ionic-native/facebook';
import { FacebookMock } from '@ionic-native-mocks/facebook';
import { HTTP } from '@ionic-native/http';
import { HTTPMock } from '@ionic-native-mocks/http';
import { WebsocketAuth } from './ws-auth';
import { AuthError } from '../../errors/auth-error';

const fakeAccount = { account: 'testing@exosite.com', password: 'password' };
const validToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjcsImlzcyI6Imh0dHA6Ly9zcGhpbngtdXNtOjMwMDAvYXBpL3YxL3VzZXIvbG9naW4iLCJpYXQiOjE1MTQ1MTExMjUsImV4cCI6MTUxNzEwMzEyNSwibmJmIjoxNTE0NTExMTI1LCJqdGkiOiJyMThodHhTT29YQXFFYVUxIn0.Ao09ke5WwCEpRKasgA23-EqgRK-7apYyxTbAXmvi-iI';

export class WebsocketAuthMock {
  public getAuthRequest(): Promise<any> {
    return Promise.resolve<any>({
      id: 'ws-request-auth',
      request: 'login',
      data: {
        token: 'testing token',
      },
    });
  }

  public processResponse(res): Promise<any> {
    return Promise.resolve(true);
  }
}

describe('Murano API Service - HTTP part', () => {

  let instance: MuranoApiService;
  let httpMock: HttpTestingController;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
      ],
      providers: [
        { provide: Facebook, useClass: FacebookMock },
        { provide: HTTP, useClass: HTTPMock },
        { provide: WebsocketAuth, useClass: WebsocketAuthMock },
        MuranoApiService
      ],
    });
    const injector = getTestBed();
    instance = injector.get(MuranoApiService);
    httpMock = injector.get(HttpTestingController);

    instance.setup({
      solutionId: 'unit-test',
      useHttp: false,
    });
  });


  it('Create murano API service', () => {
    expect(instance).toBeTruthy();
  });

  it('Check base url setup', () => {
    expect(instance.getBaseUrl()).toEqual('unit-test.apps.exosite.io');
  });

  it('Testing login', () => {
    const loginPromise = instance.login(fakeAccount.account, fakeAccount.password)
      .then(user => {
        expect(user).toEqual({
          account: fakeAccount.account,
          isOAuth: false,
          authProvider: MuranoApiService.AUTH_PROVIDER_NONE,
          token: 'res.body.token',
          isLoggedIn: true,
          isNewUser: false,
        });
      });
    const req = httpMock.expectOne(`https://${instance.getBaseUrl()}/api:1/session`);
    expect(req.request.method).toBe('POST');
    req.flush({ token: 'res.body.token' });
    return loginPromise;
  });

});

describe('Murano API Service - websocket part', () => {

  let instance: MuranoApiService;
  let wsAuth;

  beforeAll(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
      ],
      providers: [
        { provide: Facebook, useClass: FacebookMock },
        { provide: HTTP, useClass: HTTPMock },
        { provide: WebsocketAuth, useClass: WebsocketAuthMock },
        MuranoApiService
      ],
    });
    const injector = getTestBed();
    instance = injector.get(MuranoApiService);
    wsAuth = injector.get(WebsocketAuth);

    instance.setup({
      solutionId: 'smarthome-dev',
      useHttp: false,
    });
  });

  afterEach(() => {
    instance.disconnectWebsocket();
  });

  it('Testing websocket login - invalid token', () => {
    spyOn(wsAuth, 'getAuthRequest').and.returnValue({
      id: 'ws-request-auth',
      request: 'login',
      data: {
        token: 'a invalid token',
      },
    });
    spyOn(wsAuth, 'processResponse').and.callFake(res => {
      return Promise.reject(new AuthError(res.message || 'Invalid token'));
    });

    return instance.websocketLogin()
      .catch(e => {
        console.log('invalid token should be failed');
        expect(e instanceof AuthError).toBeTruthy();
        expect(e).toBeDefined();
      });
  });

  it('Testing websocket login - valid token', () => {
    spyOn(wsAuth, 'getAuthRequest').and.returnValue({
      id: 'ws-request-auth',
      request: 'login',
      data: {
        token: validToken,
      },
    });
    spyOn(wsAuth, 'processResponse').and.callFake(res => {
      if (res.status &&
        res.status.toUpperCase() === MuranoApiService.STATUS_OK.toUpperCase()) {
        return Promise.resolve(true);
      } else {
        return Promise.reject(new AuthError(res.message || 'Invalid token'));
      }
    });

    return instance.websocketLogin()
      .then(() => {
        console.log('websocketLogin success');
        expect('websocketLogin success').toBeTruthy();
      })
      .catch(e => expect(e).toBeUndefined());
  });

});