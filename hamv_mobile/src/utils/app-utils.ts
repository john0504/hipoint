import { Device, Group } from 'app-engine';
import includes from 'lodash/includes';

export class AppUtils {

  public static isOwner(device: Device, account: string): boolean {
    if (device && account && Array.isArray(device.users)) {
      return device.users.some(user => user.email && user.email.toLocaleLowerCase() === account.toLocaleLowerCase() && user.role === 'owner');
    }
    return false;
  }

  public static isDeviceOnline(device: Device): boolean {
    return device && device.connected === 1;
  }

  public static isDeviceUpdate(device: Device): boolean {
    return device && device.deviceState === "updating";
  }

  public static isSupported(device: Device, saa: string) {
    return device && device.fields && includes(device.fields, saa);
  }

  public static compareDevice(a: Device, b: Device): number {
    let aName = '';
    if (a && a.properties && a.properties.displayName) {
      aName = a.properties.displayName;
    } else if (a && a.profile && a.profile.esh && a.profile.esh.model) {
      aName = a.profile.esh.model;
    }
    let bName = '';
    if (b && b.properties && b.properties.displayName) {
      bName = b.properties.displayName;
    } else if (b && b.profile && b.profile.esh && b.profile.esh.model) {
      bName = b.profile.esh.model;
    }
    return aName.localeCompare(bName);
  }

  public static compareGroup(a: Group, b: Group): number {
    let aName = '';
    if (a && a.properties && a.properties.displayName) {
      aName = a.properties.displayName;
    }
    let bName = '';
    if (b && b.properties && b.properties.displayName) {
      bName = b.properties.displayName;
    }
    return aName.localeCompare(bName);
  }

  public static compareWifiSignalStrength(a, b): number {
    if (!(a && a.dbm)) return 1;
    if (!(b && b.dbm)) return -1;
    return -(a.dbm - b.dbm);
  }
}
