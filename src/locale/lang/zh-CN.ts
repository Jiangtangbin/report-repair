// @ts-ignore
import messages from 'view-design/dist/locale/zh-CN';

export default {
    ...messages,
    h: {
        common: {
            none: '无',
            normal: '正常',
            large: '偏大',
            small: '偏小',
            noData: '无数据',
            unknown: '未知',
            year: '年',
            month: '月',
            day: '日',
            hours: '时',
            minutes: '分',
            second: '秒',
            success: '成功',
            fail: '失败',
            cancel: '取消',
            confirm: '确认',
            noPicture: '无图片',
            noRemark: '无备注',
            noDescription: '无描述',
            online: '在线',
            offline: '离线',
            type: '类型',
            send: '发送',
            copy: '复制',
            back: '返回',
            submit: '提交',
        },
        status: {
            online: '在线',
            offline: '离线',
            normal: '正常',
            enable: '启用',
            unable: '禁用',
            alarming: '报警中',
            disposed: '已处理',
            undisposed: '未处理',
            yes: '是',
            no: '否',
        },
        tips: {
            loggingIn: '正在登录，请稍后',
            loggedIn: '该账号已登录',
            forceLogin: '该用户已经在其它地方登录，是否强制登录',
            loginSuccess: '登录成功',
            modifiedSuccess: '修改成功',
            unknownError: '未知错误',
            tokenExpire: 'token 过期，请重新登录',
            accountAlreadyLogin: '该账号已在其它地方登录',
            accountPasswordModified: '该账号密码被修改',
            reLogin: '请重新登录',
            pageNoExist: '404 您要访问的页面不存在',
            copyNameAndComponents: '单击复制图标名称，双击复制组件',
            copyIconNameSuccess: '复制图标名称成功',
            copyIconNameError: '复制图标名称失败',
            copyComponentSuccess: '复制组件成功',
            copyComponentError: '复制组件失败',
            getIOSInstallPackageError: '获取 IOS 安装包失败',
            accountVerification: '用户名应介于 3-16 位之间',
            passwordVerification: '密码长度不能少于 6 位',
            mobileVerification: '请输入有效的手机号码',
            emailVerification: '请输入有效的邮箱',
            carNumberVerification: '请输入有效的车牌号',
            identifyVerification: '请输入有效的身份证',
            locationVerification: '请输入有效的经纬度',
            BreakTime: '断开时间',
            BreakNum: '断线次数',
            recoveryTime: '恢复时间',
            consumingTime: '重连耗时',
            communicationBreak: '实时通讯断开',
            communicationRecovery: '实时通讯已恢复',
            reconnect: '与平台实时通讯连接断开，每隔两秒进行重连',
            recovery: '与平台实时通讯连接已恢复',
            noFilterSelected: '未选择筛选条件',
            switchSucceeded: '切换语言成功',
            required: '该项为必填项，请选择数据',
            uploadError: '上传文件失败，请重试',
            recommendedSize: '建议上传尺寸为：1920 x 1080 的图片。',
            mapExistencePoint: '地图上已经存在该点',
            typeNothingnessMap: '该类型不存在于地图上',
            mapNothingnessPoint: '地图上不存在该标点',
            nothingnessType: '不存在该类型',
            pointNotInRange: '点未放置在离线地图上',
            displayPointError: '展示标点失败，请刷新页面后重试',
            addPointError: '添加标点失败，请刷新页面重试',
            mapNotLoading: '地图未加载成功，请刷新页面重试',
            notMarkerRequest: '未实现标点请求接口',
            fileAlready: '文件已存在',
            coverFile: '文件已存在，是否覆盖？',
            windowConfig: '请先选择窗口，配置窗口内容和音频输出，然后选择音频输出窗口！',
            clearConfigTitle: '清除配置内容',
            switchTemplate: '切换模板',
            clearConfigContent: '是否清除窗口中所有已配置的内容？',
            browserIncompatible: '您的浏览器不支持 video 标签，Internet Explorer 9+、Firefox、Opera、Chrome 以及 Safari 支持 video 标签！',
            formNotSelected: '表单 {msg} 未选择或输入时长！',
            configured: '已配置此模板的内容。切换后，此模板的内容将被清除！',
            getVideoDuration: '正在获取视频时长，请稍后！',
            getAudioDuration: '正在获取音频时长，请稍后！',
        },
        header: {
            returnHome: '返回首页',
            returnParent: '返回上级',
            logout: '退出登录',
            personal: '个人设置',
            inspectionTask: '巡检任务',
            workTask: '工单任务',
            menuName: '菜单名称',
        },
        tree: {
            auxiliaryOptions: '辅助选项',
            sizeClass: '大小类',
            grouping: '分组',
        },
        upload: {
            repeat: '文件：{msg}重复上传',
            maxNum: '文件上传数量不能超过{msg}份',
            formatTitle: '文件格式错误',
            formatDesc: '文件：{msg}上传的格式有误，请选择{format}格式上传',
            maxSizeTitle: '上传的文件超出规定的{msg}MB',
            maxSizeDesc: '文件：{msg}体积({size})过大',
        },
        camera: {
            hardwareProblems: '硬件问题',
            allowAccessTo: '请允许浏览器访问摄像头',
            notMediaType: '找不到满足请求参数的媒体类型',
            cannotAccess: '设备无法访问',
            deviceError: '设备错误',
            securityError: '安全错误',
            typeError: '类型错误',
            notSupportedError: '请通过 https 访问该网站',
            videoPlaybackError: '视频播放错误',
            videoCloseFail: '视频关闭失败',
            webCamera: '摄像头',
            cameraArea: '摄像头区域',
            previewArea: '预览区域',
            againScreenshot: '重新截取',
            screenshot: '截图',
        },
        tableButton: {
            batchOperation: '批量操作',
            doNotOperate: '禁止操作',
            selectAll: '全选',
            reverseSelect: '反选',
            open: '打开',
            close: '关闭',
            add: '添加',
            edit: '编辑',
            details: '详情',
            delete: '删除',
            upload: '上传',
            search: '搜索',
            refresh: '刷新',
            confirmDelete: '确认删除？',
            expandAll: '全部展开',
            shrinkAll: '全部收缩',
            selectAllChildren: '全选子级',
            distribution: '布点',
            distributeContent: '分配到设备',
            setDeviceContent: '设置设备内容',
            setGroupDevice: '设置分组设备',
            playVideo: '播放视频',
            playAudio: '播放音频',
            view: '预览配置',
            viewPicture: '查看图片',
            viewDistributeLog: '查看分配记录',
            viewDistributeResult: '查看分配结果',
        },
        table: {
            index: '序号',
            operation: '操作',
            name: '名称',
            code: '编码',
            description: '描述',
            accountNumber: '账号',
            mobile: '手机号码',
            roleName: '角色名称',
            customerName: '客户名称',
            parentName: '父级名称',
            customerCode: '客户编码',
            statusFilter: '状态筛选',
            plan: '平面图',
            auth: '权限',
            status: '状态',
            address: '地址',
            type: '类型',
            remark: '备注',
            serialNumber: '序列号',
            onlineOrOffline: '在线/离线',
            distance: '距离（米）',
            device: '设备',
            size: '大小',
            createdPeople: '创建人',
            createdTime: '创建时间',
            time: '时间',
            result: '结果',
            reason: '原因',
            operationLog: {
                operationObj: '操作对象',
                operationUser: '操作用户',
                implementOperation: '执行操作',
                operationTime: '操作时间',
                operationResult: '操作结果',
                errorCause: '失败原因',
            },
            deviceManage: {
                signalIntensity: '信号强度',
                electricityQuantity: '电量',
            },
            fileManage: {
                fileName: '文件名称',
                fileType: '文件类型',
                fileSize: '文件大小',
                filePath: '文件路径',
            },
            configManage: {
                configName: '配置名称',
                configContent: '配置内容',
            },
            distributeLogManage: {
                distributeType: '分配类型',
                distributeContent: '分配内容',
                distributeTime: '分配时间',
                distributePeople: '分配人',
                distributeDevice: '分配设备',
            },
        },
        page: {
            result: '共 {msg} 个结果',
        },
        chart: {
            easterly: '东风',
            southeasterly: '东南风',
            southeastEasterly: '东南偏东风',
            southeastSoutherly: '东南偏南风',
            northeasterly: '东北风',
            northeastEasterly: '东北偏东风',
            northeastNortherly: '东北偏北风',
            southerly: '南风',
            southwestSoutherly: '西南偏南风',
            southwesterly: '西南风',
            southwestWesterly: '西南偏西风',
            westerly: '西风',
            northwesterly: '西北风',
            northwestWesterly: '西北偏西风',
            northwestNortherly: '西北偏北风',
            northerly: '北风',
        },
        login: {
            account: '账号',
            password: '密码',
            rememberPassword: '记住密码',
            forgetPassword: '忘记密码',
            signIn: '登录',
        },
        menu: {
            addMenu: '添加菜单',
        },
        dictionaries: {
            requestType: '请求时传递的类型',
            dictionariesParamsList: '字典参数列表',
        },
        package: {
            uploadPlugPackage: '上传插件和安装包',
            noInstallPackPlug: '无安装包和插件',
            applyName: '应用名称',
            uploadTime: '上传时间',
            versionName: '版本名',
            versionNumber: '版本号',
            buttonDownload: '点击按钮开始下载',
        },
        formLabel: {
            serialNumber: '序列号',
            affiliatedCustomer: '所属客户',
            affiliatedGroup: '所属分组',
            affiliatedRole: '所属角色',
            affiliatedParent: '所属父级',
            customerName: '客户名称',
            index: '序号',
            operation: '操作',
            remark: '备注',
            type: '类型',
            name: '名称',
            code: '编码',
            choice: '选择',
            photoUpload: '拍照上传',
            lng: '经度',
            lat: '纬度',
            address: '地址',
            watch: '查看',
            location: '定位',
            description: '描述',
            auth: '权限',
            avatar: '头像',
            accountNumber: '账号',
            password: '密码',
            graphicCode: '验证码',
            smsCode: '短信码',
            reply: '重发',
            send: '发送短信',
            fresh: '新密码',
            update: '更新',
            get: '获取',
            email: '邮箱',
            qqNumber: 'qq号',
            mobile: '手机号码',
            plan: '平面图',
            distribution: '布点',
            device: '设备',
            distance: '距离（米）',
            status: '状态',
            menu: {
                menuTitle: '菜单标题',
                pageTitle: '页面标题',
                menuPath: '菜单路径',
                menuRoute: '菜单路由',
                parentMenu: '父级菜单',
                onlineHide: '上线后隐藏',
                isMenu: '是否为菜单',
                sort: '排序',
                icon: '图标',
            },
            package: {
                packageType: '安装包类型',
                file: '文件',
                fileAddress: '文件地址',
                urlAddress: 'url 地址',
                iosPackage: 'ios 安装包',
                androidPackage: 'android 安装包',
            },
            customerManage: {
                personInCharge: '负责人',
                personInChargeTelephone: '负责人电话',
            },
            deviceManage: {
                personInCharge: '负责人',
                personInChargeTelephone: '负责人电话',
                lastCommunicationTime: '上次通讯时间',
                resolution: '分辨率',
                remainingCapacity: '剩余电量',
                signalIntensity: '信号强度',
            },
            fileManage: {
                fileName: '文件名称',
                fileType: '文件类型',
                file: '文件',
            },
            configManage: {
                config: '配置',
                configName: '配置名称',
                configContent: '配置内容',
                audioOutput: '音频输出',
                template1: '模板一',
                template2: '模板二',
                template3: '模板三',
                template4: '模板四',
                template5: '模板五',
                windowDisplay: '窗口展示',
                duration: '时长（秒）',
                selectDuration: '选择时长（秒）',
                enterDuration: '输入时长（秒）',
                windowAudio: '窗口音频',
                windowNumber: '（窗口 {msg}）',
                fileType: '文件类型',
            },
        },
        placeholder: {
            pleaseFillIn: '请填写{msg}',
            pleaseClick: '请点击{msg}',
            pleaseEnter: '请输入{msg}',
            pleaseSelect: '请选择{msg}',
            pleaseUpload: '请上传{msg}',
            notObtained: '未获得{msg}',
            pleaseEnterOrSelect: '请输入或选择{msg}',
            pleaseClickMapLocationAddress: '请点击地图定位地址',
            pleaseEnterName: '请输入名称',
            pleaseEnterIconName: '请输入图标名称',
            pleaseEnterFilterValues: '请输入筛选条件',
            pleaseEnterSearchAddress: '请输入搜索地址',
            pleaseSelectFilterValues: '请选择筛选条件',
            pleaseSelectQueryTime: '请选择查询的时间段',
            pleaseSelectOperationType: '请选择操作类型',
            pleaseSelectCustomer: '请选择所属客户',
            pleaseSelectRegion: '请选择所属区域',
            pleaseSelectCategory: '请选择所属类别',
            pleaseSelectIndustry: '请选择所属行业',
            pleaseSelectCustomerType: '请选择客户类型',
            pleaseSelectCustomerLevel: '请选择客户级别',
            pleaseSelectCustomerNature: '请选择客户性质',
            pleaseSelectDataSources: '请选择数据来源',
            pleaseSelectOnlineOrOfflineDevice: '请选择在线或离线设备',
            pleaseSelectDeviceType: '请选择设备类型',
            pleaseSelectFileType: '请选择文件类型',
            pleaseSelectDistributeType: '请选择分配类型',
        },
        modal: {
            optionList: '选项列表',
            add: '添加',
            edit: '编辑',
            details: '详情',
            watch: '查看',
            get: '获取',
            searchResult: '搜索结果',
            titles: {
                config: '配置',
                usualAddress: '常用地址',
                plan: '平面图',
                deviceGroup: '设备分组',
                device: '设备',
                location: '定位',
                customer: '客户',
                auth: '权限',
                accountNumber: '账号',
                role: '角色',
                menu: '菜单',
                package: '安装包',
                presetTitle: '预置标题',
                externalLinks: '外部链接',
                iconList: '图标列表',
                queryCriteria: '查询条件',
                setGroupDevice: '设置分组设备',
                distributionConfigOrFile: '分配{msg}到设备',
                uploadFile: '上传文件',
                playVideo: '播放视频',
                playAudio: '播放音频',
                viewPicture: '查看图片',
                configContent: '配置内容',
                devicePreview: '设备预览',
                setDeviceConfigOrFile: '设置设备配置或文件',
                viewDistributeResult: '查看分配结果',
            },
        },
        map: {
            dragSuccess: '移动成功',
            dragFail: '移动失败，请重试',
            commonMenu: '常用菜单',
            addressSearch: '地点搜索',
            checkChart: '查看图表',
            exitChart: '关闭图表',
            plat: {
                zh: {
                    customer: '客户',
                },
            },
            rightMenu: {
            },
            marker: {
            },
        },
        other: {
            advertisingMachinePlatform: '广告机平台',
            home: '首页',
            mainPlatform: '主平台',
            android: '安卓',
            browserPlugIn: '浏览器插件',
            loading: '加载中',
            loadMore: '加载更多',
            noMoreData: '没有更多数据了',
            customName: '自定义名称',
            requestAddress: '请求地址',
            axiosParams: '其他参数（axios 的配置参数）',
        },
        httpCode: {
            304: '请求参数不满足条件(错误码：304)',
            400: '错误请求(错误码：400)',
            401: '认证失败，请检查头部信息(错误码：401)',
            403: '请求被服务器拒绝(错误码：403)',
            404: '请求未找到(错误码：404)',
            405: '请求方法未允许(错误码：405)',
            407: '请求要求代理的身份认证(错误码：407)',
            408: '请求超时(错误码：408)',
            409: '服务器处理请求时发生了冲突(错误码：409)',
            413: '请求的实体过大，服务器无法处理(错误码：413)',
            414: '请求的地址过长(错误码：414)',
            415: '服务器无法处理请求附带的媒体格式(错误码：415)',
            500: '服务器错误(错误码：500)',
            501: '服务器不支持请求的功能，无法完成请求(错误码：501)',
            502: '网关错误或未找到服务器(错误码：502)',
            503: '当前请求过多，请稍候再试(服务器超负载或停机维护)(错误码：503)',
            504: '网关超时(错误码：504)',
            505: '服务器不支持请求的HTTP协议的版本，无法完成处理(错误码：505)',
        },
    },
};