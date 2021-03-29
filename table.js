/**
 * surfaceTable
 * Gitee https://gitee.com/iszsw/surface
 * @author zsw zswemail@qq.com
 */
;(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("vue")) :
        typeof define === "function" && define.amd ? define(["exports", "vue"], factory) :
            (global = global || self, factory(global.surfaceTable = {}, global.Vue));
}(this, (function (exports, Vue) {
    "use strict";

    function defineProperties(target, props) {
        for (let i = 0; i < props.length; i++) {
            let descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.editable = true;
            Object.defineProperty(target, descriptor.key, descriptor);
        }
    }

    function createClass(Constructor, protoProps, staticProps) {
        if (protoProps) defineProperties(Constructor.prototype, protoProps);
        if (staticProps) defineProperties(Constructor, staticProps);
        return Constructor;
    }

    function classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }

    function deepClone(target) {
        return (function deepClone(target) {
            let result;
            if (isObject(target) || Array.isArray(target)) {
                if (Array.isArray(target)) {
                    result = [];
                    for (let i in target) {
                        result.push(deepClone(target[i]))
                    }
                } else if (target === null) {
                    result = null;
                } else if (target.constructor === RegExp) {
                    result = target;
                } else {
                    result = {};
                    for (let i in target) {
                        result[i] = deepClone(target[i]);
                    }
                }
            } else {
                result = target;
            }
            return result;
        }(target))
    }

    function updateQueryStringParam(uri, key, value = null) {
        return (function handler(uri, key, value) {
            if (uri.length) {
                if (typeof key == "string") {
                    if (value !== null) {
                        const re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
                        let separator = uri.indexOf("?") !== -1 ? "&" : "?";
                        if (uri.match(re)) {
                            return uri.replace(re, "$1" + key + "=" + value + "$2");
                        } else {
                            return uri + separator + key + "=" + value;
                        }
                    }
                } else if (typeof key == "object") {
                    for (let k in key) {
                        uri = handler(uri, k, key[k])
                    }
                }
            }
            return uri;
        }(uri, key, value))
    }

    function extendVm(obj, ext) {
        if (isEmpty(obj)) return ext
        for (let i in ext) {
            if (obj.hasOwnProperty(i)) {
                if (isObject(ext[i]) || Array.isArray(ext[i])) {
                    extendVm(obj[i], ext[i])
                } else {
                    obj[i] = ext[i]
                }
            } else {
                $set(obj, i, ext[i])
            }
        }
        return obj
    }

    function extend() {
        let extended = {};
        let deep = false;
        let i = 0;
        if (Object.prototype.toString.call(arguments[0]) === '[object Boolean]') {
            deep = arguments[0];
            i++;//如果为深拷贝则初始的i为1或者为0
        }
        let merge = function (obj) {
            for (let prop in obj) {
                if (obj.hasOwnProperty(prop)) {
                    if (deep && Object.prototype.toString.call(obj[prop]) === '[object Object]') {
                        extended[prop] = extend(extended[prop], obj[prop]);
                    } else {
                        extended[prop] = obj[prop];
                    }
                }
            }
        };
        for (; i < arguments.length; i++) {
            merge(arguments[i]);
        }
        return extended;
    }

    function isType(arg, type) {
        return Object.prototype.toString.call(arg) === "[object " + type + "]";
    }

    function isFunction(arg) {
        return isType(arg, "Function");
    }

    function isString(arg) {
        return isType(arg, "String");
    }

    function isEmpty(arg) {
        return arg == false || arg === undefined || arg.length === 0
    }

    function isObject(arg) {
        return arg != null
            && typeof arg === "object"
            && Array.isArray(arg) === false
    }

    function $setNx(target, field, value) {
        target[field] === undefined && Vue.set(target, field, value);
    }

    function $set(target, field, value) {
        Vue.set(target, field, value);
    }

    function $delete(target, field) {
        Vue.delete(target, field);
    }

    function styleInject(css) {
        if (!css || typeof document === "undefined") {
            return;
        }
        let head = document.head || document.getElementsByTagName("head")[0];
        let style = document.createElement("style");
        style.type = "text/css";
        head.appendChild(style);
        if (style.styleSheet) {
            style.styleSheet.cssText = css;
        } else {
            style.appendChild(document.createTextNode(css));
        }
    }

    const _axios = function () {
        let _axios = typeof window !== 'undefined' && window.axios ? window.axios : axios;
        if (undefined === _axios) {
            throw new ReferenceError("找不到对象：axios");
        }

        function _responseThen(response) {
            if (response.status === 200) {
                return Promise.resolve(response);
            } else {
                return Promise.reject(response);
            }
        }

        function _responseCatch(error) {
            let msg = '请求错误'
            if (typeof error === 'string') {
                msg = error
            } else if (error.response) {
                const errorLabel = {
                    400: '请求参数错误',
                    401: '未授权，请登录',
                    403: '跨域拒绝访问',
                    404: `请求地址出错: ${error.response.config.url}`,
                    408: '请求超时',
                    500: '服务器内部错误' + error.message,
                    501: '服务未实现',
                    502: '网关错误',
                    503: '服务不可用',
                    504: '网关超时',
                    505: 'HTTP版本不受支持',
                };
                msg = errorLabel[error.response.status] || error.message
            }
            return Promise.reject(msg)
        }

        function _requestThen(config) {
            if (!config.method || config.method.toLowerCase() == 'get') {
                config.params = config.data
                delete config.data
            }

            return config
        }

        function _requestCatch(error) {
            return Promise.error(error);
        }

        let instance = _axios.create({headers: {'X-Requested-With': 'XMLHttpRequest'}})
        instance.defaults.timeout = 10000;
        instance.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=UTF-8';
        instance.interceptors.request.use(_requestThen, _requestCatch)
        instance.interceptors.response.use(_responseThen, _responseCatch)
        return instance
    }()

    function request(config) {
        return new Promise((resolve, reject) => {
            _axios(config).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err)
            })
        });
    }

    function componentsInit(components) {
        return components.reduce(function (components, c) {
            components[c.name] = c
            return components
        }, {})
    }

    function Api($surfaceTable) {
        const $vm = $surfaceTable.$vm
        let options = $vm.options,hideDialog,loading

        function callTableMethod(method) {
            let _l = arguments.length - 1
            let args = new Array(_l)
            for (let i = 0; i < _l; i++) {
                args[i] = arguments[i + 1];
            }
            return $surfaceTable.table$Vm[method].apply(null, args)
        }

        let pk = null

        let requestParams = {}

        return {
            getPk() {
                if (null === pk) {
                    let cols = $surfaceTable.table$Vm.columns
                    for (let c of cols) {
                        if (c.type === 'selection') {
                            pk = c.property
                            break;
                        }
                    }
                }
                return pk
            },
            sortChange(prop, order) {
                if (order && prop) {
                    requestParams.sort_field = prop
                    requestParams.sort_order = order
                } else {
                    delete requestParams.sort_field
                    delete requestParams.sort_order
                }
                this.reloadData()
            },
            searchChange(params){
                requestParams = params
                this.reloadData()
            },
            reloadData(params = {}) {
                if ($surfaceTable.pagination$Vm) {
                    if (true === params) {
                        $surfaceTable.pagination$Vm.currentChange(1)
                        params = {}
                    }
                    $surfaceTable.pagination$Vm.load(extend(requestParams, params))
                }else{
                    location.reload()
                }
            },
            appendRow(index, many, ...rows) {
                if (isNaN(index) || Array.isArray(index)) {
                    if (true === many && Array.isArray(index)) {
                        options.props.data.splice(0, options.props.data.length, ...index)
                    } else {
                        options.props.data.push(index)
                    }
                } else {
                    options.props.data.splice(index, many, ...rows)
                }
                return true
            },
            getSelections() {
                return $surfaceTable.table$Vm.selection
            },
            getSelectionsField(name = true) {
                if (true === name) {
                    name = this.getPk()
                }
                let selection = this.getSelections()
                let data = selection.reduce((data, c) => {
                    c[name] !== undefined && data.push(c[name])
                    return data
                }, [])
                return data
            },
            loading(state = true) {
                if (state) {
                    loading = $surfaceTable.table$Vm.$loading({
                        lock: true,
                        spinner: 'el-icon-loading',
                        customClass: 'surface-table-loading',
                        target: document.querySelector('.el-table__body-wrapper')
                    });
                } else {
                    loading.close()
                }
            },
            hideDialog() {
                if (isFunction(hideDialog)) {
                    hideDialog()
                    hideDialog = null
                }
            },
            setHideDialog(f){
                if (isFunction(f)) {
                    hideDialog = f
                }
            },

            clearSelection() {
                return callTableMethod('clearSelection')
            },
            toggleRowSelection(index, selected) {
                return callTableMethod('toggleRowSelection', isObject(index) ? index : $surfaceTable.ref.data[index], selected);
            },
            toggleAllSelection() {
                return callTableMethod('toggleAllSelection')
            },
            toggleRowExpansion(index, expanded) {
                return callTableMethod('toggleAllSelection', isObject(index) ? index : $surfaceTable.ref.data[index], expanded)
            },
            setCurrentRow(index) {
                return callTableMethod('setCurrentRow', isObject(index) ? index : $surfaceTable.ref.data[index])
            },
            clearSort() {
                return callTableMethod('clearSort')
            },
            clearFilter(columnKey) {
                return callTableMethod('clearFilter', columnKey)
            },
            doLayout() {
                return callTableMethod('doLayout')
            },
            sort(prop, order) {
                return callTableMethod('sort', prop, order)
            },
        }
    }

    let $surface;

    const editableComponent = function () {
        const NAME = "s-editable"
        const handler = function handler() {
            const DEFAULT_COLOR = "#333"
            const DEFAULT_SIZE = "mini"
            const BTN_PROPS = {
                attrs: {
                    plain: true,
                    size: DEFAULT_SIZE,
                },
                style: {
                    color: DEFAULT_COLOR
                }
            }
            const BTN_EL = "el-button"

            function text(h) {
                let ref = this.column.property + "_" + this.$index
                BTN_PROPS.slot = "reference"
                BTN_PROPS.on = {
                    click: (event) => {
                        event.stopPropagation()
                        this.value = this.original
                    }
                }

                return h("el-popover", {attrs: {trigger: "click"}, ref}, [
                    h(BTN_EL, deepClone(BTN_PROPS), [this.original]),
                    h("div", [h("el-input", {
                        attrs: {
                            type: "textarea",
                            autosize: {minRows: 2},
                        },
                        props: {
                            value: this.value
                        },
                        on: {
                            input: text => {
                                this.value = text
                            }
                        }
                    }), h("div", {
                        style: {textAlign: "right", marginTop: "10px"},
                    }, [
                        h("el-button", {
                            attrs: {size: "mini", type: "primary"},
                            on: {
                                click: () => {
                                    this.change((res) => {
                                        if (res) {
                                            this.$refs[ref].doClose()
                                        }
                                    })
                                }
                            }
                        }, "确定"),
                    ])]),
                ])
            }

            function select(h) {
                let children = []
                let options = this.options
                for (let k in options) {
                    children.push(h("el-option", {
                        attrs: {
                            label: options[k],
                            value: k
                        }
                    }))
                }
                let label = options[this.original]
                let ref = this.column.property + "_" + this.$index

                BTN_PROPS.slot = "reference"
                BTN_PROPS.on = {
                    click: (event) => {
                        event.stopPropagation()
                        this.value = this.original
                    }
                }
                return h("el-popover", {attrs: {trigger: "click"}, ref}, [
                    h(BTN_EL, deepClone(BTN_PROPS), [label]),
                    h("div", [h("el-select", {
                        props: {
                            value: options[this.value]
                        },
                        on: {
                            change: (val) => {
                                this.value = val
                            }
                        }
                    }, children), h("div", {
                        style: {textAlign: "right", marginTop: "10px"},
                    }, [
                        h("el-button", {
                            attrs: {size: "mini", type: "primary"},
                            on: {
                                click: () => {
                                    this.change((res) => {
                                        if (res) {
                                            this.$refs[ref].doClose()
                                        }
                                    })
                                }
                            }
                        }, "确定"),
                    ])]),
                ])
            }

            function switcher(h) {
                return h("el-switch", {
                    props: {
                        value: this.value,
                    },
                    on: {
                        change: (val) => {
                            event.stopPropagation()
                            this.value = val
                            this.change((res) => {
                                if (!res) this.value = !this.value
                            })
                        }
                    }
                })
            }

            return {text, switcher, select}
        }()
        return {
            name: NAME,
            data() {
                return {
                    value: '',
                    original: ''
                }
            },
            props:{
                $index: Number,
                column: Object,
                row: Object,
                type: String,
                options: [Array, Object],
                async: Object,
                doneRefresh: {
                    type: Boolean,
                    default: false
                },
            },
            created() {
                this.reload()
            },
            watch: {
                row: {
                    handler() {
                        this.reload()
                    },
                }
            },
            methods: {
                reload() {
                    this.value = this.original = this.row[this.column.property]
                },
                change(then) {
                    if (this.value == this.original) {
                        this.$message.info('值未修改');
                        return
                    }

                    this.$emit('change', this.value, this.column.property, this.row)

                    if (this.async) {
                        let data = {
                            field: this.column.property,
                            value: this.value,
                        }

                        let original = this.async.data || {}
                        for (let k in original) {
                            if (isNaN(k)) {
                                data[k] = original[k]
                            } else {
                                data[original[k]] = this.row[original[k]]
                            }
                        }
                        this.async.data = data

                        let that = this
                        return request(this.async).then(function (res) {
                            if (res.code === undefined) return Promise.reject("返回格式错误，格式：{code: 0, data:[{},...] [, count: Number]}");
                            if (res.code !== 0) return Promise.reject(res.msg || "请求错误");
                            that.$message.success(res.msg || '操作成功');
                            that.original = that.row[that.column.property] = that.value
                            that.doneRefresh && $surface.$api.reloadData()
                            then(!0)
                        }).catch(function (err, o) {
                            that.$message.error(err || '请求失败');
                            o !== undefined && console.error(o)
                            then(!1)
                        })
                    } else {
                        then(!0)
                    }
                }
            },
            render(h) {
                let type = handler.hasOwnProperty(this.type) ? this.type : "text"
                return handler[type].call(this, h)
            }
        }
    }()

    const buttonComponent = function () {
        const NAME = "s-button"

        let cw = document.documentElement.clientWidth
        let ch = document.documentElement.clientHeight

        return {
            name: NAME,
            props: {
                // 公共
                $index: Number,
                column: Object,
                row: Object,
                prop: Object,
                visible: String,
                confirmBtn: {
                    type: [Boolean, String, Object],
                    default: true
                },
                cancelBtn: {
                    type: [Boolean, String, Object],
                    default: true
                },
                tooltip: {
                    type: String,
                    default: ''
                },
                handler: { // 按钮类型 page:页面 | confirm:确认 | submit:提交 | refresh:刷新
                    type: String,
                    default: ''
                },
                doneRefresh: { // 页面关闭之后刷新
                    type: Boolean,
                    default: true
                },

                //submit
                pk:{
                    type: String // 主键
                },

                //confirm
                async: { // 确认按钮异步操作
                    type: Object
                },
                confirmMsg: { // 提示消息
                    type: String,
                    default: ''
                },

                // page
                dialog: { // dialog 自定义属性
                    type: Object,
                    default: function () {
                        return {}
                    }
                },
                url: {
                    type: String,
                    default: ''
                },
                data: { // 传递的参数
                    type: [Array, Object],
                    default: function _default() {
                        return {}
                    }
                },
            },
            data() {
                return {
                    pageVisible: false,
                    iframeBtn: [],
                    requestUrl: '',
                    pageChildren: [],
                }
            },
            created(){
                switch (this.handler) {
                    case 'page':
                        const defaultBtn = (type = 'text', emit = null) => {
                            return {
                                el: 'elButton',
                                attrs: {type, size: "medium"},
                                style: {marginLeft: "30px"},
                                on: {
                                    click: () => {
                                        emit ? this.$emit(emit, this) : this.hideDialog()
                                    }
                                }
                            }
                        }

                        if (this.cancelBtn !== false) {
                            let cancelBtn
                            cancelBtn = isObject(this.cancelBtn) ? this.cancelBtn : {children: this.cancelBtn === true ? "取消" : this.cancelBtn}
                            cancelBtn = extend(defaultBtn('text', 'cancel'), cancelBtn)
                            this.iframeBtn.push(new Render(cancelBtn, this).run())
                        }

                        if (this.confirmBtn !== false) {
                            let confirmBtn
                            confirmBtn = isObject(this.confirmBtn) ? this.confirmBtn : {children: this.confirmBtn === true ? "确认" : this.confirmBtn}
                            confirmBtn = extend(defaultBtn('primary', 'confirm'), confirmBtn)
                            this.iframeBtn.push(new Render(confirmBtn, this).run())
                        }

                        this.requestUrl = this.url
                        for (let k in this.data) {
                            if (isNaN(k)) {
                                this.requestUrl = updateQueryStringParam(this.requestUrl, k, this.data[k])
                            } else {
                                this.requestUrl = updateQueryStringParam(this.requestUrl, this.data[k], this.row[this.data[k]])
                            }
                        }

                        const h = this.$createElement

                        this.pageChildren = [
                            h("iframe", {
                                attrs: {
                                    src: this.requestUrl,
                                    width: "100%",
                                    frameBorder: 0
                                },
                                style: {
                                    height: cw <= 800 ? (ch - 80) + "px" : "calc(80vh - 150px)",
                                    border: "0 none"
                                }
                            }),
                            h("div", {slot: "title"}, [
                                h("span", [this.tooltip]),
                            ]),
                            this.iframeBtn.length > 0 ? h("span", {slot: "footer"}, this.iframeBtn) : null,
                        ]

                        break;
                }
            },
            methods: {
                tap(event) {
                    event.stopPropagation()
                    this.$emit(this.handler, this)
                    switch (this.handler) {
                        case "page":
                            return this.onPage()
                            break;
                        case "confirm":
                            return this.onConfirm()
                            break;
                        case "refresh":
                            return this.onRefresh()
                            break;
                        case "submit":
                            return this.onSubmit()
                            break;
                    }
                },
                onRefresh() {
                    $surface.$api.reloadData()
                },
                onSubmit() {
                    let pk = this.pk ? this.pk : $surface.$api.getPk()
                    let select = $surface.$api.getSelectionsField(pk)
                    if (select.length < 1) {
                        this.$message.info("没有选中项")
                        return false
                    }

                    let that = this
                    function _submit() {
                        if (!that.async) {
                            that.$message.error("请先配置异步参数 [async]")
                            return false
                        }
                        let data = {}
                        data[pk] = select
                        that.async.data = Object.assign(that.async.data || {}, data)
                        return request(that.async).then(function (res) {
                            if (res.code === undefined) return Promise.reject("返回格式错误，格式：{code: 0, data: [{},...] [, count: Number]}");
                            if (res.code !== 0) return Promise.reject(res.msg || "请求错误");
                            that.$message.success(res.msg || '操作成功');
                            this.doneRefresh && $surface.$api.reloadData()
                        }).catch(function (err, o) {
                            that.$message.error(err || '请求失败');
                            o !== undefined && console.error(o)
                        })
                    }

                    this.confirmMsg ? this.$confirm(this.confirmMsg, "提示", {type: "warning"}).then(_ => {_submit()}) : _submit();
                },
                onConfirm(then) {
                    this.$confirm(this.confirmMsg ? this.confirmMsg : this.tooltip, "提示", {type: "warning"}).then(_ => {
                        this.$emit("confirmed", this) //已经确认
                        if (this.async) {
                            let data = {},
                                original = this.async.data || {}

                            for (let k in original) {
                                if (isNaN(k)) {
                                    data[k] = original[k]
                                } else {
                                    data[original[k]] = this.row[original[k]]
                                }
                            }

                            this.async.data = data
                            let that = this

                            return request(this.async).then(function (res) {
                                if (res.code === undefined) return Promise.reject("返回格式错误，格式：{code: 0, data: [{},...] [, count: Number]}");
                                if (res.code !== 0) return Promise.reject(res.msg || "请求错误");
                                that.$message.success(res.msg || '操作成功');
                                then && then(!0)
                            }).catch(function (err, o) {
                                that.$message.error(err || '请求失败');
                                o !== undefined && console.error(o)
                                then && then(!1)
                            })
                        } else {
                            then && then(!0)
                        }
                    }).catch(_ => {
                        this.$emit("cancelled", this) //已经取消
                    });
                },
                onPage() {
                    this.pageVisible = true
                },
                render() {
                    switch (this.handler) {
                        case "page":
                            return this.renderPage()
                            break;
                        case "submit":
                        case "refresh":
                        case "confirm":
                            break;
                    }
                    return null
                },
                renderPage() {
                    const h = this.$createElement
                    let dialogProps = extend({
                        props: {
                            visible: this.pageVisible,
                        },
                        attrs: {
                            width: cw > 1200 ? cw > 1500 ? '50%' : "65%" : "80%",
                            fullscreen: cw <= 800,
                            "append-to-body": true,
                            'destroy-on-close': false,
                            'close-on-press-escape': true,
                            'close-on-click-modal': true,
                            'show-close': true,
                        },
                        on: {
                            open: () => {
                                $surface.$api.setHideDialog(()=>{
                                    this.hideDialog()
                                    this.doneRefresh && $surface.$api.reloadData()
                                })
                                this.$emit('open', this)
                            },
                            opened: () => {
                                this.$emit('opened', this)
                            },
                            close: () => {
                                this.hideDialog()
                                this.$emit('close', this)
                            },
                            closed: () => {
                                this.$emit('closed', this)
                            },
                        }
                    }, this.dialog)

                    return h("el-dialog", dialogProps, this.pageChildren)
                },
                hideDialog() {
                    if (this.pageVisible) this.pageVisible = false
                },
                renderTooltip() {
                    let h = this.$createElement
                    let props = this.prop || {}
                    props = props.hasOwnProperty('props') ? props : {props: props}
                    extendVm(props, {on: {click: this.tap}})
                    return h("el-tooltip", {
                        attrs: {
                            disabled: this.tooltip.length < 1,
                            placement: "top",
                            content: this.tooltip
                        }
                    }, [h("el-button", props)])
                }
            },
            render(h) {
                if (undefined != this.visible && this.row.hasOwnProperty(this.visible) && !this.row[this.visible]) return null
                return h("span", {style: {marginRight: "10px"}}, [this.renderTooltip(), this.render()])
            }
        }
    }()

    const headerComponent = function () {
        const NAME = "s-header"
        return {
            name: NAME,
            props: {
                options: {
                    type: Object,
                    default: function () {
                        return {}
                    }
                },
            },
            components: componentsInit([buttonComponent]),
            render(h) {
                return new Render({...this.options}, this).run()
            }
        }
    }()

    const paginationComponent = function () {
        const NAME = "s-pagination"

        return {
            name: NAME,
            props: {
                options: {
                    type: Object,
                    default: function () {
                        return {}
                    }
                },
            },
            data() {
                return {
                    request: {
                        data: {}
                    },
                    currentPage: 1, // 当前页
                    responseThen: function () {},
                }
            },
            created() {
                this.init()
            },
            methods: {
                init() {
                    if (this.request.responseThen && isFunction(this.request.responseThen)) {
                        this.responseThen = this.request.responseThen
                        $delete(this.request, 'responseThen')
                    } else {
                        this.responseThen = function (res) {
                            if (res.code === undefined) return Promise.reject("返回格式错误，格式：{code: 0, data: [{},...]}");
                            if (res.code !== 0) return Promise.reject(res.msg || "请求错误");
                            return res.data || {list: []}
                        }
                    }
                    this.load()
                },
                currentChange(page) {
                    this.currentPage = page // 当前页
                    $surface.$api.reloadData()
                },
                totalChange(total) {
                    if (this.options.props.total != total) {
                        this.options.props.total = total
                    }
                },
                sizeChange(pageSize) {
                    this.options.props['pager-size'] = pageSize;
                    if (Math.floor(this.options.props.total / pageSize) > this.currentPage) $surface.$api.reloadData()
                },
                load(params = {}) {
                    if (undefined === this.options.props.async) return false

                    this.options.props.async.data = {
                        page: this.currentPage,
                        limit: this.options.props['pager-size'] || 10,
                        ...params
                    }

                    let that = this

                    let loading = this.$loading({
                        lock: true,
                        spinner: 'el-icon-loading',
                        customClass: 'surface-table-loading',
                        target: document.querySelector('.el-table__body-wrapper')
                    });
                    request(this.options.props.async).then(function (res) {
                        return new Promise((resolve, reject) => {
                            return resolve(that.responseThen(res))
                        }).then((data) => {
                            if (data.list === undefined) {
                                return Promise.reject("方法[responseThen] 返回格式错误，格式：{list: [{},...] [, count: Number]}")
                            }
                            that.totalChange(data.count || 1)
                            $surface.$api.appendRow(data.list, true);
                        })
                    }).catch(function (err, o) {
                        that.$message.error(err || '请求失败');
                        o !== undefined && console.error(o)
                    }).finally(()=>{
                        loading.close()
                    })
                },
            },
            render(h) {
                return new Render({
                    el: 'elPagination',
                    on: {
                        'size-change': this.sizeChange,
                        'current-change': this.currentChange,
                    },
                    ...this.options
                }, this).run()
            }
        }
    }()

    let tableComponents = componentsInit([editableComponent, buttonComponent])

    const tableComponent = function () {
        const NAME = "s-table"
        let components = tableComponents

        return {
            name: NAME,
            props: {
                options: {
                    type: Object,
                    default: function () {
                        return {}
                    }
                },
                columns: {
                    type: Array,
                    default: function () {
                        return []
                    }
                }
            },
            components,
            created() {
                this.initColumn()
            },
            methods: {
                initColumn() {
                    this.columns.forEach(v => {
                        this.$set(v, 'el', "el-table-column")
                    })
                }
            },
            render() {
                return new Render({
                    el: 'elTable',
                    children: this.columns,
                    ...this.options
                }, this).run()
            }
        }
    }()

    const Render = function () {

        function Render(props, $vm) {
            classCallCheck(this, Render)
            this.$vm = $vm
            this.props = props
        }

        return createClass(Render, [
            {
                key: "el",
                get: function el() {
                    if (undefined === this.elName) {
                        this.elName = this.props.el || "span"
                        $delete(this.props, 'el')
                    }

                    return this.elName
                }
            },
            {
                key: "_render",
                value: function _render() {
                    let children = []
                    for (let i in this.props) {
                        if (i == "children") {
                            children = this.props[i];
                            $delete(this.props, i);
                            break;
                        }
                    }
                    return new Array(this.el, this.props, children)
                }
            },
            {
                key: "_bind",
                value: function _bind(original, bindObj) { // 事件环境
                    const bindThisAttributes = ["on", "nativeOn", "scopedSlots"]
                    for (let x in original) {
                        if (bindThisAttributes.indexOf(x) >= 0) {
                            if (isFunction(original[x])) {
                                original[x] = original[x].bind(bindObj)
                            } else if (isObject(original[x])) {
                                let functions = {}
                                for (let i in original[x]) {
                                    if (isFunction(original[x][i])) {
                                        functions[i] = original[x][i].bind(bindObj)
                                    }
                                }
                                original[x] = functions
                            }
                        }
                    }
                }
            },
            {
                key: "_initChildren",
                value: function _initChildren(children) {
                    const vm = this.$vm
                    const VNode = vm.$createElement().constructor
                    if (Array.isArray(children)) {
                        children = children.reduce(function (children, c) {
                            isEmpty(c) || children.push(isObject(c) && !(c instanceof VNode) ? new Render({...c}, vm).run() : c)
                            return children
                        }, [])
                    }
                    return children
                }
            },
            {
                key: "_initScopedSlots",
                value: function _initScopedSlots(scopedSlots, props) {
                    const vm = this.$vm, h = vm.$createElement

                    let _scopedSlots
                    if (isFunction(scopedSlots)) {
                        _scopedSlots = scopedSlots(h)
                    } else if (isObject(scopedSlots) || Array.isArray(scopedSlots)) {
                        const that = this

                        function scopedSlotsHandler(scopedSlots, prop) {
                            return scopedSlots.map(function (s) {
                                let _s = deepClone(s)
                                _s.props = Object.assign(_s.props || {}, {
                                    $index: prop.$index,
                                    column: prop.column || props,
                                    row: prop.row,
                                })
                                that._inject(_s)
                                return new Render(_s, that.$vm).run()
                            })
                        }

                        _scopedSlots = {}
                        if (Array.isArray(scopedSlots)) {
                            _scopedSlots.default = function (prop) {
                                return scopedSlotsHandler(scopedSlots, prop)
                            }
                        } else {
                            for (let i in scopedSlots) {
                                if (isFunction(scopedSlots[i])) {
                                    _scopedSlots[i] = scopedSlots[i]
                                } else {
                                    if (!Array.isArray(scopedSlots[i])) {
                                        scopedSlots[i] = [scopedSlots[i]]
                                    }
                                    _scopedSlots[i] = prop => {
                                        return scopedSlotsHandler(scopedSlots[i], prop)
                                    }
                                }
                            }
                        }
                    } else {
                        _scopedSlots = scopedSlots
                    }

                    return _scopedSlots;
                }
            },
            {
                key: "_inject",
                value: function _inject(s) {
                    if (undefined === s.inject) return
                    let _props = s.props,
                    value = _props.row[_props.column.property || _props.column.prop],
                    _handler = function _handler(config, data) {
                        if (isString(config)) {
                            let rule = config.split('.')
                            if (rule.length > 1) {
                                let _val = value
                                switch (rule[0].toLowerCase()) {
                                    case 'object':
                                    case 'array':
                                        _val = [value]
                                        break;
                                    case 'number':
                                        _val = parseInt(value)
                                        break;
                                    case 'float':
                                        _val = parseFloat(value)
                                        break;
                                    case 'Boolean':
                                        _val = !!value
                                        break;
                                    case 'string':
                                    default:
                                }
                                data[rule[1]] = _val
                            } else {
                                data[config] = value
                            }
                        } else if(isFunction(s.inject)) {
                            s.inject(s)
                        } else {
                            for (let i in config) {
                                if (isNaN(i) && !data.hasOwnProperty(i)) {
                                    data[i] = {}
                                }
                                _handler(config[i], isNaN(i) ? data[i] : data)
                            }

                        }
                    }(s.inject, s)

                    delete s.inject
                }
            },
            {
                key: "run",
                value: function run() {
                    const vm = this.$vm, h = vm.$createElement
                    let [el, props, _children] = this._render()
                    this._bind(props, vm)
                    if (!isEmpty(props.scopedSlots)) props.scopedSlots = this._initScopedSlots(props.scopedSlots, props.props)
                    return h(el, props, this._initChildren(_children))
                }
            }
        ])
    }()

    const Creator = function () {
        return function () {
            const SURFACE_TABLE_NAME = "surfaceTable"

            let components = componentsInit([tableComponent, headerComponent, paginationComponent])

            function surfaceTableFrame() {
                return {
                    name: SURFACE_TABLE_NAME,
                    model: {
                        prop: "api",
                        event: "changeApi"
                    },
                    props: {
                        api: Object,
                        header: {
                            type: Object,
                            default() {
                                return {}
                            }
                        },
                        columns: {
                            type: Array,
                            required: true,
                            default() {
                                return []
                            }
                        },
                        options: {
                            type: Object,
                            required: true,
                            default: function () {
                                return {}
                            }
                        },
                        pagination: {
                            type: Object,
                            default: null
                        },
                    },
                    components,
                    beforeCreate: function beforeCreate() {
                        const vm$props = this.$options.propsData
                        this.surfaceTable = new SurfaceTable();
                        this.surfaceTable.beforeCreate(this);
                        this.surfaceTable.createHeader(vm$props.header)
                        this.surfaceTable.createTable(vm$props.columns, vm$props.options)
                        this.surfaceTable.createPagination(vm$props.pagination)
                        $surface = this.surfaceTable
                    },
                    created: function created() {
                        this.surfaceTable.created();
                    },
                    render: function render() {
                        return this.surfaceTable.render();
                    },
                    mounted: function mounted() {
                        this.surfaceTable.mounted();
                    }
                }
            }

            function extendSurfaceTable() {
                return Vue.extend(surfaceTableFrame());
            }

            function SurfaceTable() {
                classCallCheck(this, SurfaceTable);
            }

            let EL_TABLE_REF = '_el_table_ref'
            const SURFACE_TABLE_REF = '_surface_table_ref'
            const SURFACE_PAGINATION_REF = '_surface_pagination_ref'
            const SURFACE_HEADER_REF = '_surface_header_ref'

            function _create(options) {
                var $vm = new Vue({
                    data: function data() {
                        return options;
                    },
                    render: function render(h) {
                        return h(SURFACE_TABLE_NAME, {ref: SURFACE_TABLE_NAME,props: this.$data});
                    }
                });
                $vm.$mount();
                return $vm;
            }

            return createClass(SurfaceTable, [
                {

                    key: "table$Vm",
                    get: function table$Vm() {
                        return this.$vm.$refs[SURFACE_TABLE_REF].$refs[EL_TABLE_REF]
                    }
                },
                {

                    key: "pagination$Vm",
                    get: function pagination$Vm() {
                        return this.$vm.$refs[SURFACE_PAGINATION_REF]
                    }
                },
                {
                    key: "createTable",
                    value: function createTable(columns, options) {
                        EL_TABLE_REF = options.ref || EL_TABLE_REF

                        let on = {
                            'sort-change': (column) => {
                                this.$api.sortChange(column.prop, column.order ? column.order == 'descending' ? 'DESC' : 'ASC' : null)
                            }
                        }
                        for (let e in this.$vm._events) {
                            if (e !== 'changeApi') {
                                on[e] = this.$vm._events[e]
                            }
                        }

                        extendVm(options, {on, ref: EL_TABLE_REF, props: {data: []}})
                        this.table = new Render({
                            el: "s-table",
                            ref: SURFACE_TABLE_REF,
                            props: {
                                options: options,
                                columns
                            }
                        }, this.$vm)
                    }
                },
                {
                    key: "createPagination",
                    value: function createPagination(pagination) {
                        if (pagination) {
                            let that = this
                            let _w = document.documentElement.clientWidth
                            extendVm(pagination, {
                                props: {
                                    small: _w <= 800,
                                    total: 0,
                                    'pager-count': 5,
                                    layout: _w > 800 ? 'prev, pager, next, jumper, sizes, total' : 'prev, pager, next, jumper',
                                }
                            })
                            if (undefined != pagination.props.async) {
                                $setNx(pagination.props.async, 'data', {})
                            }

                            this.pagination = new Render({
                                el: "s-pagination",
                                ref: SURFACE_PAGINATION_REF,
                                props: {
                                    options: pagination,
                                }
                            }, this.$vm)
                        }
                    }
                },
                {
                    key: "createHeader",
                    value: function createHeader(header) {
                        if (header) {
                            this.header = new Render({
                                el: "s-header",
                                ref: SURFACE_HEADER_REF,
                                props: {
                                    options: {
                                        ...header
                                    },
                                }
                            }, this.$vm)
                        }
                    }
                },
                {
                    key: "beforeCreate",
                    value: function beforeCreate($vm) {
                        this.$vm = $vm
                    }
                },
                {
                    key: "created",
                    value: function created() {
                        if (this.$api === undefined) this.$api = Api(this);
                        this.$vm.$emit("changeApi", this.$api)
                    }
                },
                {
                    key: "render",
                    value: function render() {
                        const h = this.$vm.$createElement
                        return h('div', {key: this.$vm.key}, [
                            this.header ? this.header.run() : null,
                            this.table.run(),
                            this.pagination ? this.pagination.run() : null
                        ])
                    }
                },
                {
                    key: "mounted",
                    value: function mounted() {
                    }
                }], [
                {
                    key: "create",
                    value: function create($el, params) {
                        let $vm = _create(params)
                        $el.appendChild($vm.$el);
                        let _this = $vm.$refs[SURFACE_TABLE_NAME].surfaceTable
                        return $vm.api = _this.$api;
                    }
                },
                {
                    key: "install",
                    value: function install(Vue) {
                        if (Vue._installedsurfaceTable === true) return;
                        Vue._installedsurfaceTable = true;
                        Vue.component(SURFACE_TABLE_NAME, extendSurfaceTable());
                    }
                }
            ])

        }()
    }

    const css = ".el-pagination{padding: 30px !important;text-align: center}.col-editable{border-bottom:1px dashed #333;}.el-table__fixed-right::before, .el-table__fixed::before{z-index:0 !important}.el-dialog__body{padding:20px 10px 0px}"
    styleInject(css);

    let $surfaceTable = Creator(),
        install = $surfaceTable.install;

    if (typeof window !== "undefined") {
        window.surfaceTable = $surfaceTable;

        if (window.Vue) {
            install(window.Vue);
        }
    }

    exports.default = $surfaceTable;
})))
