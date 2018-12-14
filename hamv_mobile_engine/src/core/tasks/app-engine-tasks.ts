import { Injectable } from '@angular/core';

import { AccountService } from '../services/account/account-service';
import { DatabaseService } from '../services/storage/db-service';
import { MuranoApiService } from '../services/network/murano-api-service';
import { DnssdService } from '../services/mdns/dnssd-service';

import { Group } from '../models/group';
import { Schedule } from '../models/schedule';
import { User, UserRole } from '../models/device';
import { WebsocketEvent } from '../models/ws-message';

import { AccountError } from '../errors/account-error';

@Injectable()
export class AppEngineTasks {

    constructor(
        private accountService: AccountService,
        private databaseService: DatabaseService,
        private muranoApiService: MuranoApiService,
        private dnssdService: DnssdService
    ) {
    }

    public registerTask(account: string, password: string): Promise<any> {
        return this.muranoApiService.register(account, password)
            .then((user) => {
                return this.accountService.setAccount(user)
                    .then(() => {
                        return this.accountService.setPassword(user, password);
                    })
                    .then(() => {
                        return user;
                    });
            });
    }

    public sessionTask(): Promise<any> {
        return this.accountService.getAccount()
            .then((user) => {
                return this.muranoApiService.session(user);
            })
            .then(sessionUser => this.accountService.checkSession(sessionUser));
    }

    public refreshTokenTask(): Promise<any> {
        let account;

        return this.accountService.getAccount()
            .then((user) => {
                account = user;
                return this.accountService.getPassword(user);
            })
            .then((password) => {
                return this.muranoApiService.refreshToken(account, password);
            })
            .then((user) => {
                return this.accountService.setAccount(user);
            });
    }

    public loginTask(account: string, password: string): Promise<any> {
        return this.muranoApiService.login(account, password)
            .then((user) => {
                return this.accountService.setAccount(user)
                    .then(() => {
                        return this.accountService.setPassword(user, password);
                    })
                    .then(() => {
                        return user;
                    });
            });
    }

    public loginWithFacebookTask(): Promise<any> {
        return this.muranoApiService.loginWithFacebook()
            .then((user) => {
                return this.accountService.setAccount(user)
                    .then(() => {
                        return user;
                    });
            });
    }

    public requestResetPasswordTask(email: string): Promise<any> {
        return this.muranoApiService.requestResetPassword(email);
    }

    public logoutTask(): Promise<any> {
        return this.muranoApiService.disconnectWebsocket()
            .then(() => this.databaseService.deleteStorage())
            .then(() => this.accountService.getAccount())
            .then(user => this.muranoApiService.logout(user))
            .then(() => this.accountService.logout());
    }

    public queryDeviceInfoTask(): Promise<any> {
        return this.muranoApiService.queryDeviceInfo();
    }

    public queryDeviceStatusTask(): Promise<any> {
        return this.muranoApiService.queryDeviceStatus();
    }

    public fireApModeTask(ssid: string, password: string, security: string,
        url: string, provToken: string, updatePeriod: string, provisionType?: string): Promise<any> {
        return this.muranoApiService.fireApMode(ssid, password, security, url, provToken, updatePeriod, provisionType);
    }

    public getFirmwareList(model?: string | Array<string>): Promise<any> {
        return this.muranoApiService.getFirmwareList(model);
    }

    public refreshDevicesTask(devices?: Array<string>): Promise<any> {
        return this.databaseService.refreshDevices(devices);
    }

    public filterDevicesTask(filters?): Promise<any> {
        return this.databaseService.filterDevices(filters);
    }

    public refreshGroupsTask(groups?: Array<string>): Promise<any> {
        return this.databaseService.refreshGroups(groups);
    }

    public filterGroupsTask(filters?): Promise<any> {
        return this.databaseService.filterGroups(filters);
    }

    public wsRequestLoginTask(): Promise<any> {
        return this.muranoApiService.websocketLogin();
    }

    public wsRequestProvisionTokenTask(ttl?: number): Promise<any> {
        return this.muranoApiService.requestProvisionToken(ttl)
            .then(({ res }) => this.accountService.setProvisionToken(res.data));
    }

    public wsRequestGetMeTask(): Promise<any> {
        return this.muranoApiService.requestGetMe()
            .then(({ res }) => this.accountService.setUserMe(res.data));
    }

    public wsRequestConfigTask(sn: string, config: any): Promise<any> {
        return this.muranoApiService.requestConfig(sn, config)
            .then(() => {
                return this.databaseService.createDevice(sn);
            })
            .then(() => {
                return this.databaseService.deviceUpdateConfig(sn, config);
            });
    }

    public wsRequestSetTask(sn: string, command: Object): Promise<any> {
        return this.muranoApiService.requestSet(sn, command)
            .then(() => {
                return this.databaseService.deviceUpdateStatus(sn, command);
            });
    }

