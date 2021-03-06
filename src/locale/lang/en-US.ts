// @ts-ignore
import messages from 'view-design/dist/locale/en-US';// @ts-ignore

export default {
    ...messages,
    h: {
        common: {
            none: 'none',
            normal: 'normal',
            large: 'large',
            small: 'small',
            noData: 'no data',
            unknown: 'unknown',
            year: 'year',
            month: 'month',
            day: 'day',
            hours: 'hours',
            minutes: 'minutes',
            second: 'second',
            success: 'success',
            fail: 'fail',
            cancel: 'cancel',
            confirm: 'confirm',
            noPicture: 'no picture',
            noRemark: 'no remark',
            noDescription: 'no description',
            online: 'online',
            offline: 'offline',
            type: 'type',
            send: 'send',
            copy: 'copy',
            back: 'back',
            submit: 'submit',
        },
        status: {
            online: 'online',
            offline: 'offline',
            normal: 'normal',
            enable: 'enable',
            unable: 'unable',
            alarming: 'alarming',
            disposed: 'disposed',
            undisposed: 'undisposed',
            unpublished: 'unpublished',
            published: 'published',
            yes: 'yes',
            no: 'no',
        },
        tips: {
            loggingIn: 'Login in progress. Please wait',
            loggedIn: 'The account has been logged in',
            forceLogin: 'The user has already logged in elsewhere. Do you want to force login',
            loginSuccess: 'Login successful',
            modifiedSuccess: 'Modified successfully',
            unknownError: 'Unknown error',
            tokenExpire: 'Token expired, please login again',
            accountAlreadyLogin: 'The account is already logged in elsewhere',
            accountAlreadyStopusing: 'The account has been stopped',
            customersDelete: 'The customer is deleted',
            accountPasswordModified: 'The account password has been modified',
            reLogin: 'Please log in again',
            pageNoExist: 'The page you want to visit does not exist 404',
            copyNameAndComponents: 'Click the copy icon name and double-click the copy component',
            copyIconNameSuccess: 'Icon name copied successfully',
            copyIconNameError: 'Failed to copy icon name',
            copyComponentSuccess: 'Component copied successfully',
            copyComponentError: 'Copy component failed',
            getIOSInstallPackageError: 'Failed to get IOS installation package',
            accountVerification: 'The user name should be between 3-16 bits',
            passwordVerification: 'The password length cannot be less than 6 bits',
            mobileVerification: 'Please enter a valid mobile phone number',
            emailVerification: 'Please enter a valid email address',
            carNumberVerification: 'Please enter a valid license plate number',
            identifyVerification: 'Please enter a valid ID card',
            locationVerification: 'Please enter a valid longitude and latitude',
            BreakTime: 'Disconnection time',
            BreakNum: 'Number of broken wires',
            recoveryTime: 'Recovery time',
            consumingTime: 'Time consuming for reconnection',
            communicationBreak: 'Real time communication disconnected',
            communicationRecovery: 'Real time communication resumed',
            reconnect: 'The real-time communication connection with the platform is disconnected and reconnected every two seconds',
            recovery: 'The real-time communication connection with the platform has been restored',
            noFilterSelected: 'No filter selected',
            switchSucceeded: 'Switch Language Success',
            required: 'This item is required, please select data',
            uploadError: 'Failed to upload file. Please try again',
            recommendedSize: 'It is recommended to upload a picture of 1920 x 1080.',
            mapExistencePoint: 'The point already exists on the map',
            typeNothingnessMap: 'The type does not exist on the map',
            mapNothingnessPoint: 'The point does not exist on the map',
            nothingnessType: 'The type does not exist',
            pointNotInRange: 'Point not placed on offline map',
            displayPointError: 'Failed to display point. Please refresh the page and try again',
            addPointError: 'Failed to add point. Please refresh the page and try again',
            mapNotLoading: 'Map not loaded successfully, please refresh the page and try again',
            notMarkerRequest: 'The punctuation request interface is not implemented',
            fileAlready: 'File already exist',
            coverFile: 'File already exists, do you want to replace it?',
            windowConfig: 'Please select the window first, configure the window content and audio output, then select the audio output window!',
            clearConfigTitle: 'Clear configuration content',
            switchTemplate: 'Switch template',
            clearConfigContent: 'Clear all configured contents in the window?',
            browserIncompatible: 'Your browser does not support video tags. Internet Explorer 9 +, Firefox, opera, chrome and safari support Video Tags!',
            formNotSelected: 'Form {msg} is not selected or input duration!',
            configured: 'The content of this template has been configured. After switching, the content of this template will be cleared!',
            getVideoDuration: 'Getting video duration, please wait!',
            getAudioDuration: 'Getting audio duration, please wait!',
            bindSuccess: 'bind success',
            workDataExport: 'work data export',
            noFilterIsExportAllData: 'Currently, no filter condition is selected. Do you want to export all work order data',
            againLogin: 'The modification is successful. You will log out in three seconds. Please log in again......',
            getCode: 'get the captcha',
            getSmsCode: 'get sms verification code',
            confirmAgreement: 'Please make sure that the two passwords are the same',
        },
        header: {
            returnHome: 'back to home page',
            returnParent: 'return to the superior',
            logout: 'logout',
            personal: 'personal settings',
            modifyMobile: 'modify mobile',
            modifyPassword: 'modify password',
            inspectionTask: 'inspection task',
            workTask: 'work order task',
            menuName: 'menu name',
            checkWXInfo: 'biew wechat information',
            replaceAccount: 'change account number',
            bindWX: 'binding wechat',
        },
        tree: {
            region: 'region',
            auxiliaryOptions: 'auxiliary options',
            sizeClass: 'size class',
            grouping: 'grouping',
        },
        upload: {
            repeat: 'File: {msg} repeated upload',
            maxNum: 'The number of files uploaded cannot exceed {msg}',
            formatTitle: 'File format error',
            formatDesc: 'File: {msg} upload format error, please select {format} to upload',
            maxSizeTitle: 'The uploaded file exceeds the specified {msg} mb',
            maxSizeDesc: 'File: {msg} volume ({size}) is too large',
        },
        camera: {
            hardwareProblems: 'Hardware problems',
            allowAccessTo: 'Please allow the browser to access the camera',
            notMediaType: 'No media types were found that meet the request parameters',
            cannotAccess: 'Device not accessible',
            deviceError: 'Device error',
            securityError: 'Security error',
            typeError: 'Type error',
            notSupportedError: 'Please visit the website via HTTPS',
            videoPlaybackError: 'Video playback error',
            videoCloseFail: 'Video close failed',
            webCamera: 'camera',
            cameraArea: 'camera area',
            previewArea: 'preview area',
            againScreenshot: 'again screenshot',
            screenshot: 'screenshot',
        },
        tableButton: {
            batchOperation: 'batch operation',
            doNotOperate: 'do not operate',
            selectAll: 'select all',
            reverseSelect: 'reverse select',
            open: 'open',
            close: 'close',
            add: 'add',
            edit: 'edit',
            enable: 'enable',
            unable: 'unable',
            unbindWx: 'unbind wechat',
            details: 'details',
            delete: 'delete',
            upload: 'upload',
            search: 'search',
            refresh: 'refresh',
            confirmDelete: 'are you sure to delete?',
            confirmUnable: 'are you sure to unable?',
            confirmUnbindWx: 'are you sure to unbind wechat?',
            confirmAccept: 'are you sure to accept?',
            expandAll: 'expand all',
            shrinkAll: 'shrink all',
            selectAllChildren: 'select all children',
            distribution: 'distribution',
            configDistribute: 'distribute to device',
            setGroupDevice: 'set up grouping device',
            setDeviceContent: 'set device content',
            playVideo: 'play video',
            playAudio: 'play audio',
            view: 'view config',
            viewPicture: 'view picture',
            viewDistributeLog: 'view distribute log',
            viewDistributeResult: 'view distribute result',
            create: 'report',
            send: 'dispatch',
            accept: 'accept',
            reply: 'reply',
            cancelWork: 'cancel work',
            export: 'export',
        },
        table: {
            index: 'serial number',
            operation: 'operation',
            name: 'name',
            code: 'code',
            description: 'description',
            accountNumber: 'account number',
            mobile: 'mobile',
            roleName: 'role name',
            customerName: 'customer name',
            parentName: 'parent name',
            customerCode: 'customer code',
            statusFilter: 'status filter',
            plan: 'plan',
            auth: 'auth',
            status: 'status',
            address: 'address',
            type: 'type',
            remark: 'remark',
            serialNumber: 'serial number',
            onlineOrOffline: 'online / offline',
            distance: 'distance (m)',
            device: 'device',
            size: 'size',
            createdPeople: 'created people',
            createdTime: 'created time',
            time: 'time',
            result: 'result',
            reason: 'reason',
            city: 'city',
            area: 'area',
            adminor: 'person charge',
            adminorPhone: 'person charge phone',
            wechat: 'wechat',
            title: 'title',
            createrPeople: 'creater people',
            createrTime: 'creater time',
            publishPeople: 'publish people',
            publishStatus: 'publish status',
            publishTime: 'publish time',
            readingNum: 'reading number',
            affiliatedCustomer: 'affiliated customer',
            userName: 'user name',
            operationLog: {
                operationObj: 'operation object',
                operationUser: 'operation user',
                implementOperation: 'perform the operation',
                operationTime: 'operation time',
                operationResult: 'operation results',
                errorCause: 'reasons for failure',
                startTime: 'start time',
                endTime: 'end time',
            },
            work: {
                workNumber: 'work order no',
                workType: 'work type',
                workStatus: 'work status',
                score: 'score',
                workLevel: "SLA level",
                serviceType: "service/fault type",
                contactMan: "contact man",
                contactNumber: "contact number",
                repairTime: "repair time",
            }
        },
        page: {
            result: 'A total of {msg} results',
        },
        login: {
            account: 'account',
            password: 'password',
            rememberPassword: 'remember the password',
            forgetPassword: 'forget the password',
            signIn: 'sign in',
        },
        menu: {
            addMenu: 'add menu',
        },
        package: {
            uploadPlugPackage: 'upload plug-ins and installation packages',
            noInstallPackPlug: 'no installation package and plug-in',
            applyName: 'apply name',
            uploadTime: 'upload time',
            versionName: 'version name',
            versionNumber: 'version number',
            buttonDownload: 'click the button to start downloading',
        },
        formLabel: {
            userName: 'user name',
            serialNumber: 'serial number',
            affiliatedCustomer: 'affiliated customer',
            affiliatedGroup: 'affiliated group',
            affiliatedRole: 'affiliated role',
            affiliatedParent: 'affiliated parent',
            customerName: 'customer name',
            index: 'serial number',
            operation: 'operation',
            remark: 'remark',
            type: 'type',
            name: 'name',
            code: 'code',
            choice: 'choice',
            photoUpload: 'photo upload',
            lng: 'longitude',
            lat: 'latitude',
            address: 'address',
            watch: 'watch',
            location: 'location',
            description: 'description',
            auth: 'auth',
            avatar: 'avatar',
            accountNumber: 'account number',
            password: 'password',
            graphicCode: 'verification code',
            smsCode: 'sms code',
            reply: 'repeat',
            send: 'send sms',
            fresh: 'new password',
            confirmFresh: 'confirm new password',
            newMobile: 'new mobile',
            update: 'update',
            get: 'get',
            email: 'email',
            qqNumber: 'qq number',
            mobile: 'phone number',
            plan: 'plan',
            distribution: 'distribution',
            device: 'device',
            distance: 'distance (m)',
            status: 'status',
            city: 'city',
            area: 'area',
            adminArea: 'regulatory area',
            sex: 'sex',
            isNotice: 'receive work order notice',
            content: 'content',
            title: 'title',
            region: 'region',
            reset: 'reset',
            wechat: 'wechat',
            modify: 'modify',
            next: 'next',
            complete: 'complete',
            menu: {
                menuTitle: 'menu title',
                pageTitle: 'page title',
                menuPath: 'menu path',
                menuRoute: 'menu routing',
                parentMenu: 'parent menu',
                onlineHide: 'hide after online',
                isMenu: 'is it a menu',
                sort: 'sort',
                icon: 'icon',
            },
            package: {
                packageType: 'installation package type',
                file: 'file',
                fileAddress: 'file address',
                urlAddress: 'url address',
                iosPackage: 'ios installation package',
                androidPackage: 'android installation package',
            },
            customerManage: {
                personInCharge: 'person in charge',
                personInChargeTelephone: 'telephone number of responsible person',
            },
            work: {
                work_type: 'work type',
                work_level: 'SLA level',
                service_type: 'service/breakdown type',
                content: 'repair contents',
                replyContent: 'reply content',
                imgs: 'picture',
                videos: 'video',
                link_man: 'link man',
                link_mobile: 'link mobile',
                reciever: 'reciever',
                reason: 'reason',
                reportUser: 'report user',
                customer: 'customer',
                customerAddress: 'customer address',
                acceptType: 'accept type',
                sendPeople: 'send people',
                repairUser: 'repair user',
                repairUserPhone: 'repair user phone',
                signLng: 'sign lng',
                signLat: 'sign lat',
                signDistance: 'sign distance',
                receiptPeople: 'receipt people',
                receiptContent: 'receipt content',
                evaluate: 'evaluate',
                cancelPeople: 'cancel people',
                cancelReason: 'cancel reason',
            },
            wxbind: {
                scanQrcode: 'please open wechat to scan the qr code below',
                qrcodeError: 'qr code acquisition failed',
                repeatGet: 'recapture',
                errorInfo: 'error message',
            },
            wxinfo: {
                headimgurl: 'head portrait',
                nickname: 'wechat name',
                region: 'area',
            },
        },
        placeholder: {
            pleaseFillIn: 'Please fill in {msg}',
            pleaseClick: 'Please click {msg}',
            pleaseEnter: 'Please enter {msg}',
            pleaseSelect: 'Please select {msg}',
            pleaseUpload: 'Please upload {msg}',
            notObtained: 'Not obtained {msg}',
            pleaseEnterOrSelect: 'Please enter or select{msg}',
            pleaseClickMapLocationAddress: 'Please click on the map to locate the address',
            pleaseEnterName: 'Please enter a name',
            pleaseEnterIconName: 'Please enter the icon name',
            pleaseEnterFilterValues: 'Please enter filter value',
            pleaseEnterSearchAddress: 'Please enter the search address',
            pleaseSelectFilterValues: 'Please select filter values',
            pleaseSelectQueryTime: 'Please select the time period to query',
            pleaseSelectOperationType: 'Please select operation type',
            pleaseSelectPublishStatus: 'Please select publish status',
            pleaseSelectCustomer: 'Please select your customer',
            pleaseSelectRegion: 'Please select your region',
            pleaseSelectCategory: 'Please select the category',
            pleaseSelectIndustry: 'Please select your industry',
            pleaseSelectCustomerType: 'Please select customer type',
            pleaseSelectCustomerLevel: 'Please select customer level',
            pleaseSelectCustomerNature: 'Please select the nature of the customer',
            pleaseSelectDataSources: 'Please select data source',
            pleaseSelectOnlineOrOfflineDevice: 'Please select offline or online device',
            pleaseSelectDeviceType: 'Please select device type',
            pleaseSelectFileType: 'Please select file type',
            pleaseSelectDistributeType: 'Please select distribute type',
            pleaseSelectSLALevel: 'Please select SLA level',
            pleaseSelectWorkStatus: 'please select work status',
        },
        modal: {
            optionList: 'Option list',
            add: 'Add',
            edit: 'Edit',
            details: 'Details',
            watch: 'watch',
            get: 'get',
            searchResult: 'search result',
            titles: {
                location: ' location',
                customer: ' customer',
                knowLedgeBase: 'know ledge base',
                notice: 'notice',
                auth: ' auth',
                accountNumber: ' account number',
                role: ' role',
                menu: ' menu',
                package: ' package',
                presetTitle: 'preset title',
                externalLinks: 'external links',
                iconList: 'icon list',
                queryCriteria: 'query criteria',
                uploadFile: 'upload file',
                viewPicture: 'view picture',
                wxbind: 'wechat bind',
                work: 'report work',
                reply: 'reply',
                workDistribution: 'distribution work',
                workCancel: 'cancel work',
                wxInfo: 'wechat info',
                workDetails: 'work details',
                workNewNotice: 'new work notice',
            },
        },
        map: {
            dragSuccess: 'move successful',
            dragFail: 'Move failed, please try again',
            commonMenu: 'common menu',
            addressSearch: 'location search',
            checkChart: 'view chart',
            exitChart: 'close chart',
            plat: {
                zh: {
                    customer: 'customer',
                },
            },
        },
        other: {
            platformName: 'Tianzuo Technology',
            home: 'Home',
            mainPlatform: 'Main platform',
            android: 'android',
            browserPlugIn: 'browser plug in',
            loading: 'loading',
            loadMore: 'load more',
            noMoreData: 'there is no more data',
            customName: 'custom name',
            requestAddress: 'request address',
            axiosParams: 'additional parameters (Axios configuration parameters)',
            admin: 'admin',
        },
        httpCode: {
            304: 'The request parameter does not meet the condition(error code: 304)',
            400: 'Bad request(error code: 400)',
            401: 'Authentication failed, please check the header information(error code: 401)',
            403: 'equest rejected by server(error code: 403)',
            404: 'Request not found(error code: 404)',
            405: 'Request method not allowed(error code: 405)',
            407: 'Request for proxy authentication(error code: 407)',
            408: 'request timeout(error code: 408)',
            409: 'A conflict occurred while the server was processing the request(error code: 409)',
            413: 'The requested entity is too large for the server to process(error code: 413)',
            414: 'The requested address is too long(error code: 414)',
            415: 'The server cannot process the media format that came with the request(error code: 415)',
            500: 'Server error(error code: 500)',
            501: 'The server does not support the requested function and cannot complete the request(error code: 501)',
            502: 'Gateway error or server not found(error code: 502)',
            503: 'There are too many current requests. Please try again later (server overload or downtime maintenance)(error code: 503)',
            504: 'gateway timeout(error code: 504)',
            505: 'The server does not support the requested version of the HTTP protocol and cannot complete processing(error code: 505)',
        },
    },
};