/**
 * surfaceForm
 * Gitee https://gitee.com/iszsw/surface
 * @author zsw zswemail@qq.com
 */
;(function (global, factory) {
    typeof exports === "object" && typeof module !== "undefined" ? factory(exports, require("vue")) :
        typeof define === "function" && define.amd ? define(["exports", "vue"], factory) :
            (global = global || self, factory(global.surfaceForm = {}, global.Vue));
}(this, (function (exports, Vue) {
    "use strict";
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

    function isType(arg, type) {
        return Object.prototype.toString.call(arg) === "[object " + type + "]";
    }

    function isFunction(arg) {
        return isType(arg, "Function");
    }

    function isObject(arg) {
        return arg != null
            && typeof arg === "object"
            && Array.isArray(arg) === false
    }

    function isString(arg) {
        return isType(arg, "String");
    }

    function isEmpty(arg) {
        return arg == false || arg === undefined || arg.length === 0
    }

    function extendObj(obj, ext, cover = true) {
        if (isEmpty(obj)) return ext
        for (let i in ext) {
            if (obj.hasOwnProperty(i)) {
                if (isObject(ext[i]) || Array.isArray(ext[i])) {
                    extendObj(obj[i], ext[i], cover)
                } else {
                    cover && (obj[i] = ext[i])
                }
            } else {
                obj[i] = ext[i]
            }
        }
        return obj
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
        if (uri) {
            if (typeof key == 'string' && value !== null) {
                var re = new RegExp("([?&])" + key + "=.*?(&|$)", "i");
                var separator = uri.indexOf('?') !== -1 ? "&" : "?";
                if (uri.match(re)) {
                    return uri.replace(re, '$1' + key + "=" + value + '$2');
                } else {
                    return uri + separator + key + "=" + value;
                }
            } else if (typeof key == 'object') {
                for (let k in key) {
                    uri = updateQueryStringParam(uri, k, key[k])
                }
            }
        }
        return uri;
    }

    function request(config) {
        return new Promise((resolve, reject) => {
            _axios(config).then(res => {
                resolve(res.data);
            }).catch(err => {
                reject(err)
            })
        });
    }

    const EDITOR_COMPONENT = function () {
        const NAME = 'editor'
        let _k,$vm
        return {
            name: NAME,
            component: {
                name: NAME,
                render(h) {
                    $vm = this
                    return h('textarea', {"name": this.formCreateField}, [this.value])
                },
                props: {
                    value: String,
                    formCreateField: String,
                    theme: {
                        type: String,
                        default: "black"
                    },
                    items: Array,
                    editorUploadUrl: String,
                    editorManageUrl: String,
                    editorMediaUrl: String,
                    editorFlashUrl: String,
                    editorFileUrl: String
                },
                methods: {
                    initEditor() {
                        undefined != _k && _k.create('textarea[name="' + this.formCreateField + '"]', {
                            items: this.items ? this.items : [
                                'source', 'undo', 'redo', 'preview', 'print', 'template', 'code', 'quote', 'selectall', 'cut', 'copy', 'paste', 'plainpaste', 'wordpaste', 'quickformat',
                                '/', 'image', 'multiimage', 'graft', 'flash', 'media', 'insertfile', 'table', 'hr', 'emoticons', 'baidumap', 'pagebreak', 'anchor', 'link', 'unlink', 'fullscreen', 'removeformat', 'clearhtml',
                                '/', 'justifyleft', 'justifycenter', 'justifyright', 'justifyfull', 'insertorderedlist', 'insertunorderedlist', 'indent', 'outdent', 'subscript',
                                'superscript', 'formatblock', 'fontname', 'fontsize', 'forecolor', 'hilitecolor', 'bold', 'italic', 'underline', 'strikethrough', 'lineheight'
                            ],
                            width: '100%',
                            filePostName: 'file',
                            uploadJson: updateQueryStringParam(this.editorUploadUrl, 'from', 'editor'),
                            fileManagerJson: updateQueryStringParam(this.editorManageUrl, 'from', 'editor'),
                            allowImageUpload: this.editorManageUrl ? true : false,
                            allowMediaUpload: this.editorMediaUrl ? true : false,
                            allowFileUpload: this.editorFileUrl ? true : false,
                            allowFileManager: this.editorFileUrl ? true : false,
                            allowFlashUpload: this.editorFlashUrl ? true : false,
                            allowFlashManage: this.editorFlashUrl ? true : false,
                            themeType: this.theme,
                            afterChange: () => {
                                this.$emit('input', $('textarea[name="' + this.formCreateField + '"]').val());
                            },
                            errorMsgHandler: (message, type) => {
                                if (type === 'ok') {
                                    this.$message.success(message);
                                } else {
                                    this.$message.error(message);
                                }
                            }
                        });
                    }
                },
                beforeDestroy() {
                    _k.remove('textarea[name="' + this.formCreateField + '"]');
                },
                mounted(){
                    this.initEditor()
                }
            },
            events: {
                onInit: function (c) {
                    undefined === _k && KindEditor.ready( function(K) {
                        _k = K
                        $vm.initEditor()
                    });
                    if (!c.hasOwnProperty('props')) {
                        c.props = {}
                    }
                    c.props.name = c.field
                }
            }
        }
    }()

    const TAKE_COMPONENT = function () {
        const NAME = 'take'
        return {
            name: NAME, component: {
                name: NAME,
                render(h) {
                    return h('div', {}, [
                        this.formCreateOptions.map((v) => {
                            return h('div', {class: 's-take-box'}, [
                                h('i', {
                                    class: 'el-icon-close s-take-delete', on: {
                                        click: () => {
                                            this.remove(v)
                                        }
                                    }
                                }),
                                h('span', {domProps: {innerHTML: v.label}, class: 's-take-content'})
                            ])
                        }),
                        h('el-button', {
                            class: 'el-icon-plus s-take-add',
                            props: {circle: true, size: 'mini'},
                            on: {click: this.tapAppend}
                        }),
                    ])
                },
                methods: {
                    remove(option) {
                        let rule = this.formCreate.getRule(this.formCreateField)
                        rule.options.splice(this.formCreateOptions.indexOf(option), 1)
                        rule.value.splice(this.value.indexOf(option.value), 1)
                    },
                    append(option) {
                        if (Array.isArray(option)) {
                            option.map(this.append)
                        } else {
                            let rule = this.formCreate.getRule(this.formCreateField)
                            if (!this.unique || this.value.indexOf(option.value) < 0) {
                                rule.value.push(option.value)
                                rule.options.push(option)
                            }
                        }
                    },
                    tapAppend() {
                        let that = this, id = 'take-' + this.formCreateField
                        let rule = this.formCreate.getRule(this.formCreateField)
                        _vm.$confirm(_vm.$createElement("iframe", {
                            attrs: {src: this.src, class: 'manage-img', id},
                        }), rule.title, {
                            confirmButtonText: '确定',
                            showCancelButton: false,
                            customClass: 'upload-box',
                            dangerouslyUseHTMLString: true,
                            beforeClose(action, instance, done) {
                                if (action === 'confirm') {
                                    instance.confirmButtonLoading = true;
                                    const iframe = document.getElementById(id).contentWindow
                                    let $table = iframe.$surfaceTable, selection = undefined
                                    if ($table) {
                                        let pk = $table.getPk()
                                        let selected = $table.getSelections()
                                        if (selected.length > 0) {
                                            selection = []
                                            selected.forEach(row => {
                                                let value = row[pk]
                                                selection.push({
                                                    value: value,
                                                    label: row._selection || value
                                                })
                                            })
                                        }
                                    } else {
                                        selection = iframe.surface_selection
                                    }

                                    if (undefined === selection) {
                                        _vm.$message.error('子页面缺少变量 [surface_selection]')
                                        instance.confirmButtonLoading = false;
                                        return false
                                    }

                                    if (!Array.isArray(selection)) {
                                        selection = [selection]
                                    }

                                    if (that.maxLength < selection.length + that.value.length) {
                                        _vm.$message.error('最多选择 ' + that.maxLength + ' 个文件')
                                        instance.confirmButtonLoading = false;
                                        return false
                                    }

                                    that.append(selection)
                                    instance.confirmButtonLoading = false;
                                }
                                done();
                            },
                        }).then(action => {
                        }).catch(r => {
                            if (r !== 'cancel') {
                                _vm.$message.error(r.message || '获取失败')
                            }
                        })
                    }
                },
                data() {
                    return {}
                },
                props: {
                    src: String,
                    unique: {
                        type: Boolean,
                        default: true
                    },
                    value: Array,
                    maxLength: Number,
                    formCreate: Object,
                    formCreateField: String,
                    formCreateOptions: Array,
                },
            },
            events: {
                onInit: function (c, global) {

                }
            },
        }
    }()

    const UPLOAD_COMPONENT = function () {
        const NAME = 'upload'
        return {
            name: NAME,
            events: {
                onInit: function (c, global) {
                    extendObj(c, global, false)
                    c.props.data || (c.props.data = {})
                    if (!c.props.data.type) {
                        c.props.data.type = c.props.uploadType
                    }
                    c.props.onSuccess = (r, f, fl) => {
                        if (r.code === 0) {
                            f.url = r.data.url
                        } else {
                            _vm.$message.error("文件【" + f.name + "】 " + (r.msg || "上传失败"));
                            fl.pop()
                        }
                    }
                    c.props.onError = (r, f, fl) => {
                        _vm.$message.error('上传失败, 【 ' + r + ' 】');
                    }
                    c.props.onExceed = (files, fileList) => {
                        _vm.$message.error("最多上传 " + c.props.maxLength + "个文件");
                    }

                    if (!Array.isArray(c.value)) {
                        c.value = c.value ? [c.value] : []
                    }

                    if (c.props.manageUrl) {
                        let manageClick = (event) => {
                            event.stopPropagation()
                            let id = 'upload-manage-' + c.field
                            c.props.manageUrl = updateQueryStringParam(c.props.manageUrl, {_type: c.props.data.type})
                            _vm.$confirm(_vm.$createElement("iframe", {
                                attrs: {src: c.props.manageUrl, class: 'manage-img', id: id},
                            }), '图库', {
                                confirmButtonText: '确定',
                                showCancelButton: false,
                                customClass: 'upload-box',
                                dangerouslyUseHTMLString: true,
                                beforeClose(action, instance, done) {
                                    if (action === 'confirm') {
                                        instance.confirmButtonLoading = true;
                                        const iframe = document.getElementById(id).contentWindow
                                        let selected = iframe.surface_selection
                                        if (undefined === selected) {
                                            _vm.$message.error('子页面缺少变量 [surface_selection]')
                                            instance.confirmButtonLoading = false;
                                            return false
                                        }

                                        if (!Array.isArray(selected)) {
                                            selected = [selected]
                                        }

                                        if (c.props.maxLength < selected.length + c.value.length) {
                                            _vm.$message.error('最多选择 ' + c.props.maxLength + ' 个文件')
                                            instance.confirmButtonLoading = false;
                                            return false
                                        }
                                        c.value.push(...selected)
                                        instance.confirmButtonLoading = false;
                                    }
                                    done();
                                },
                            }).then(action => {
                            }).catch(r => {
                                if (r !== 'cancel') {
                                    _vm.$message.error(r.message || '上传失败')
                                }
                            })
                        }

                        if (!c.hasOwnProperty('children')) {
                            c.children = []
                        }
                        c.children.push({
                            type: "div",
                            slot: "tip",
                            class: "fc-upload-btn",
                            children: [{
                                type: "i",
                                class: "el-icon-folder",
                            }],
                            on: {
                                click: manageClick
                            }
                        })
                    }
                }
            },
        }
    }()

    let _vm = new Vue()

    let styleInit = false

    const Creator = function () {
        return function () {

            let events = {}
            function SurfaceForm(columns, options) {
                classCallCheck(this, SurfaceForm);
                this.columns = columns
                this.options = options

                if (!styleInit && options.submitBtn !== false) {
                    let id = '#' + this.options.el.id
                    if (this.options.submitBtn || this.options.onSubmit === undefined || this.options.resetBtn || this.options.resetBtn === undefined) {
                        styleInject(id + '{padding-bottom: 60px !important;}' + id + '>.form-create>.el-row>.el-col:last-of-type{position:fixed;bottom: 0px;padding:10px;text-align:center;z-index:1999;background-color: #fff}' + id + '>.form-create>.el-row>.el-col:last-of-type>.el-form-item{margin:0}' + id + '>.form-create>.el-row>.el-col:last-of-type>.el-form-item>.el-form-item__content{margin:0 !important}');
                    }
                    styleInit = true
                }
                this.init()
            }

            return createClass(SurfaceForm, [
                {
                    key: 'create',
                    value: function create() {
                        return this.fc = formCreate.create(this.columns, this.options)
                    },
                },
                {
                    key: 'init',
                    value: function init() {
                        this._initOptions()
                        this._initColumns()
                    },
                },
                {
                    key: 'onSubmit',
                    value: function onSubmit(data) {
                        if (this.async) {
                            let params = deepClone(this.async)
                            params.data = Object.assign(params.data || {}, data)
                            return request(params).then(function (res) {
                                if (res.code === undefined) return Promise.reject("返回格式错误，格式：{code: 0, msg: ''} ");
                                if (res.code !== 0) return Promise.reject(res.msg || "请求错误");
                                _vm.$message.success(res.msg || '提交成功');
                                setTimeout(() => {
                                    const iframe = window.parent
                                    let $table = iframe.$surfaceTable
                                    if ($table && $table.hideDialog) {
                                        $table.hideDialog()
                                    }
                                }, 2000)
                            }).catch(function (err, o) {
                                _vm.$message.error(err || '请求失败');
                                o !== undefined && console.error(o)
                            })
                        }
                    },
                },
                {
                    key: '_initOptions',
                    value: function init() {
                        this.async = this.options.async ? Object.assign({
                            method: 'post',
                            url: ''
                        }, this.options.async || {}) : null
                        delete this.options.async;

                        let submitFunc = this.options.onSubmit

                        const then = this.onSubmit.bind(this),
                            onSubmit = function (data) {
                                if (isFunction(submitFunc)) {
                                    submitFunc.call(this, data, then)
                                } else {
                                    then(data)
                                }
                            }
                        this.options.onSubmit = onSubmit

                    }
                },
                {
                    key: '_initColumns',
                    value: function init() {
                        this.columns.forEach(rule => {
                            this._initRule(rule)
                        });
                    }
                },
                {
                    key: '_initRule',
                    value: function _initRule(rule) {
                        if (isString(rule)) return rule
                        let type = rule.type.toLowerCase()
                        let global = this.options.global || {}
                        if (events.hasOwnProperty(type) && events[type].hasOwnProperty('onInit')) {
                            events[type].onInit.map(f => {
                                f(rule, global[type] || {})
                            })
                        }

                        if (rule.hasOwnProperty('children')) {
                            rule.children.forEach(c => {
                                this._initRule(c)
                            });
                        }
                        if (rule.hasOwnProperty('control')) {
                            rule.control.forEach(c => {
                                if (c.handle && isString(c.handle)) {
                                    let handler = c.handle
                                    c.handle = function (val) {
                                        try {
                                            return eval(handler)
                                        } catch (e) {
                                            console.error('字段[' + rule.field + ']中control参数错误' + e.message)
                                            return false
                                        }
                                    }
                                }
                                c.rule.forEach(r => {
                                    this._initRule(r)
                                })
                            });
                        }
                    }
                }
            ], [
                {
                    key: "create",
                    value: function create(columns, options) {
                        return new SurfaceForm(columns, options).create()
                    }
                },
                {
                    key: "component",
                    value: function component(component) {
                        if (Array.isArray(component)) {
                            component.map(SurfaceForm.component)
                        } else {

                            if (component.hasOwnProperty('events')) {
                                if (!events.hasOwnProperty(component.name)) {
                                    events[component.name] = {}
                                }
                                for (let e in component.events) {
                                    if (!events[component.name].hasOwnProperty(e)) {
                                        events[component.name][e] = []
                                    }
                                    Array.isArray(component.events[e]) ?
                                        events[component.name][e].concat(component.events[e]) :
                                        events[component.name][e].push(component.events[e])

                                }
                            }

                            if (component.hasOwnProperty('component')) {
                                formCreate.component(component.name, component.component)
                            }

                            if (!component.hasOwnProperty('events') && !component.hasOwnProperty('component')) {
                                formCreate.component(component.name, component)
                            }

                        }
                    }
                },
            ]);
        }()
    }

    const css = '.upload-box{width:98%;max-width:970px;max-height:620px;}.upload-box .manage-img{width:100%;max-height:500px;height:74vh;border:none;}.form-create{padding: 10px}.form-create .form-create .el-form-item{margin: 10px 0px}.s-marker{margin-bottom: 0;font-style: italic;font-size: 12px;color: #a4a4a4;display:block;line-height:20px}.el-form-item{margin-top:5px}.s-take-box{padding-left: 45px;position: relative;display: inline-block}.s-take-delete{position: absolute;left: 25px;top: 50%;transform: translateY(-50%);color: #a4a4a4;cursor: pointer}.s-take-add{margin-left: 20px}.s-take-content>img{width: 40px;height:40px;vertical-align:middle;}'
    styleInject(css)

    let $surfaceForm = Creator()

    $surfaceForm.component([EDITOR_COMPONENT, UPLOAD_COMPONENT, TAKE_COMPONENT])

    if (typeof window !== "undefined") {
        window.surfaceForm = $surfaceForm;
    }

    exports.default = $surfaceForm;
})))