    public wsRequestGetTask(sn: string): Promise<any> {
        return this.muranoApiService.requestGet(sn)
            .then(({ res }) => {
                return this.databaseService.updateDevice(res.data);
            });
    }

    public wsRequestOtaTask(sn: string, url: string, sha1: string, firmwareVersion: string): Promise<any> {
        return this.muranoApiService.requestOta(sn, url, sha1, firmwareVersion);
    }

    public wsRequestCalendarTask(sn: string, calendar: Array<Schedule>): Promise<any> {
        return this.muranoApiService.requestCalendar(sn, calendar)
            .then(() => {
                return this.databaseService.deviceUpdateCalendar(sn, calendar);
            });
    }

    public wsRequestAddUserTask(sn: string, user: User): Promise<any> {
        return this.muranoApiService.requestAddUser(sn, user)
            .then(() => {
                return this.databaseService.deviceAddUser(sn, user);
            });
    }

    public wsRequestAddSharingDeviceTask(token: string): Promise<any> {
        return this.muranoApiService.requestAddSharingDevice(token);
    }

    public wsRequestGetSharingTokenTask(sn: string, userRole: UserRole): Promise<any> {
        return this.muranoApiService.requestGetSharingToken(sn, userRole);
    }

    public wsRequestRemoveUserTask(sn: string, email: string): Promise<any> {
        return this.muranoApiService.requestRemoveUser(sn, email)
            .then(() => {
                return this.databaseService.deviceRemoveUser(sn, email);
            });
    }

    public wsRequestListUserTask(sn: string): Promise<any> {
        return this.muranoApiService.requestListUser(sn)
            .then(({ res }) => {
                return this.databaseService.deviceUpdateUserList(sn, res.data);
            });
    }

    public wsRequestListDeviceTask(): Promise<any> {
        return this.muranoApiService.requestListDevice()
            .then(({ res }) => {
                return this.databaseService.updateDeviceList(res.data);
            });
    }

    public wsRequestSetPropertiesTask(sn: string, properties: Object): Promise<any> {
        return this.muranoApiService.requestSetProperties(sn, properties)
            .then(() => {
                return this.databaseService.deviceUpdateProperties(sn, properties);
            });
    }

    public wsRequestDeletePropertiesTask(sn: string, properties: Array<string>): Promise<any> {
        return this.muranoApiService.requestDeleteProperties(sn, properties)
            .then(() => {
                return this.databaseService.deviceDeleteProperties(sn, properties);
            });
    }

    public wsRequestDeleteDeviceTask(sn: string): Promise<any> {
        return this.muranoApiService.requestDeleteDevice(sn)
            .then(() => {
                return this.databaseService.deleteDevice(sn);
            });
    }

    public wsRequestSetGroupTask(group: Group): Promise<any> {
        return this.muranoApiService.requestSetGroup(group)
            .then(() => {
                return this.databaseService.setGroup(group);
            });
    }

    public wsRequestGetGroupTask(name: string): Promise<any> {
        return this.muranoApiService.requestGetGroup(name)
            .then(({ res }) => {
                return this.databaseService.setGroup(res.data);
            });
    }

    public wsRequestDeleteGroupTask(name: string): Promise<any> {
        return this.muranoApiService.requestDeleteGroup(name)
            .then(() => {
                return this.databaseService.deleteGroup(name);
            });
    }

    public wsRequestListGroupTask(): Promise<any> {
        return this.muranoApiService.requestListGroup()
            .then(({ res }) => {
                return this.databaseService.updateGroupList(res.data);
            });
    }

    public wsRequestSetUserDataTask(userData: Object): Promise<any> {
        return this.muranoApiService.requestSetUserData(userData)
            .then(() => {
                return this.accountService.mergeUserData(userData);
            });
    }

    public wsRequestDeleteUserData(userDataKeys: Array<string>): Promise<any> {
        return this.muranoApiService.requestDeleteUserData(userDataKeys)
            .then(() => {
                return this.accountService.deleteUserDataByKeys(userDataKeys);
            });
    }

    public wsRequestGetUserDataTask(): Promise<any> {
        return this.muranoApiService.requestGetUserData()
            .then(({ res }) => {
                return this.accountService.setUserData(res.data);
            });
    }

    public wsEventTokenExpiredTask(wsEvent: WebsocketEvent): Promise<any> {
        return Promise.resolve();
    }

