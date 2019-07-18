import findLastIndex from 'lodash/findLastIndex';
import {
    errorLog,
} from '~utils/log';
import userModel from '~database/models/user';
import fetchNoteFromServer from './utils/fetchNoteFromServer';
import addNote from './utils/addNote';

class SyncService {
    constructor() {
        this.accounts = new Map();
        this.config = {
            notesPerRequest: 10,
        };
    }

    set(config) {
        Object.keys(this.config)
            .forEach((key) => {
                if (config[key] !== undefined) {
                    this.config[key] = config[key];
                }
            });
    }

    async syncNotes({
        address,
        excludes = [],
        lastSynced = '',
    } = {}) {
        const account = this.accounts.get(address);
        if (!account) return;

        const {
            notesPerRequest,
        } = this.config;
        this.accounts.set(address, {
            ...account,
            syncing: true,
        });

        const newNotes = await fetchNoteFromServer({
            lastSynced,
            excludes,
            account: address,
            numberOfNotes: notesPerRequest,
        });
        console.log('syncNotes', newNotes);

        await Promise.all(newNotes.map(note => addNote(note)));

        const lastNote = newNotes[newNotes.length - 1];
        if (newNotes.length === notesPerRequest) {
            const nextSynced = lastNote.timestamp;
            let nextExcludes = [];
            if (nextSynced === lastSynced) {
                nextExcludes = [
                    ...excludes,
                ];
            }
            findLastIndex(newNotes, ({
                hash,
                timestamp,
            }) => {
                const isSameTime = timestamp === nextSynced;
                if (isSameTime) {
                    nextExcludes.push(hash);
                }
                return !isSameTime;
            });
            console.log('nextExcludes', nextExcludes);
            await this.syncNotes({
                address,
                excludes: nextExcludes,
                lastSynced: nextSynced,
            });
        }

        await userModel.update({
            address,
            lastSynced: Date.now(),
        });

        this.accounts.set(address, {
            ...account,
            syncing: false,
        });
    }

    async syncAccount(address) {
        if (!address) {
            errorLog("'address' can not be empty in SyncService.syncAccount(address)");
            return;
        }

        const user = await userModel.get({
            address,
        });
        if (!user) {
            errorLog(`Account '${address}' has no permission to sync notes from graph node server`);
            return;
        }

        let account = this.accounts.get(address);
        if (!account) {
            account = {
                syncing: false,
            };
            this.accounts.set(address, account);
        }

        if (!account.syncing) {
            await this.syncNotes({
                address,
                lastSynced: (user.lastSynced || 0) + 1,
            });
        }
    }
}

export default new SyncService();