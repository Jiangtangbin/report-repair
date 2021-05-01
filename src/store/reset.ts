/* 退出重置 store
----------------------- */
import { appModule, userModule, socketModule } from './index';

export default function resetStore() {
    // appModule.alterState({ key: 'checkedSize', value: 'normal' });
    appModule.alterState({ key: 'fromInfo', value: { url: '', secret: '', token: '' }});
    appModule.alterState({ key: 'isLogin', value: false });
    appModule.updateCacheRoute([]);
    userModule.resetUser();
    userModule.alterDict();
    userModule.senseTypeChange({});
    userModule.alterCustomDict();
    socketModule.alterState({ key: 'alarms', value: [] });
    socketModule.alterState({ key: 'checks', value: [] });
    socketModule.alterState({ key: 'checktasks', value: [] });
    socketModule.alterState({ key: 'notices', value: [] });
    socketModule.alterState({ key: 'user', value: [] });
    socketModule.alterState({ key: 'worktask', value: [] });
}
