declare namespace GlobalCustomDicts {
    // 自定义字典允许的格式
    interface CustomDictFormat<T, P, R> {
        type: T;
        params: P;
        response: R;
    }
    // 自定义字典允许的类型
    type CustomDicts = {
        dict: CustomDictFormat<'dict', number, IResponse<API.Response['Dict']>>;
        unit: CustomDictFormat<'unit', 'A' | 'B' | 'E', IResponse<API.Response['BasicDataTree']>>;
        role: CustomDictFormat<'role', 'role', IResponse<API.Response['Rule']>>;
        work_type: CustomDictFormat<'work_type', 'work_type', IResponse<API.Response['WorkServiceFault']>>;
        menus: CustomDictFormat<'menus', never, IResponse<API.Response['LoginInfo']['auth']>>;
    }
    type CustomDictsKey = CustomDicts[keyof CustomDicts]['type'];
    type CustomDictsValue = CustomDicts[keyof CustomDicts]['params'];
}