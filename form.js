/**
 * surfaceForm@last
 * Gitee https://gitee.com/iszsw/surface-src
 * @author zsw zswemail@qq.com
 */
;(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("vue")) :
        typeof define === "function" && define.amd ? define(["exports", "vue"], factory) :
            (global = global || self, factory(global.surfaceForm = {}, global.Vue));
}(this, (function (exports, Vue) {
    "use strict";

    function defineProperties(target, props) {
        for (let i = 0; i < props.length; i++) {
            let descriptor = props[i];
            descriptor.enumerable = descriptor.enumerable || false;
            descriptor.configurable = true;
            if ("value" in descriptor) descriptor.ediform = true;
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
            if (isObject(target) || isArray(target)) {
                if (isArray(target)) {
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

    function extendVm(obj, ext, arrayCover = true) {
        if (isEmpty(obj)) return ext
        if (isArray(obj) && !arrayCover) {
            obj.push(...(isArray(ext) ? ext : [ext]))
        } else {
            for (let i in ext) {
                if (obj.hasOwnProperty(i)) {
                    if (isObject(ext[i]) || (isArray(ext[i]) && !arrayCover)) {
                        extendVm(obj[i], ext[i], arrayCover)
                    } else {
                        obj[i] = ext[i]
                    }
                } else {
                    $set(obj, i, ext[i])
                }
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
            i++;
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

    function isArray(arg) {
        return Array.isArray(arg)
    }

    function isObject(arg) {
        return arg != null
            && typeof arg === "object"
            && isArray(arg) === false
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

    let uuidKey = 1
    function uuid() {
        return uuidKey++ + ''
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
            if (isFunction(c)) {
                c = c.call(null)
            }
            components[c.name] = c
            return components
        }, {})
    }


    const NODE_ATTRS = ['el', 'children', 'class', 'style', 'attrs', 'props', 'domProps', 'on', 'nativeOn', 'directives', 'scopedSlots', 'slot', 'key', 'ref', 'refInFor'];
    function CE(obj, collect = 'element') {
        let data = {}
        data[collect] = {}
        for (let i in obj) NODE_ATTRS.indexOf(i) >= 0 ? data[collect][i] = obj[i] : data[i] = obj[i];
        return data
    }

    function Api($surfaceForm) {
        const $vm = $surfaceForm.$vm

        let hideDialog

        function callTableMethod(method) {
            let _l = arguments.length - 1
            let args = new Array(_l)
            for (let i = 0; i < _l; i++) {
                args[i] = arguments[i + 1];
            }
            return $surfaceForm.form$Vm[method].apply(null, args)
        }

        return {
            change(prop, val) {
                if (isEmpty(prop)) return false;
                $set($vm.options.props.model, prop, val)
            },
            model(prop = false) {
                return prop ? $vm.options.props.model[prop] || '' : $vm.options.props.model
            },
            submit() {
                return $surfaceForm.surfaceForm$Vm.submit()
            },
            hideDialog() {
                if (isFunction(hideDialog)) {
                    hideDialog()
                    hideDialog = null
                }
            },
            setHideDialog(f) {
                if (isFunction(f)) {
                    hideDialog = f
                }
            },
            validate(func) {
                return callTableMethod('validate', func)
            },
            validateField(func) {
                return callTableMethod('validateField', func)
            },
            resetFields() {
                return callTableMethod('resetFields')
            },
            clearValidate(func) {
                return callTableMethod('clearValidate', func)
            },
        }
    }

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
                    return this.props.el || "span"
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
                    if (isArray(children)) {
                        children = children.reduce(function (children, c) {
                            isEmpty(c) || children.push(isObject(c) && !(c instanceof VNode) ? new Render({...c}, vm).run() : c)
                            return children
                        }, [])
                    }
                    return children
                }
            },
            {
                key: "run",
                value: function run() {
                    const vm = this.$vm, h = vm.$createElement
                    let [el, props, _children] = this._render()
                    this._bind(props, vm)
                    return h(el, props, this._initChildren(_children))
                }
            }
        ])
    }()

    const RADIO_NAME = 'el-radio-group',
        UPLOAD_NAME = 's-upload',
        SELECT_NAME = 'el-select',
        CHECKBOX_NAME = 'el-checkbox-group',
        RATE_NAME = 'el-rate',
        INPUT_NAME = 'el-input',
        SWITCH_NAME = 'el-switch',
        SLIDER_NAME = 'el-slider',
        TIME_NAME = 'el-time-picker',
        DATE_NAME = 'el-date-picker',
        COLOR_NAME = 'el-color-picker',
        NUMBER_NAME = 'el-input-number',
        EDITOR_NAME = 's-editor',
        CASCADER_NAME = 'el-cascader',
        ARRAY_NAME = 's-array',
        TREE_NAME = 'el-tree',
        TAKE_NAME = 's-take',
        FORM_ITEM_NAME = 's-form-item',
        FORM_NAME = 's-form',
        SURFACE_FORM_NAME = 'surface-form',
        COMPONENT_NAME_ALIAS = {
            radio: RADIO_NAME,
            upload: UPLOAD_NAME,
            select: SELECT_NAME,
            checkbox: CHECKBOX_NAME,
            rate: RATE_NAME,
            input: INPUT_NAME,
            switch: SWITCH_NAME,
            slider: SLIDER_NAME,
            time: TIME_NAME,
            date: DATE_NAME,
            color: COLOR_NAME,
            number: NUMBER_NAME,
            editor: EDITOR_NAME,
            cascader: CASCADER_NAME,
            take: TAKE_NAME,
            array: ARRAY_NAME,
            tree: TREE_NAME,
        }

    let events = [], formComponents = {}, $surface

    const FORM_ITEM_COMPONENT = function () {
        return function () {
            return {
                name: FORM_ITEM_NAME,
                components: formComponents,
                props: {
                    model: Object,
                    el: {
                        type: String,
                        default: 'div'
                    },
                    prop: String,
                    label: String,
                    value: {
                        type: [String, Number, Object, Array, Boolean],
                    },
                    options: Array,
                    element: {
                        type: Object,
                        default: _ => {}
                    },
                    item: Object,
                    validate: {
                        type: Array,
                        default: function () {
                            return []
                        }
                    },
                    visible: [Object, Array]
                },
                data() {
                    return {
                        display: true
                    }
                },
                computed: {
                    isVisible() {
                        return isEmpty(this.visible) || this.checkVisible(this.visible)
                    }
                },
                watch: {
                    isVisible: {
                        handler() {
                            this.display = this.isVisible
                        },
                        immediate: true,
                        deep: true
                    }
                },
                methods: {
                    checkVisible(visible) {
                        if (isArray(visible)) {
                            for (let i = 0; i < visible.length; i++) {
                                if (!this.checkVisible(visible[i])) return false;
                            }
                            return true;
                        } else if (isObject(visible)) {
                            if (visible.prop && this.model.hasOwnProperty(visible.prop)) {
                                if (undefined !== visible.value) {
                                    return this.model[visible.prop] === visible.value
                                }else if (undefined !== visible.exec){
                                    try {
                                        let val = this.model[visible.prop]
                                        return eval(visible.exec)
                                    } catch (e) {
                                        console.error('字段[' + this.prop + '] visible 参数错误' + e.message)
                                    }
                                }
                            } else if (undefined !== visible.exec){
                                let that = this
                                return this.checkVisible(function (model) {
                                    try {
                                        return eval(visible.exec)
                                    } catch (e) {
                                        console.error('字段[' + that.prop + '] visible 参数错误' + e.message)
                                    }
                                })
                            }
                        } else if (isFunction(visible)) {
                            return visible.call(this, this.model)
                        }
                        return false
                    }
                },
                render(h) {
                    if (!this.display) return null;
                    if (isObject(this.item)) {
                        let item = {
                            el: 'elFormItem',
                            props: {
                                prop: this.prop,
                                label: this.label,
                                rules: this.validate,
                            },
                            children: [this.element]
                        }
                        extendVm(item, this.item, false)
                        return new Render(item, this).run()
                    } else {
                        return new Render({...this.element}, this).run()
                    }
                }
            }
        }
    }()

    const BUTTON_COMPONENT = function () {
        return function () {
            const NAME = "s-button"
            return {
                name: NAME,
                props: {
                    prop: {
                        type: Object
                    },
                    handler: { // submit:提交 | reset:重置
                        type: String,
                        default: ''
                    },
                    confirmMsg: { // 提示消息
                        type: String,
                        default: ''
                    },
                },
                methods: {
                    tap(event) {
                        event.stopPropagation()
                        this.confirmMsg ? this.$confirm(this.confirmMsg, "提示", {type: "warning"}).then(_=>this.$emit(this.handler)).catch(()=>{}) : this.$emit(this.handler);
                    },
                },
                render(h) {
                    let props = this.prop || {}
                    props = props.hasOwnProperty('props') ? props : {props: props}
                    return h("span", {style: {marginRight: "10px"}}, [h("el-button", {
                        ...props,
                        on: {click: this.tap}
                    })])
                }
            }
        }
    }()

    const FORM_COMPONENT = function () {
        return function () {
            let components = componentsInit([FORM_ITEM_COMPONENT, BUTTON_COMPONENT])
            return {
                name: FORM_NAME,
                props: {
                    model: Object,
                    onSubmit: Function,
                    submitBtn: [Object, Boolean],
                    resetBtn: [Object, Boolean],
                    async: Object,
                    columns: {
                        type: Array,
                        default: function () {
                            return []
                        }
                    },
                    element: {
                        type: Object,
                        default: _ => {}
                    },
                },
                data() {
                    return {
                        asyncData: {},
                        params: {}
                    }
                },
                created() {
                    if (this.async) this.asyncData = extend({
                        method: 'post',
                        data: {}
                    }, deepClone(this.async))

                    this.params = this.asyncData.data || {}
                },
                methods: {
                    reset() {
                        this.$emit('reset')
                    },
                    submit() {
                        let validate = true
                        this.$refs[this.element.ref].validate((valid, data) => {
                            if (!valid) {
                                for (let i in data) {
                                    data[i].forEach(v => {
                                        this.$message.error(v.message);
                                    })
                                }
                                return validate = false
                            }
                        })
                        if (!validate) return validate;

                        let params = Object.assign(this.params, this.model)

                        const then = function (params) {
                            if (!this.async) return;
                            return new Promise((resolve, reject) => {
                                request({...this.asyncData, data: params}).then(res => {
                                    if (res.code === undefined) return Promise.reject("返回格式错误，格式：{code: 0, data: [{},...] [, count: Number]}");
                                    if (res.code !== 0) return Promise.reject(res.msg || "请求错误");
                                    this.$message.success(res.msg || '操作成功');
                                    resolve(res.data);
                                }).catch((err, o) => {
                                    this.$message.error(err || '请求失败');
                                    o !== undefined && console.error(o)
                                    reject(err)
                                })
                            });
                        }.bind(this)

                        if (isFunction(this.onSubmit)) {
                            this.onSubmit(params, then)
                        }else{
                            then(params)
                        }
                    }
                },
                components,
                render() {
                    let btn = []
                    if (this.submitBtn !== false) {
                        btn.push(
                            extendVm(
                                isObject(this.submitBtn) ? deepClone(this.submitBtn) : {
                                    prop: {
                                        type: 'primary',
                                        icon: 'el-icon-check'
                                    }
                                }, {
                                    el: 's-button',
                                    props: {handler: 'submit'},
                                    on: {
                                        submit: this.submit
                                    }
                                }
                            )
                        )
                    }

                    if (this.resetBtn !== false) {
                        btn.push(
                            extendVm(
                                isObject(this.resetBtn) ? deepClone(this.resetBtn) : {
                                    prop: {
                                        icon: 'el-icon-refresh'
                                    }
                                }, {
                                    el: 's-button',
                                    props: {handler: 'reset'},
                                    on: {
                                        reset: this.reset
                                    }
                                }
                            )
                        )
                    }

                    let btnColumn = btn.length > 0 ? {
                        el: 'elFormItem',
                        class: 's-foot-btn',
                        children: btn
                    } : null;

                    return new Render({
                        el: 'elForm',
                        children: [...this.columns, btnColumn],
                        nativeOn:{
                            submit: event => event.preventDefault() // 阻止回车键提交
                        },
                        ...this.element
                    }, this).run()
                }
            }
        }
    }()

    const RADIO_COMPONENT = function () {
        return function () {
            return {
                name: RADIO_NAME,
                events: {
                    onInit(c) {
                        let options = [], group = !(c.props && c.props.group === false), name = c.prop + uuid()
                        if (c.options && isArray(c.options)) {
                            for (let op of c.options) {
                                if (group) {
                                    options.push({
                                        el: 'el-radio-button',
                                        props: {
                                            label: op.value,
                                            name: name
                                        },
                                        children: [op.label]
                                    })
                                } else {
                                    options.push({
                                        el: 'el-radio',
                                        props: {
                                            value: op.value,
                                            label: op.value,
                                            name: name,
                                        },
                                        children: [op.label]
                                    })
                                }
                            }
                        }

                        c.children = options
                    }
                }
            }
        }
    }()

    const CHECKBOX_COMPONENT = function () {
        return function () {
            return {
                name: CHECKBOX_NAME,
                events: {
                    onInit(c) {
                        let options = [], group = !(c.props && c.props.group === false),name = c.prop + uuid()
                        if (c.options && isArray(c.options)) {
                            for (let op of c.options) {
                                if (group) {
                                    options.push({
                                        el: 'el-checkbox-button',
                                        props: {
                                            label: op.value,
                                            name: name
                                        },
                                        children: [op.label]
                                    })
                                } else {
                                    options.push({
                                        el: 'el-checkbox',
                                        props: {
                                            value: op.value,
                                            label: op.value,
                                            name: name,
                                        },
                                        children: [op.label]
                                    })
                                }
                            }
                        }

                        if (!isArray(c.value)) c.value = []

                        c.children = options
                    }
                }
            }
        }
    }()

    const SELECT_COMPONENT = function () {
        return function () {
            return {
                name: SELECT_NAME,
                events: {
                    onInit(c) {
                        let options = []
                        if (c.options && isArray(c.options)) {
                            for (let op of c.options) {
                                options.push({
                                    el: 'el-option',
                                    props: {
                                        key: op.value,
                                        value: op.value,
                                        label: op.label
                                    },
                                    children: [op.label]
                                })
                            }
                        }
                        c.children = options
                    }
                }
            }
        }
    }()

    const UPLOAD_COMPONENT = function () {
        const format = function (url) {
            if (isArray(url)) {
                let data = [];
                let i = 1
                for (let i of url) {
                    data.push({
                        url: i,
                        uid: new Date().getTime() + i,
                        status: 'success'
                    })
                    i++
                }
                return data
            } else {
                return [{url: url}]
            }
        }, getUrl = function (list) {
            if (isArray(list)) {
                let data = [];
                for (let i of list) {
                    data.push(i.url)
                }
                return data
            } else {
                return [data.url]
            }
        }

        const cw = document.documentElement.clientWidth,
            ch = document.documentElement.clientHeight

        let uploadVm, dialogVisible = false

        return function () {
            return {
                name: UPLOAD_NAME,
                component: {
                    functional: !0,
                    props: {
                        manageUrl: String,
                        prop: String,
                        data: Object,
                        value: [Array, String],
                        model: Object,
                        label: {
                            type: String,
                            default: '操作'
                        },
                        limit: {
                            type: Number,
                            default: 1
                        },
                        uuid: Number
                    },
                    render(h, cxt) {
                        let props = cxt.props,
                            data = cxt.data,
                            prop = props.prop,
                            uploadRef = data.ref ? data.ref : prop + '_upload',
                            dialogRef = prop + '_dialog',
                            iframeId = prop + '_iframe',
                            _vm = $surface.$vm,
                            limit = props.limit || 1,
                            value = (undefined === props.value ? [] : props.value),
                            fileList = [],
                            hasManage = !!props.manageUrl,
                            manageVm = null,
                            dialogVm = null

                        if(!isArray(value) && limit > 1) {
                            value = value.toString().length > 0 ? [value] : []
                        }

                        let only = !isArray(value)

                        function changeDialog( visible, refresh = true ){
                            dialogVisible = visible
                            if (refresh) {
                                cxt.parent.$emit('_refresh')
                            }
                        }

                        if (hasManage) {
                            dialogVm = h("el-dialog", {
                                ref: dialogRef,
                                props: {
                                    visible: dialogVisible
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
                                        $surface.$api.setHideDialog(() => {
                                            changeDialog(false)
                                        })
                                    },
                                    close: () => {
                                        changeDialog(false)
                                    },
                                }
                            }, [
                                h("iframe", {
                                    attrs: {
                                        src: props.manageUrl,
                                        width: "100%",
                                        frameBorder: 0,
                                        id: iframeId
                                    },
                                    style: {
                                        height: cw <= 800 ? (ch - 80) + "px" : "calc(80vh - 150px)",
                                        border: "0 none"
                                    }
                                }),
                                h("div", {slot: "title"}, [
                                    h("span", [props.label]),
                                ]),
                                h("div", {slot: "footer"}, [
                                    h('elButton', {
                                        attrs: {type: 'text', size: "medium"},
                                        style: {marginLeft: "30px"},
                                        on: {
                                            click: () => {
                                                changeDialog(false)
                                            }
                                        }
                                    }, ['取消']),
                                    h('elButton', {
                                        attrs: {type: 'primary', size: "medium"},
                                        style: {marginLeft: "30px"},
                                        on: {
                                            click() {
                                                const iframe = document.getElementById(iframeId).contentWindow
                                                let selected = iframe.surface_selection
                                                if (undefined === selected) {
                                                    _vm.$message.error('子页面缺少变量 [surface_selection]')
                                                    return false
                                                }
                                                let fileList = cxt.parent.$refs[uploadRef].uploadFiles
                                                if (props.limit < selected.length + fileList.length) {
                                                    _vm.$message.error('最多选择 ' + props.limit + ' 个文件，还能选择 '+(props.limit - fileList.length)+' 个')
                                                    return false
                                                }

                                                fileList.push(...format(selected))
                                                let list = getUrl(fileList)
                                                changeDialog(false, false)
                                                cxt.parent.$emit('input', only ? list[0] : list)
                                            }
                                        }
                                    }, ['确认']),
                                ]),
                            ])
                        }

                        if (uploadVm) {
                            return h('div', null, [uploadVm, dialogVm])
                        }

                        if (hasManage) {
                            manageVm = h('div',
                                {
                                    slot: "tip",
                                    class: "el-upload el-upload--picture-card",
                                    on: {
                                        click: (event) => {
                                            event.stopPropagation()
                                            changeDialog(true)
                                        }
                                    }
                                },
                                [
                                    h('i', {class: 'el-icon-folder'})
                                ]
                            )
                        }

                        value && fileList.push(...format(value))

                        let attrs = extend(data, {ref: uploadRef})
                        attrs.props = Object.assign(attrs.props, {
                            'list-type': 'picture-card',
                            multiple: limit > 1,
                            limit,
                            fileList,
                            onSuccess: (res, f, fl) => {
                                if (res.code === undefined || res.code !== 0) {
                                    f.status = 'error'
                                    setTimeout(() => {fl.pop()}, 1500)
                                    _vm.$message.error(res.code === undefined ? "返回格式错误，格式：{code: 0, msg: '', data: {url:...}}} " : (res.msg || "上传失败"))
                                } else {
                                    f.url = res.data.url
                                    let list = fl.map(i => i.url)
                                    cxt.parent.$emit('input', only ? list[0] : list)
                                }
                            },
                            onRemove(file, fileList) {
                                let list = fileList.map(i => i.url)
                                cxt.parent.$emit('input', only ? '' : list)
                            },
                            onError: (r, f, fl) => {
                                _vm.$message.error('上传失败, 【 ' + r + ' 】');
                            },
                            onExceed(files, fileList) {
                                _vm.$message.error("最多上传 " + limit + "个文件");
                            }
                        })

                        uploadVm = h('el-upload', attrs, [
                            h('i', {class: 'el-icon-plus avatar-uploader-icon'}),
                            manageVm
                        ])
                        return h('div', null, [uploadVm, dialogVm])
                    }
                }
            }
        }
    }()

    const EDITOR_COMPONENT = function () {
        const cw = document.documentElement.clientWidth,
            ch = document.documentElement.clientHeight
        return function () {
            return {
                name: EDITOR_NAME,
                component: {
                    props: {
                        prop: String,
                        data: Object,
                        model: Object,
                        config: {
                            type: Object, default: _ => {
                            }
                        },
                        uploadUrl: String,
                        manageUrl: String,
                        typeName: {type: String, default: 'type'},
                        value: {type: String, required: true},
                    },
                    data: () => ({
                        id: '',
                        editor: null,
                        dialogShow: false,
                        frameId: ''
                    }),
                    created() {
                        this.frameId = this.prop + '_iframe_' + new Date().getTime()
                        this.id = this.prop + new Date().getTime()
                    },
                    mounted() {
                        setTimeout(_=>this.initEditor(), 0)
                    },
                    methods: {
                        initEditor(){
                            const E = window.wangEditor
                            this.editor = new E('#' + this.id)
                            let config = {...this.config}
                            config.customAlert = (str) => {
                                this.$message.error(str)
                            };
                            config.onchange = html => this.$emit('input', html)
                            config.zIndex = 99
                            if (this.uploadUrl === undefined) {
                                config.uploadImgShowBase64 = true
                            } else {
                                config.uploadImgServer = updateQueryStringParam(this.uploadUrl, this.typeName, 'image')
                                config.uploadVideoServer = updateQueryStringParam(this.uploadUrl, this.typeName, 'video')
                                config.uploadImgHooks = {
                                    customInsert: (insertImgFn, res) => {
                                        if (res.code === undefined || res.code !== 0) {
                                            this.$message.error(res.code === undefined ? "返回格式错误，格式：{code: 0, msg: ''}, data: {url:...}} " : (res.msg || "上传失败"))
                                        } else {
                                            insertImgFn(res.data.url)
                                        }
                                    }
                                }
                            }

                            for (let i in config) {
                                this.editor.config[i] = config[i]
                            }

                            if (this.manageUrl) {
                                let that = this
                                class ManageMenu extends wangEditor.PanelMenu {
                                    constructor(editor) {
                                        const $elem = E.$(
                                            `<div class="w-e-menu" data-title="图库"><i class="el-icon-folder-opened"></i></div>`
                                        );
                                        super($elem, editor);
                                    }

                                    clickHandler() {
                                        that.dialogShow = true
                                    }

                                    tryChangeActive() {
                                    }
                                }

                                this.editor.menus.extend("manage", ManageMenu);
                                this.editor.config.menus.splice(this.editor.config.menus.indexOf('image') + 1, 0, 'manage')
                            }

                            this.editor.create()
                            this.editor.txt.html(this.value)
                        },
                        appendImg(images) {
                            this.editor.cmd.do(
                                'insertHTML',
                                images.reduce((html, src) => html + `<img src="${src}" style="max-width:50%;"/>`, '')
                            )
                        }
                    },
                    render(h) {
                        return h('div', {}, [
                            h('div', {
                                attrs: {id: this.id},
                                style: {borderTop: '6px solid #222222'}
                            }),
                            undefined === this.manageUrl ? null : h("el-dialog", {
                                props: {
                                    visible: this.dialogShow,
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
                                    close: () => {
                                        this.dialogShow = false
                                    },
                                }
                            }, [
                                h("iframe", {
                                    attrs: {
                                        src: this.manageUrl,
                                        width: "100%",
                                        frameBorder: 0,
                                        id: this.frameId
                                    },
                                    style: {
                                        height: cw <= 800 ? (ch - 80) + "px" : "calc(80vh - 150px)",
                                        border: "0 none"
                                    }
                                }),
                                h("div", {slot: "title"}, [
                                    h("span", ['图库']),
                                ]),
                                h("div", {slot: "footer"}, [
                                    h('elButton', {
                                        attrs: {type: 'text', size: "medium"},
                                        style: {marginLeft: "30px"},
                                        on: {
                                            click: () => {
                                                this.dialogShow = false
                                            }
                                        }
                                    }, ['取消']),
                                    h('elButton', {
                                        attrs: {type: 'primary', size: "medium"},
                                        style: {marginLeft: "30px"},
                                        on: {
                                            click: () => {
                                                const iframe = document.getElementById(this.frameId).contentWindow
                                                let selected = iframe.surface_selection
                                                if (undefined === selected) {
                                                    this.$message.error('子页面缺少变量 [surface_selection]')
                                                    return false
                                                }
                                                this.appendImg(selected)
                                                this.dialogShow = false
                                            }
                                        }
                                    }, ['确认']),
                                ]),
                            ])
                        ])
                    },
                    beforeDestroy() {
                        this.editor.destroy()
                        this.editor = null
                    }
                }
            }
        }
    }()

    const CASCADER_COMPONENT = function () {
        return function () {
            return {
                name: CASCADER_NAME,
                events: {
                    onInit: function (c) {
                        c.props === undefined && (c.props = {})
                        let separator = c.props.separator || '/',
                            props = c.props

                        if (!isArray(c.value)) {
                            c.value = c.value.split(separator)
                        }

                        if (props.async) {
                            let ref = c.ref ? c.ref : (props.prop + '_cascader_' + new Date().getTime()),
                                _async = deepClone(props.async)

                            c.ref = ref

                            extendVm(c, {
                                props: {
                                    props: {
                                        lazy: true,
                                        lazyLoad(node, resolve) {
                                            if (node.isLeaf) return resolve();
                                            let value = node.level > 0 ? node.path : []
                                            _async.data = Object.assign(_async.data || {}, {value: value.join(separator)})
                                            return request(_async).then(function (res) {
                                                if (res.code === undefined) return Promise.reject("返回格式错误，格式：{code: 0, msg: ''} ");
                                                if (res.code !== 0) return Promise.reject(res.msg || "请求错误");
                                                resolve(res.data.list);
                                            }).catch(function (err, o) {
                                                $surface.$vm.$message.error(err || '请求失败');
                                                o !== undefined && console.error(o)
                                            })
                                        }
                                    },
                                }
                            })
                        }
                    }
                }
            }
        }
    }()

    const TAKE_COMPONENT = function () {
        const cw = document.documentElement.clientWidth,
            ch = document.documentElement.clientHeight

        return function () {
            return {
                name: TAKE_NAME,
                component: {
                    props: {
                        prop: String,
                        label: String,
                        url: String,
                        limit: {
                            type: Number,
                            default: 1
                        },
                        value: {
                            type: [Array, String, Number]
                        },
                        options: {
                            type: Array,
                            default() {
                                return []
                            }
                        },
                    },
                    created(){
                        let optionData = deepClone(this.options)
                        for (let op of optionData) {
                            if (
                                (!isArray(this.value) && this.value === op.value) ||
                                (isArray(this.value) && this.value.indexOf(op.value) >= 0)
                            ) {
                                this.optionData.push(op)
                            }
                        }
                        if(!isArray(this.value) && this.limit > 1) {
                            this.$emit('input', this.value.toString().length > 0 ? [this.value] : [])
                        }else if(!isArray(this.value)) {
                            this.only = true
                        }

                    },
                    data() {
                        return {
                            dialogShow: false,
                            optionData: [],
                            only: false
                        }
                    },
                    methods: {
                        remove(i) {
                            let val = this.optionData[i].value
                            this.optionData.splice(i, 1)
                            let values = deepClone(this.value)
                            if (this.only) {
                                values = ''
                            }else{
                                values.splice(values.indexOf(val), 1)
                            }
                            this.$emit('input', values)
                        },
                        append(option) {
                            let values = deepClone(this.value)
                            for (let op of option) {
                                this.optionData.push(op)
                                if (this.only) {
                                    values = op.value
                                }else{
                                    values.push(op.value)
                                }
                            }
                            this.$emit('input', values)
                        }
                    },
                    render(h) {
                        const iframeId = this.prop + '_iframe_' + new Date().getTime()

                        let c = []
                        this.optionData.forEach((op, i) =>{
                            c.push(h('div', {class: 'c-take-box'}, [
                                h('i', {
                                    class: 'el-icon-close c-take-delete', on: {
                                        click: () => {
                                            this.remove(i)
                                        }
                                    }
                                }),
                                h('span', {
                                    domProps: {innerHTML: op.label},
                                    class: 'c-take-content'
                                })
                            ]))
                        })

                        return h('div', {}, [c,
                            h('el-button', {
                                class: 'el-icon-plus c-take-add',
                                props: {circle: true, size: 'mini'},
                                on: {
                                    click: () => {
                                        this.dialogShow = true
                                    }
                                }
                            }),
                            h("el-dialog", {
                                props: {
                                    visible: this.dialogShow,
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
                                    close: () => {
                                        this.dialogShow = false
                                    },
                                }
                            }, [
                                h("iframe", {
                                    attrs: {
                                        src: this.url,
                                        width: "100%",
                                        frameBorder: 0,
                                        id: iframeId
                                    },
                                    style: {
                                        height: cw <= 800 ? (ch - 80) + "px" : "calc(80vh - 150px)",
                                        border: "0 none"
                                    }
                                }),
                                h("div", {slot: "title"}, [
                                    h("span", [this.label]),
                                ]),
                                h("div", {slot: "footer"}, [
                                    h('elButton', {
                                        attrs: {type: 'text', size: "medium"},
                                        style: {marginLeft: "30px"},
                                        on: {
                                            click: () => {
                                                this.dialogShow = false
                                            }
                                        }
                                    }, ['取消']),
                                    h('elButton', {
                                        attrs: {type: 'primary', size: "medium"},
                                        style: {marginLeft: "30px"},
                                        on: {
                                            click: () => {
                                                const iframe = document.getElementById(iframeId).contentWindow
                                                let $table = iframe.$surfaceTable, selection = undefined
                                                if ($table) {
                                                    let pk = $table.getPk()
                                                    let selected = $table.getSelections()
                                                    if (selected.length > 0) {
                                                        selection = []
                                                        selected.forEach(row => {
                                                            let value = row[pk]
                                                            selection.push({
                                                                value, label: row._selection || value
                                                            })
                                                        })
                                                    }
                                                } else {
                                                    // 格式 surface_selection = [{label: '', value: ''}, ...]
                                                    selection = iframe.surface_selection
                                                }

                                                if (undefined === selection) {
                                                    this.$message.error('子页面缺少变量 [surface_selection]')
                                                    return false;
                                                }

                                                if (selection.length === 0) {
                                                    return;
                                                }

                                                if (
                                                    (this.only && (selection.length > 1 || this.value !== '')) ||
                                                    (this.limit < selection.length + this.value.length)
                                                ) {
                                                    this.$message.error('最多选择 ' + this.limit + ' 个文件')
                                                    return false
                                                }

                                                this.append(selection)
                                                this.dialogShow = false
                                            }
                                        }
                                    }, ['确认']),
                                ]),
                            ])
                        ])
                    },
                },
                events: {
                    onInit(c) {
                        // c.value = isArray(c.value) ? c.value : c.value ? [c.value] : []
                    }
                }
            }
        }
    }()

    const ARRAY_COMPONENT = function () {
        let rowDefault = function (border = true, title = false) {
            return {
                el: 'el-row',
                style: {
                    padding: title || !border ? '0px 30px 5px 10px' : '10px 30px 10px 10px',
                    border: border ? '1px dashed #d9d9d9' : '0',
                    marginBottom: title || !border ? '0' : '10px'
                },
            }
        }, colDefault = function (span) {
            return {
                el: 'el-col',
                style: {padding: '1px 5px'},
                props: {span},
            }
        }

        return function () {
            return {
                name: ARRAY_NAME,
                component: {
                    props: {
                        options: {
                            type: Array,
                            default() {
                                return []
                            }
                        },
                        value: {
                            type: Array,
                            default() {
                                return []
                            }
                        },
                        span: {
                            type: Number,
                            default: 0
                        },
                        title: { // 显示标题
                            type: Boolean,
                            default: true,
                        },
                        append: { // 允许扩展
                            type: Boolean,
                            default: true,
                        },
                        json: { // 格式化为json格式 只有键值两个参数时候有效
                            type: Boolean,
                            default: false,
                        },
                    },
                    components: componentsInit([FORM_ITEM_COMPONENT]),
                    methods: {
                        input(index, prop, value) {
                            let _value = deepClone(this.value)
                            _value[index][prop] = value
                            this.$emit('input', _value)
                        },
                        add() {
                            let _value = deepClone(this.value)
                            _value.push(deepClone(this.original))
                            this.$emit('input', _value)
                        },
                        del(index) {
                            let _value = deepClone(this.value)
                            $delete(_value, index)
                            this.$emit('input', _value)
                        }
                    },
                    data() {
                        return {
                            original: {},
                            colSpan: this.span,
                        }
                    },
                    created() {
                        this.original = this.options.reduce((original, o) => {
                            original[o.prop] = o.value || ''
                            return original
                        }, {})
                        this.colSpan = this.span > 0 ? this.span : parseInt(24 / this.options.length)
                    },
                    render() {
                        let children = this.value.reduce((columns, v, i) => {
                            let val = {},
                                rowChildren = deepClone(this.options).reduce((options, o) => {
                                    o.value = '';
                                    if(v.hasOwnProperty(o.prop)) {
                                        o.value = v[o.prop]
                                    }else if (o.hasOwnProperty('value')){
                                        o.value = o.value
                                    }
                                    let c = $surface._initColumns(o, val)

                                    const input = value => this.input(i, o.prop, value)
                                    if (c.props.element) {
                                        c.props.element.on.input = input
                                    }else{
                                        c.on.input = input
                                    }
                                    options.push(extend(colDefault(this.colSpan), {children: [c]}))
                                    return options
                                }, [])

                            if (this.append) {
                                rowChildren.push({
                                    el: 'el-button',
                                    props: {icon: 'el-icon-close', type: 'text', size: 'small'},
                                    class: 'c-array-del',
                                    on: {
                                        click: () => {
                                            this.del(i)
                                        }
                                    }
                                })
                            }

                            columns.push(extend(rowDefault(this.colSpan === 24), {
                                children: rowChildren
                            }))
                            return columns
                        }, [])

                        if (this.title && this.value.length > 0) {
                            children.unshift(extend(rowDefault(this.colSpan === 24, true), {
                                el: 'el-row',
                                children: this.options.reduce((options, o) => {
                                    options.push(extend(colDefault(this.colSpan), {children: [o.label]}))
                                    return options
                                }, [])
                            }))
                        }

                        if (this.append) {
                            children.push(extend(rowDefault(false), {
                                el: 'el-row',
                                children: [
                                    extend(colDefault(this.colSpan), {
                                        children: [
                                            {
                                                el: 'el-button',
                                                props: {
                                                    icon: 'el-icon-plus',
                                                    circle: !0,
                                                    size: 'small'
                                                },
                                                on: {click: this.add}
                                            }
                                        ]
                                    })
                                ]
                            }))
                        }

                        return new Render({el: 'div', children}, this).run()
                    }
                },
                events: {
                    onInit: function (c) {
                        if (!isArray(c.value)) {
                            c.value = []
                        }
                    }
                }
            }
        }
    }()

    const TREE_COMPONENT = function () {
        return function () {
            return {
                name: TREE_NAME,
                events: {
                    onInit: function (c) {
                        if (!isArray(c.value)) c.value = c.value ? [c.value] : [];
                        if (c.props['show-checkbox'] || c.props['showCheckbox']) {
                            if (c.props && !c.props['node-key']) {
                                c.props['node-key'] = 'id'
                            }
                            extendVm(c, {
                                on:{
                                    check(data, node){
                                        this.$emit('input', node.checkedKeys)
                                    }
                                }
                            })
                        }
                    }
                }
            }
        }
    }()

    const Creator = function () {
        return function () {
            function surfaceFormFrame() {
                return {
                    name: SURFACE_FORM_NAME,
                    model: {
                        prop: "api",
                        event: "changeApi"
                    },
                    props: {
                        api: Object,
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
                    },
                    components: componentsInit([FORM_COMPONENT]),
                    beforeCreate: function beforeCreate() {
                        this.surfaceForm = new SurfaceForm();
                        this.surfaceForm.beforeCreate(this);
                        const vm$props = this.$options.propsData
                        this.surfaceForm.createForm(vm$props.columns, vm$props.options)
                        $surface = this.surfaceForm
                    },
                    created: function created() {
                        this.surfaceForm.created();
                    },
                    render: function render() {
                        return this.surfaceForm.render();
                    },
                    mounted: function mounted() {
                        this.surfaceForm.mounted();
                    }
                }
            }

            function extendSurfaceForm() {
                return Vue.extend(surfaceFormFrame());
            }

            function SurfaceForm() {
                classCallCheck(this, SurfaceForm);
            }

            let EL_FORM_REF = 'el_form_ref'
            const SURFACE_FORM_REF = 'surface_form_ref'

            let config = {
                options: {
                    submitBtn: {
                        props: {
                            prop: {
                                type: 'primary',
                                icon: 'el-icon-check'
                            },
                            confirmMsg: '',
                        }
                    },
                    resetBtn: false,
                    props: {
                        'label-width': "100px",
                        model: {}
                    }
                }
            }

            function _create(options) {
                extendVm(config, options)
                let $vm = new Vue({
                    data: function data() {
                        return config;
                    },
                    render: function render(h) {
                        return h(SURFACE_FORM_NAME, {ref: SURFACE_FORM_NAME, props: this.$data});
                    }
                }).$mount();
                return $vm;
            }

            return createClass(SurfaceForm, [
                {

                    key: "surfaceForm$Vm",
                    get: function surfaceForm$Vm() {
                        return this.$vm.$refs[SURFACE_FORM_REF]
                    }
                },
                {

                    key: "form$Vm",
                    get: function form$Vm() {
                        return this.surfaceForm$Vm.$refs[EL_FORM_REF]
                    }
                },
                {
                    key: "createForm",
                    value: function createForm(columns, options) {
                        EL_FORM_REF = options.ref || EL_FORM_REF
                        let model = options.props.model || {}
                        columns = this._initColumns(columns, model)
                        extendVm(options, {ref: EL_FORM_REF, props: {model}})

                        this.form = new Render({
                            el: FORM_NAME,
                            ref: SURFACE_FORM_REF,
                            props: {
                                columns,
                                model,
                                ...CE(options, 'element')
                            },
                            on: {
                                reset: () => {
                                    this.$api.resetFields()
                                }
                            }
                        }, this.$vm)
                    }
                },
                {
                    key: "_initColumns",
                    value: function _initColumns(column, model) {
                        if (isArray(column)) {
                            column.forEach((v, k) => {
                                $set(column, k, this._initColumns(v, model))
                            })
                            return column
                        } else {
                            if (!isObject(column)) return column;
                            let el = column.el.toLowerCase()
                            el = undefined === COMPONENT_NAME_ALIAS[el] ? el : COMPONENT_NAME_ALIAS[el]

                            if (events.hasOwnProperty(el) && events[el].hasOwnProperty('onInit')) {
                                events[el].onInit.map(f => {
                                    f.call(this, column)
                                })
                            }

                            if (model && !isEmpty(column.prop)) {
                                if (model.hasOwnProperty(column.prop)) {
                                    column.value = model[column.prop]
                                }else{
                                    $set(model, column.prop, column.hasOwnProperty('value') ? column.value : '')
                                }
                            }

                            if (!isEmpty(column.children)) {
                                column.children = this._initColumns(column.children, model)
                            }

                            if (COMPONENT_NAME_ALIAS.hasOwnProperty(column.el)) {
                                $set(column, 'el', COMPONENT_NAME_ALIAS[column.el])
                            }

                            if (!isEmpty(column.item) && !isEmpty(column.item.children)) {
                                column.item.children = this._initColumns(column.item.children, model)
                            }

                            if (!column.hasOwnProperty('props')) {
                                $set(column, 'props', {})
                            }

                            let props = {};

                            const input = val => {
                                this.$api.change(column.prop, val)
                                props.element.props.value = val
                            }

                            const _refresh = () => {
                                props.element.props.uuid++
                            }

                            column.el = COMPONENT_NAME_ALIAS.hasOwnProperty(column.el) ? COMPONENT_NAME_ALIAS[column.el] : column.el
                            if (!isEmpty(column.prop)) {
                                $set(column.props, 'model', model)

                                if (!column.hasOwnProperty('on')) {
                                    $set(column, 'on', {})
                                }
                                column.on.input = input
                                column.on._refresh = _refresh
                                extendVm(column.props, {
                                    prop: column.prop,
                                    label: column.label,
                                    value: model[column.prop],
                                    uuid: 1,
                                })
                            }

                            column.props.options = column.options || []
                            return false === column.item ? column : {
                                el: FORM_ITEM_NAME,
                                on:{input, _refresh},
                                props: {
                                    ...props = CE(column, 'element'),
                                    model
                                }
                            }
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
                        return this.form.run()
                    }
                },
                {
                    key: "mounted",
                    value: function mounted() {
                    }
                },
            ], [
                {
                    key: "create",
                    value: function create($el, params) {
                        let $vm = _create(params)
                        $el.appendChild($vm.$el);
                        let _this = $vm.$refs[SURFACE_FORM_NAME].surfaceForm
                        return $vm.api = _this.$api;
                    }
                },
                {
                    key: "install",
                    value: function install(Vue) {
                        if (Vue._installedSurfaceForm === true) return;
                        Vue._installedSurfaceForm = true;
                        Vue.component(SURFACE_FORM_NAME, extendSurfaceForm());
                    }
                }, {
                    key: "component",
                    value: function component(component) {
                        if (isArray(component)) {
                            component.map(SurfaceForm.component)
                        } else {
                            if (isFunction(component)) {
                                component = component.call(null)
                            }

                            if (component.hasOwnProperty('events')) {
                                if (!events.hasOwnProperty(component.name)) {
                                    events[component.name] = {}
                                }
                                for (let e in component.events) {
                                    if (!events[component.name].hasOwnProperty(e)) {
                                        events[component.name][e] = []
                                    }
                                    isArray(component.events[e]) ?
                                        events[component.name][e].concat(component.events[e]) :
                                        events[component.name][e].push(component.events[e])

                                }
                            }

                            if (component.hasOwnProperty('component')) {
                                formComponents[component.name] = component.component
                            }

                            if (!component.hasOwnProperty('events') && !component.hasOwnProperty('component')) {
                                formComponents[component.name] = component
                            }

                        }
                    }
                },
            ])

        }()
    }

    let $surfaceForm = Creator(),
        install = $surfaceForm.install,
        css = '.el-dialog__body{padding:5px 0}.el-upload.el-upload--picture-card{width:100px;height:100px;line-height:100px;position:relative;overflow:hidden;margin-right:10px}.el-upload--picture-card i{font-size:20px;color:#8c939d}.avatar-uploader .el-upload:hover{border-color:#409eff}.avatar-uploader-icon{font-size:28px;color:#8c939d;width:100px;height:100px;text-align:center}.el-upload-list--picture-card .el-upload-list__item{width:100px;height:100px}.c-take-box{padding-left:45px;position:relative;display:inline-block}.c-take-delete{position:absolute;left:25px;top:50%;transform:translateY(-50%);color:#a4a4a4;cursor:pointer}.c-take-add{margin-left:20px}.c-take-content>img{width:40px;height:40px;vertical-align:middle}.c-array-del{top:50%;right:5px;font-size:16px;position:absolute;transform:translateY(-50%)}.w-e-toolbar .w-e-menu i{color:#222!important}.w-e-toolbar .w-e-active i{color:#003cff!important}.s-marker{margin-bottom:0;font-style:italic;font-size:12px;color:#a4a4a4;display:block;line-height:20px}.el-form-item{padding:5px}.hidden{display:none}';

    styleInject(css);

    $surfaceForm.component(
        [
            RADIO_COMPONENT,
            CHECKBOX_COMPONENT,
            SELECT_COMPONENT,
            UPLOAD_COMPONENT,
            EDITOR_COMPONENT,
            CASCADER_COMPONENT,
            TAKE_COMPONENT,
            ARRAY_COMPONENT,
            TREE_COMPONENT
        ], formComponents)

    if (typeof window !== "undefined") {
        window.surfaceForm = $surfaceForm;

        if (window.Vue) {
            install(window.Vue);
        }
    }

    exports.default = $surfaceForm;
})))
