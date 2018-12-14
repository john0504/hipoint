import { Injectable } from '@angular/core';
import { NgRedux } from '@angular-redux/store';

import { AppActions } from '../actions/app-actions';

import { Account } from '../../core/models/account';
import { AppEngine } from '../../core/app-engine';
import { User, UserRole } from '../../core/models/device';
import { Schedule } from '../../core/models/schedule';
import { Group } from '../../core/models/group';
import { AuthError } from '../../core/errors/auth-error';

@Injectable()
export class AppTasks {

    constructor(
        private ngRedux: NgRedux<any>,
        private appEngine: AppEngine,
    ) {
    }

    private dispatch(action) {
        this.ngRedux.dispatch(action);
    }

    public getAccountTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.GET_ACCOUNT));

        return this.appEngine.getAccount()
            .then((account) => {
                this.dispatch(AppActions.action(AppActions.GET_ACCOUNT_DONE, account));
                return account;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.GET_ACCOUNT_DONE, error, true));
                throw error;
            });
    }

    public setAccountTask(account: Account): Promise<any> {
        this.dispatch(AppActions.action(AppActions.SET_ACCOUNT));

        return this.appEngine.setAccount(account)
            .then((account) => {
                this.dispatch(AppActions.action(AppActions.SET_ACCOUNT_DONE, account));
                return account;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.SET_ACCOUNT_DONE, error, true));
                throw error;
            });
    }

    public getUserDataTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.GET_USER_DATA));

        return this.appEngine.getUserData()
            .then((userData) => {
                this.dispatch(AppActions.action(AppActions.GET_USER_DATA_DONE, userData));
                return userData;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.GET_USER_DATA_DONE, error, true));
                throw error;
            });
    }

    public setUserDataTask(userData: Object): Promise<any> {
        this.dispatch(AppActions.action(AppActions.SET_USER_DATA));

        return this.appEngine.setUserData(userData)
            .then((userData) => {
                this.dispatch(AppActions.action(AppActions.SET_USER_DATA_DONE, userData));
                return userData;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.SET_USER_DATA_DONE, error, true));
                throw error;
            });
    }

    public getUserMeTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.GET_USER_ME));

        return this.appEngine.getUserMe()
            .then((me) => {
                this.dispatch(AppActions.action(AppActions.GET_USER_ME_DONE, me));
                return me;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.GET_USER_ME_DONE, error, true));
                throw error;
            });
    }

    public setUserMeTask(me: Object): Promise<any> {
        this.dispatch(AppActions.action(AppActions.SET_USER_ME));

        return this.appEngine.setUserMe(me)
            .then((me) => {
                this.dispatch(AppActions.action(AppActions.SET_USER_ME_DONE, me));
                return me;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.SET_USER_ME_DONE, error, true));
                throw error;
            });
    }

    public registerTask(account: string, password: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.REGISTER, { account, password }));

        return this.appEngine.register(account, password)
            .then((user) => {
                this.dispatch(AppActions.action(AppActions.REGISTER_DONE, user));
                return user;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.REGISTER_DONE, error, true));
                throw error;
            });
    }

    public sessionTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.SESSION));

        return this.appEngine.session()
            .then((user) => {
                this.dispatch(AppActions.action(AppActions.SESSION_DONE, user));
                return user;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.SESSION_DONE, error, true));
                throw error;
            });
    }

    public refreshTokenTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.REFRESH_TOKEN));

        return this.appEngine.refreshToken()
            .then((user) => {
                this.dispatch(AppActions.action(AppActions.REFRESH_TOKEN_DONE, user));
                return user;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.REFRESH_TOKEN_DONE, error, true));
                throw error;
            });
    }

    public loginTask(account: string, password: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.LOGIN, { account, password }));

        return this.appEngine.login(account, password)
            .then((user) => {
                this.dispatch(AppActions.action(AppActions.LOGIN_DONE, user));
                return user;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.LOGIN_DONE, error, true));
                throw error;
            });
    }

    public loginWithFacebookTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.LOGIN_WITH_FB));

        return this.appEngine.loginWithFacebook()
            .then((user) => {
                this.dispatch(AppActions.action(AppActions.LOGIN_WITH_FB_DONE, user));
                return user;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.LOGIN_WITH_FB_DONE, error, true));
                throw error;
            });
    }

    public requestResetPasswordTask(email: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.REQUEST_RESET_PASSWORD, { email }));

        return this.appEngine.requestResetPassword(email)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.REQUEST_RESET_PASSWORD_DONE));
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.REQUEST_RESET_PASSWORD_DONE, error, true));
                throw error;
            });
    }

    public logoutTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.LOGOUT));

        return this.appEngine.logout()
            .then((user) => {
                this.dispatch(AppActions.action(AppActions.LOGOUT_DONE, user));
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.LOGOUT_DONE, error, true));
                throw error;
            });
    }

    public queryDeviceInfoTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.QUERY_DEVICE_INFO));

        return this.appEngine.queryDeviceInfo()
            .then((deviceInfo) => {
                this.dispatch(AppActions.action(AppActions.QUERY_DEVICE_INFO_DONE, deviceInfo));
                return deviceInfo;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.QUERY_DEVICE_INFO_DONE, error, true));
                throw error;
            });
    }

    public queryDeviceStatusTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.QUERY_DEVICE_STATUS));

        return this.appEngine.queryDeviceStatus()
            .then((deviceStatus) => {
                this.dispatch(AppActions.action(AppActions.QUERY_DEVICE_STATUS_DONE, deviceStatus));
                return deviceStatus;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.QUERY_DEVICE_STATUS_DONE, error, true));
                throw error;
            });
    }

    public fireApModeTask(ssid: string, password: string, security: string,
        url: string, provToken: string, updatePeriod: string, provisionType?: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.FIRE_AP_MODE));

        return this.appEngine.fireApMode(ssid, password, security, url, provToken, updatePeriod, provisionType)
            .then((result) => {
                this.dispatch(AppActions.action(AppActions.FIRE_AP_MODE_DONE, result));
                return result;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.FIRE_AP_MODE_DONE, error, true));
                throw error;
            });
    }

    public getFirmwareList(model?: string | Array<string>): Promise<any> {
        this.dispatch(AppActions.action(AppActions.GET_FIRMWARE_LIST));

        return this.appEngine.getFirmwareList(model)
            .then((result) => {
                this.dispatch(AppActions.action(AppActions.GET_FIRMWARE_LIST_DONE, result));
                return result;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.GET_FIRMWARE_LIST_DONE, error, true));
                throw error;
            });
    }

    public refreshDevicesTask(devices?: Array<string>): Promise<any> {
        this.dispatch(AppActions.action(AppActions.REFRESH_DEVICES));

        return this.appEngine.refreshDevices(devices)
            .then((result) => {
                this.dispatch(AppActions.action(AppActions.REFRESH_DEVICES_DONE, result));
                return result;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.REFRESH_DEVICES_DONE, error, true));
                throw error;
            });
    }

    public filterDevicesTask(filters?): Promise<any> {
        this.dispatch(AppActions.action(AppActions.FILTER_DEVICES));

        return this.appEngine.filterDevices(filters)
            .then((result) => {
                this.dispatch(AppActions.action(AppActions.FILTER_DEVICES_DONE, result));
                return result;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.FILTER_DEVICES_DONE, error, true));
                throw error;
            });
    }

    public refreshGroupsTask(groups?: Array<string>): Promise<any> {
        this.dispatch(AppActions.action(AppActions.REFRESH_GROUPS));

        return this.appEngine.refreshGroups(groups)
            .then((result) => {
                this.dispatch(AppActions.action(AppActions.REFRESH_GROUPS_DONE, result));
                return result;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.REFRESH_GROUPS_DONE, error, true));
                throw error;
            });
    }

    public filterGroupsTask(filters?): Promise<any> {
        this.dispatch(AppActions.action(AppActions.FILTER_GROUPS));

        return this.appEngine.filterGroups(filters)
            .then((result) => {
                this.dispatch(AppActions.action(AppActions.FILTER_GROUPS_DONE, result));
                return result;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.FILTER_GROUPS_DONE, error, true));
                throw error;
            });
    }

    public startWatchDnssdTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.DNSSD_WATCH));

        return this.appEngine.watchDnssd()
            .then(() => {
                this.dispatch(AppActions.action(AppActions.DNSSD_WATCH_DONE));
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.DNSSD_WATCH_DONE, error, true));
                throw error;
            });
    }

    public stopWatchDnssdTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.DNSSD_UNWATCH));

        return this.appEngine.unwatchDnssd()
            .then(() => {
                this.dispatch(AppActions.action(AppActions.DNSSD_UNWATCH_DONE));
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.DNSSD_UNWATCH_DONE, error, true));
                throw error;
            });
    }

    public wsRequestLoginTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_LOGIN));

        return this.appEngine.websocketLogin()
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_LOGIN_DONE));
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_LOGIN_DONE, error, true));
                //if murano can support return custom close code, should remove
                if (error instanceof AuthError) {
                    this.ngRedux.dispatch(AppActions.action(AppActions.WS_TOKEN_EXPIRED));
                }
                throw error;
            });
    }

    public wsRequestProvisionTokenTask(ttl?: number): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_PROVISION_TOKEN));

        return this.appEngine.requestProvisionToken(ttl)
            .then((user) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_PROVISION_TOKEN_DONE, user));
                return user;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_PROVISION_TOKEN_DONE, error, true));
                throw error;
            });
    }

    public wsRequestGetMeTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_ME));

        return this.appEngine.requestGetMe()
            .then((userInfo) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_ME_DONE, userInfo));
                return userInfo;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_ME_DONE, error, true));
                throw error;
            });
    }

    public requestConfigTask(sn: string, config: any): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_INIT));

        return this.appEngine.requestConfig(sn, config)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_INIT_DONE, { sn }));
                this.refreshDevicesTask([sn]);
                this.filterDevicesTask();
                this.wsRequestGetTask(sn);
                return { sn };
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_INIT_DONE, error, true));
                throw error;
            });
    }

    public wsRequestSetTask(sn: string, commands: Object): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET));

        return this.appEngine.requestSet(sn, commands)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_DONE, { sn, commands }));
                this.refreshDevicesTask([sn]);
                return { sn, commands };
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_DONE, error, true));
                throw error;
            });
    }

    public wsRequestGetTask(sn: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET));

        return this.appEngine.requestGet(sn)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_DONE, { sn }));
                this.refreshDevicesTask([sn]);
                return { sn };
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_DONE, error, true));
                throw error;
            });
    }

    public wsRequestOtaTask(sn: string, url: string, sha1: string, firmwareVersion: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_OTA));

        return this.appEngine.requestOta(sn, url, sha1, firmwareVersion)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_OTA_DONE));
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_OTA_DONE, error, true));
                throw error;
            });
    }

    public wsRequestCalendarTask(sn: string, calendar: Array<Schedule>): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_CALENDAR));

        return this.appEngine.requestCalendar(sn, calendar)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_CALENDAR_DONE, { sn, calendar }));
                this.refreshDevicesTask([sn]);
                return { sn, calendar };
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_CALENDAR_DONE, error, true));
                throw error;
            });
    }

    public wsRequestAddUserTask(sn: string, user: User): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_ADD_USER));

        return this.appEngine.requestAddUser(sn, user)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_ADD_USER_DONE, { sn, user }));
                this.refreshDevicesTask([sn]);
                return { sn, user };
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_ADD_USER_DONE, error, true));
                throw error;
            });
    }

    public wsRequestAddSharingDeviceTask(token: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_ADD_SHARING_DEVICE));

        return this.appEngine.requestAddSharingDevice(token)
            .then((result) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_ADD_SHARING_DEVICE_DONE, { token }));
                return result.res.data;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_ADD_SHARING_DEVICE_DONE, error, true));
                throw error;
            });
    }

    public wsRequestGetSharingTokenTask(sn: string, userRole: UserRole): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_SHARING_TOKEN));

        return this.appEngine.requestGetSharingToken(sn, userRole)
            .then((result) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_SHARING_TOKEN_DONE, { sn, userRole }));
                return result.res.data;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_SHARING_TOKEN_DONE, error, true));
                throw error;
            });
    }

    public wsRequestRemoveUserTask(sn: string, email: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_REMOVE_USER));

        return this.appEngine.requestRemoveUser(sn, email)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_REMOVE_USER_DONE, { sn, email }));
                this.refreshDevicesTask([sn]);
                return { sn, email };
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_REMOVE_USER_DONE, error, true));
                throw error;
            });
    }

    public wsRequestListUserTask(sn: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_USER));

        return this.appEngine.requestListUser(sn)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_USER_DONE));
                this.refreshDevicesTask([sn]);
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_USER_DONE, error, true));
                throw error;
            });
    }

    public wsRequestListDeviceTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_DEVICE));

        return this.appEngine.requestListDevice()
            .then((snArray) => {
                if (snArray && snArray.length > 0) {
                    snArray.forEach((sn) => {
                        this.wsRequestGetTask(sn);
                    });
                }
            })
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_DEVICE_DONE));
                this.refreshDevicesTask();
                this.filterDevicesTask();
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_DEVICE_DONE, error, true));
                throw error;
            });
    }

    public wsRequestSetPropertiesTask(sn: string, properties: Object): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES, { sn, properties }));

        return this.appEngine.requestSetProperties(sn, properties)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES_DONE, { sn, properties }));
                this.refreshDevicesTask([sn]);
                return { sn, properties };
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_PROPERTIES_DONE, error, true));
                this.refreshDevicesTask([sn]);
                throw error;
            });
    }


    public wsRequestDeletePropertiesTask(sn: string, properties: Array<string>): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_PROPERTIES, { sn, properties }));

        return this.appEngine.requestDeleteProperties(sn, properties)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_PROPERTIES_DONE, { sn, properties }));
                this.refreshDevicesTask([sn]);
                return { sn, properties };
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_PROPERTIES_DONE, error, true));
                this.refreshDevicesTask([sn]);
                throw error;
            });
    }

    public wsRequestDeleteDeviceTask(sn: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_DEVICE));

        return this.appEngine.requestDeleteDevice(sn)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_DEVICE_DONE, sn));
                setTimeout(() => {
                    this.refreshDevicesTask();
                    this.filterDevicesTask();
                }, 500);
                return sn;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_DEVICE_DONE, error, true));
                throw error;
            });
    }

    public wsRequestSetGroupTask(group: Group): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_GROUP, group));

        return this.appEngine.requestSetGroup(group)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_GROUP_DONE, group));
                this.filterGroupsTask();
                this.refreshGroupsTask([group.name]);
                return group;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_GROUP_DONE, error, true));
                this.filterGroupsTask();
                throw error;
            });
    }

    public wsRequestGetGroupTask(name: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_GROUP));

        return this.appEngine.requestGetGroup(name)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_GROUP_DONE, name));
                this.refreshGroupsTask([name]);
                return name;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_GROUP_DONE, error, true));
                throw error;
            });
    }

    public wsRequestDeleteGroupTask(name: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_GROUP));

        return this.appEngine.requestDeleteGroup(name)
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_GROUP_DONE, name));
                this.refreshGroupsTask();
                this.filterGroupsTask();
                return name;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_GROUP_DONE, error, true));
                throw error;
            });
    }

    public wsRequestListGroupTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_GROUP));

        return this.appEngine.requestListGroup()
            .then((groupIdArray) => {
                if (groupIdArray && groupIdArray.length > 0) {
                    groupIdArray.forEach((groupId) => {
                        this.wsRequestGetGroupTask(groupId);
                    });
                }
            })
            .then(() => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_GROUP_DONE));
                this.refreshGroupsTask();
                this.filterGroupsTask();
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_LIST_GROUP_DONE, error, true));
                throw error;
            });
    }

    public wsRequestSetUserDataTask(userData: Object): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_USER_DATA));

        return this.appEngine.requestSetUserData(userData)
            .then((newUserData) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_USER_DATA_DONE, newUserData));
                return newUserData;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_SET_USER_DATA_DONE, error, true));
                throw error;
            });
    }

    public wsRequestDeleteUserDataTask(keys: Array<string>): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_USER_DATA));

        return this.appEngine.requestDeleteUserData(keys)
            .then((newUserData) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_USER_DATA_DONE, newUserData));
                return newUserData;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_DELETE_USER_DATA_DONE, error, true));
                throw error;
            });
    }

    public wsRequestGetUserDataTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_USER_DATA));

        return this.appEngine.requestGetUserData()
            .then((newUserData) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_USER_DATA_DONE, newUserData));
                return newUserData;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.WS_REQUEST_GET_USER_DATA_DONE, error, true));
                throw error;
            });
    }

    public requestAuthorizeTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.REQUEST_AUTHORIZE));

        return this.appEngine.requestAuthorize()
            .then((accessToken) => {
                this.dispatch(AppActions.action(AppActions.REQUEST_AUTHORIZE_DONE, accessToken));
                return accessToken;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.REQUEST_AUTHORIZE_DONE, error, true));
                throw error;
            });
    }

    public getByAuthTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.GET_BY_AUTH));

        return this.appEngine.getByAuth()
            .then((list) => {
                this.dispatch(AppActions.action(AppActions.GET_BY_AUTH_DONE, list));
                return list;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.GET_BY_AUTH_DONE, error, true));
                throw error;
            });
    }

    public getTokenTask(): Promise<any> {
        this.dispatch(AppActions.action(AppActions.GET_TOKEN));

        return this.appEngine.getToken()
            .then((token) => {
                this.dispatch(AppActions.action(AppActions.GET_TOKEN_DONE, token));
                return token;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.GET_TOKEN_DONE, error, true));
                throw error;
            });
    }

    public historyByAuthTask(uuid: string, from: number, to: number, group: number): Promise<any> {
        this.dispatch(AppActions.action(AppActions.HISTORY_BY_AUTH));

        return this.appEngine.historyByAuth(uuid, from, to, group)
            .then((list) => {
                this.dispatch(AppActions.action(AppActions.HISTORY_BY_AUTH_DONE, list));
                return list;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.HISTORY_BY_AUTH_DONE, error, true));
                throw error;
            });
    }

    public saveByAuthTask(uuid: string, alias: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.SAVE_BY_AUTH));

        return this.appEngine.saveByAuth(uuid, alias)
            .then((list) => {
                this.dispatch(AppActions.action(AppActions.SAVE_BY_AUTH_DONE, list));
                return list;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.SAVE_BY_AUTH_DONE, error, true));
                throw error;
            });
    }

    public saveByAuthLimitTask(uuid: string, alias: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.SAVE_BY_AUTH_LIMIT));

        return this.appEngine.saveByAuthLimit(uuid, alias)
            .then((list) => {
                this.dispatch(AppActions.action(AppActions.SAVE_BY_AUTH_LIMIT_DONE, list));
                return list;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.SAVE_BY_AUTH_LIMIT_DONE, error, true));
                throw error;
            });
    }

    public deleteByAuthTask(uuid: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.DELETE_BY_AUTH));

        return this.appEngine.deleteByAuth(uuid)
            .then((list) => {
                this.dispatch(AppActions.action(AppActions.DELETE_BY_AUTH_DONE, list));
                return list;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.DELETE_BY_AUTH_DONE, error, true));
                throw error;
            });
    }

    public postRawTask(accessToken: string, data: string): Promise<any> {
        this.dispatch(AppActions.action(AppActions.POST_RAW));

        return this.appEngine.postRaw(accessToken, data)
            .then((rawData) => {
                this.dispatch(AppActions.action(AppActions.POST_RAW_DONE, rawData));
                return rawData;
            })
            .catch((error) => {
                this.dispatch(AppActions.action(AppActions.POST_RAW_DONE, error, true));
                throw error;
            });
    }
}
