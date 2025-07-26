import { Capacitor } from "@capacitor/core";
import { SecureStoragePlugin } from "capacitor-secure-storage-plugin";

export namespace SecureStorage {
    export async function get(key: string) {
        try {
            return await SecureStoragePlugin.get({ key }).then(({ value }) => value);
        }
        catch {
            return new Promise<null>((res) => res(null));
        }
    }

    export async function set(key: string, value: string) {
        return await SecureStoragePlugin.set({ key, value }).then(({ value }) => value);
    }

    export async function remove(key: string) {
        try {
            return await SecureStoragePlugin.remove({ key }).then(({ value }) => value);
        }
        catch {
            return false;
        }
    }

    export async function clear() {
        try {
            return await SecureStoragePlugin.clear().then(({ value }) => value);
        }
        catch {
            return false;
        }
    }

    export async function keys() {
        return await SecureStoragePlugin.keys().then(({ value }) => value);
    }

    export async function getPlatform() {
        return await SecureStoragePlugin.getPlatform().then(({ value }) => value);
    }
}

if (Capacitor.getPlatform() === "web") {
    //@ts-expect-error
    window.SecureStorage = SecureStorage;
}