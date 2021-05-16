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
        city: CustomDictFormat<'city', 'city', IResponse<API.Response['CityArea']>>;
        area: CustomDictFormat<'area', 'area', IResponse<API.Response['CityArea']>>;
        role: CustomDictFormat<'role', 'role', IResponse<API.Response['Rule']>>;
        menus: CustomDictFormat<'menus', never, IResponse<API.Response['LoginInfo']['auth']>>;
    }
    type CustomDictsKey = CustomDicts[keyof CustomDicts]['type'];
    type CustomDictsValue = CustomDicts[keyof CustomDicts]['params'];
}