    public wsEventDeviceChangeTask(wsEvent: WebsocketEvent): Promise<any> {
        let sn = wsEvent.data.device;
        let changes = wsEvent.data.changes;
        let status = changes.status,
            profile = changes.profile,
            users = changes.users,
            properties = changes.properties,
            connected = changes.connected,
            deviceState = changes.device_state;

        return this.databaseService.deviceUpdateStatus(sn, status)
            .then(() => {
                return this.databaseService.deviceUpdateProfile(sn, profile);
            })
            .then(() => {
                return this.databaseService.deviceUpdateUserList(sn, users);
            })
            .then(() => {
                return this.databaseService.deviceUpdateProperties(sn, properties);
            })
            .then(() => {
                return this.databaseService.deviceUpdateConnectionState(sn, connected);
            })
            .then(() => {
                return this.databaseService.deviceUpdateDeviceState(sn, deviceState);
            })
            .then(() => {
                return sn;
            });
    }

    public wsEventAddDeviceTask(wsEvent: WebsocketEvent): Promise<any> {
        let { device, owner } = wsEvent.data;

        return this.databaseService.createDeviceWithOwner(device, owner)
            .then(() => {
                return this.wsRequestGetTask(device);
            })
            .then(() => {
                return device;
            });
    }

    public wsEventDeleteDeviceTask(wsEvent: WebsocketEvent): Promise<any> {
        let { device, owner } = wsEvent.data;

        return this.databaseService.deleteDeviceWithOwner(device, owner)
            .then(() => {
                return device;
            });
    }

    public wsEventSetGroupTask(wsEvent: WebsocketEvent): Promise<any> {
        return this.databaseService.setGroup(wsEvent.data)
            .then(() => {
                return wsEvent.data.name;
            });
    }

    public wsEventDeleteGroupTask(wsEvent: WebsocketEvent): Promise<any> {
        let { name } = wsEvent.data;

        return this.databaseService.deleteGroup(name)
            .then(() => {
                return name;
            });
    }

    public wsEventCalendarTask(wsEvent: WebsocketEvent): Promise<any> {
        let { device, schedules } = wsEvent.data;

        return this.databaseService.deviceUpdateCalendar(device, schedules)
            .then(() => {
                return device;
            });
    }

    public wsEventUserDataChangeTask(wsEvent: WebsocketEvent): Promise<any> {
        let newUserData = wsEvent.data;

        return this.accountService.mergeUserData(newUserData)
            .then(() => {
                return newUserData;
            });
    }

    public requestAuthorizeTask(): Promise<any> {
        let account;
        return this.accountService.getAccount()
            .then((user) => {
                account = user;
                return this.accountService.getPassword(user);
            })
            .then((password) => {
                let token = btoa(account.account + ':' + password);
                return this.muranoApiService.requestAuthorize(token);
            })
    }

    public getByAuthTask(): Promise<any> {
        let account;
        return this.accountService.getAccount()
            .then((user) => {
                account = user;
                return this.accountService.getPassword(user);
            })
            .then((password) => {
                let token = btoa(account.account + ':' + password);
                return this.muranoApiService.getByAuth(token);
            })
    }

    public getTokenTask(): Promise<string> {
        let account;
        return this.accountService.getAccount()
            .then((user) => {
                account = user;
                return this.accountService.getPassword(user);
            })
            .then((password) => {
                return "Basic " + btoa(account.account + ':' + password);
            })
    }

    public historyByAuthTask(uuid: string, from: number, to: number, group: number): Promise<any> {
        let account;
        return this.accountService.getAccount()
            .then((user) => {
                account = user;
                return this.accountService.getPassword(user);
            })
            .then((password) => {
                let token = btoa(account.account + ':' + password);
                return this.muranoApiService.historyByAuth(token, uuid, from, to, group);
            })
    }

    public saveByAuthTask(uuid: string, alias: string): Promise<any> {
        let account;
        return this.accountService.getAccount()
            .then((user) => {
                account = user;
                return this.accountService.getPassword(user);
            })
            .then((password) => {
                let token = btoa(account.account + ':' + password);
                return this.muranoApiService.saveByAuth(token, uuid, alias);
            })
    }

    public saveByAuthLimitTask(uuid: string, alias: string): Promise<any> {
        let account;
        return this.accountService.getAccount()
            .then((user) => {
                account = user;
                return this.accountService.getPassword(user);
            })
            .then((password) => {
                let token = btoa(account.account + ':' + password);
                return this.muranoApiService.saveByAuthLimit(token, uuid, alias);
            })
    }

    public deleteByAuthTask(uuid: string): Promise<any> {
        let account;
        return this.accountService.getAccount()
            .then((user) => {
                account = user;
                return this.accountService.getPassword(user);
            })
            .then((password) => {
                let token = btoa(account.account + ':' + password);
                return this.muranoApiService.deleteByAuth(token, uuid);
            })
    }

    public postRawTask(accessToken: string, data: string): Promise<any> {
        return this.muranoApiService.postRaw(accessToken, data);
    }
}
