/**
 * 服务注册-多语言
 * @author baitao.huang@hand-china.com
 * @date 2020-03-12
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'hzero-front/lib/utils/intl';

const getLang = (key) => {
  const PREFIX = 'hitf.services';

  const LANGS = {
    PREFIX,
    SAVE: intl.get('hzero.common.button.save').d('保存'),
    DELETE: intl.get('hzero.common.button.delete').d('删除'),
    OPERATOR: intl.get('hzero.common.button.action').d('操作'),
    EDIT: intl.get('hzero.common.edit').d('编辑'),
    RETRY: intl.get('hzero.common.retry').d('重试'),
    IMPORT: intl.get('hzero.common.button.import').d('导入'),
    CLOSE: intl.get('hzero.common.button.close').d('关闭'),
    CLEAN: intl.get('hzero.common.button.clean').d('清除'),
    CANCEL: intl.get('hzero.common.button.cancel').d('取消'),
    BASIC_INFO: intl.get('hzero.common.view.baseInfo').d('基本信息'),
    FILE_PROTOCOL_PASSWORD: intl.get('hzero.common.model.common.password').d('密码'),
    ENABLE_FLAG: intl.get('hzero.common.model.common.enableFlag').d('是否启用'),
    BELONG_TENANT: intl.get('hzero.common.model.common.belongTenant').d('所属租户'),
    SURE: intl.get('hzero.common.button.sure').d('确定'),
    AT_LEAST: intl.get('hzero.common.validation.atLeast').d('请至少选择一条数据	'),
    CODE: intl
      .get('hzero.common.validation.code')
      .d('大小写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),
    CODE_UPPER: intl
      .get('hzero.common.validation.codeUpper')
      .d('全大写及数字，必须以字母、数字开头，可包含“-”、“_”、“.”、“/”'),

    HEADER: intl.get(`${PREFIX}.view.title.header`).d('服务注册'),
    MORE_CONFIG: intl.get(`${PREFIX}.view.title.moreConfig`).d('扩展配置'),
    DETAIL_INTERFACES: intl.get(`${PREFIX}.view.title.detailInterfaces`).d('接口配置'),
    INVOKE_INFO: intl.get(`${PREFIX}.view.button.invokeAddr`).d('透传信息'),
    CLONE: intl.get(`${PREFIX}.view.button.clone`).d('克隆'),

    FIELD_NAME: intl.get(`${PREFIX}.model.services.fieldName`).d('属性名'),
    FIELD_TYPE: intl.get(`${PREFIX}.model.services.fieldType`).d('字段类型'),
    FIELD_DESC: intl.get(`${PREFIX}.model.services.fieldDesc`).d('字段描述'),
    FIELD_EXPR: intl.get(`${PREFIX}.model.services.fieldExpr`).d('表达式'),
    SEQ_NUM: intl.get(`${PREFIX}.model.services.sqeNum`).d('排序号'),
    PARAM_NAME: intl.get(`${PREFIX}.model.services.paramName`).d('参数名称'),
    PARAM_TYPE: intl.get(`${PREFIX}.model.services.paramType`).d('参数类型'),
    PARAM_DESC: intl.get(`${PREFIX}.model.services.paramDesc`).d('描述'),
    BIND_FIELD_NAME: intl.get(`${PREFIX}.model.services.bindAttr`).d('绑定属性'),
    PARAM_LOCATION: intl.get(`${PREFIX}.model.services.paramLocation`).d('参数位置'),
    OPERATOR_CODE: intl.get(`${PREFIX}.model.services.operatorCode`).d('操作符'),
    REQUIRED_FLAG: intl.get(`${PREFIX}.model.services.requiredFlag`).d('是否必填'),
    DEFAULT_VALUE: intl.get(`${PREFIX}.model.services.defaultValue`).d('默认值'),
    REQUEST_PROTOCOL: intl.get(`${PREFIX}.model.services.requestProtocol`).d('请求协议'),
    RESPONSE_TYPE: intl.get(`${PREFIX}.model.services.responseType`).d('响应类型'),
    EXPRESSION_TYPE: intl.get(`${PREFIX}.model.services.expressionType`).d('表达式类型'),
    EXPRESSION_CONTENT: intl.get(`${PREFIX}.model.services.expressionContent`).d('表达式内容'),
    EXECUTION_TYPE: intl.get(`${PREFIX}.model.services.executionType`).d('请求类型'),
    RESULT_FLAG: intl.get(`${PREFIX}.model.services.resultFlag`).d('设为查询结果'),
    RESULT_FLAG_TIP: intl
      .get(`${PREFIX}.model.services.resultFlagTip`)
      .d('勾选后查询结果中只包含指定属性列，如全部未勾选则视为查询所有属性列。'),
    QUERY_FLAG: intl.get(`${PREFIX}.model.services.queryFlag`).d('设为查询条件参数'),
    QUERY_FLAG_TIP: intl
      .get(`${PREFIX}.model.services.queryFlagTip`)
      .d('只有当请求类型中包含查询，该字段才可设为查询条件参数。'),
    UPDATE_FLAG: intl.get(`${PREFIX}.model.services.updateFlag`).d('设为更新条件参数'),
    UPDATE_FLAG_TIP: intl
      .get(`${PREFIX}.model.services.Tip`)
      .d('只有当请求类型中包含更新，该字段才可设为更新条件参数。'),
    DELETE_FLAG: intl.get(`${PREFIX}.model.services.deleteFlag`).d('设为删除条件参数'),
    DELETE_FLAG_TIP: intl
      .get(`${PREFIX}.model.services.deleteFlagTip`)
      .d('只有当请求类型中包含删除，该字段才可设为删除条件参数。'),

    DETAIL_TITLE: intl.get(`${PREFIX}.view.message.title.detail`).d('服务注册详情'),
    DETAIL_TITLE_TIP: intl
      .get(`${PREFIX}.view.message.title.detail.tip`)
      .d(
        '服务注册详情。一个网站可以看做一个服务，网站下的各个接口即对应接口平台的接口。针对服务，接口平台提供统一的认证配置及其他配套配置。'
      ),

    INVOKE_ADDR: intl.get(`${PREFIX}.model.services.invokeAddr`).d('透传地址'),
    INTERFACE_CODE: intl.get(`${PREFIX}.model.services.interfaceCode`).d('接口编码'),
    INTERFACE_CODE_TIP: intl
      .get(`${PREFIX}.model.services.interfaceCode.tip`)
      .d(
        '接口编码。服务维度下确保唯一，一经填写就不可修改。特别地，前置机适配器自动注册时为适配器编码，等。'
      ),
    INTERFACE_NAME: intl.get(`${PREFIX}.model.services.interfaceName`).d('接口名称'),
    INTERFACE_NAME_TIP: intl
      .get(`${PREFIX}.model.services.interfaceName.tip`)
      .d('接口名称。特别地，前置机适配器自动注册时为适配器编码，等'),
    INTERFACE_URL: intl.get(`${PREFIX}.model.services.interfaceUrl`).d('接口地址'),
    INTERFACE_URL_TIP: intl
      .get(`${PREFIX}.model.services.interfaceUrl.tip`)
      .d('接口地址。对方接口的路由地址'),
    SOAP_VERSION: intl.get(`${PREFIX}.model.services.soapVersion`).d('SOAP版本'),
    REQUEST_METHOD: intl.get(`${PREFIX}.model.services.requestMethod`).d('请求方法'),
    TIME_ZONE: intl.get(`${PREFIX}.model.services.timeZone`).d('时区'),
    DATE_TIME_FORMAT: intl.get(`${PREFIX}.model.services.dateTimeFormat`).d('日期格式'),
    DATE_TIME_FORMAT_TIP: intl
      .get(`${PREFIX}.model.services.dateTimeFormat.tip`)
      .d(
        '针对透传调用的调用系统和被调用系统的时区不一致，需要进行时区转换处理时，日期格式必输，否则会不会做时区转换处理'
      ),
    REQUEST_METHOD_TIP: intl
      .get(`${PREFIX}.model.services.requestMethod.tip`)
      .d('对方接口的请求方法。支持GET/POST/PUT/DELETE等'),
    REQUEST_HEADER: intl.get(`${PREFIX}.model.services.requestHeader`).d('媒体类型(MediaType)'),
    REQUEST_HEADER_TIP: intl
      .get(`${PREFIX}.model.services.requestHeader.tip`)
      .d(
        '媒体类型MediaType。对方接口的媒体类型。特别地，如果为文件上传的接口，请务必设置为multipart/form-data。'
      ),
    PUBLISH_TYPE: intl.get(`${PREFIX}.model.services.publishType`).d('发布类型'),
    PUBLISH_TYPE_TIP: intl
      .get(`${PREFIX}.model.services.publishType.tip`)
      .d(
        '发布类型。此配置为接口平台的配置项，RESTful与SOAP相互转换的配置即为此项，配置该类型后，将把对方接口的相应内容转换成当前配置项内容。'
      ),
    SOAP_ACTION: intl.get(`${PREFIX}.model.services.soapAction`).d('soapAction'),
    SOAP_ACTION_TIP: intl
      .get(`${PREFIX}.model.services.soapAction.tip`)
      .d('soapAction。此参数一般为wsdl描述文件中的soapAction属性的值。'),
    BODY_NAMESPACE_FLAG: intl.get(`${PREFIX}.model.services.bodyNamespaceFlag`).d('body命名空间'),
    BODY_NAMESPACE_FLAG_TIP: intl
      .get(`${PREFIX}.model.services.bodyNamespaceFlag.tip`)
      .d(
        'body命名空间。此参数用来开关是否需要配置请求报文中soap-body(不同协议body标签有差异，根据实际情况判定)中的命名空间。'
      ),
    SERVICE_CODE: intl.get(`${PREFIX}.model.services.code`).d('服务代码'),
    SERVICE_CODE_TIP: intl
      .get(`${PREFIX}.model.services.code.tip`)
      .d('服务代码。租户维度下确保唯一，一经填写就不可修改。'),
    NAMESPACE: intl.get(`${PREFIX}.model.services.namespace`).d('服务命名空间'),
    APP_CODE: intl.get(`${PREFIX}.model.services.appCode`).d('模型应用'),
    SOURCE_CODE: intl.get(`${PREFIX}.model.services.sourceCode`).d('应用视图'),
    DOMAIN: intl.get(`${PREFIX}.model.services.domain`).d('服务领域'),
    DOMAIN_TIP: intl
      .get(`${PREFIX}.model.services.domain.tip`)
      .d('服务领域。用于服务领域划分，用于服务资产化，属于领域资产归类。'),
    INVOKE_VERIFY_SIGN_FLAG: intl
      .get(`${PREFIX}.model.services.invokeVerifySignFlag`)
      .d('校验签名'),
    INVOKE_VERIFY_SIGN_FLAG_TIP: intl
      .get(`${PREFIX}.model.services.invokeVerifySignFlag.tip`)
      .d('校验签名。此功能主要作为接口验签使用。需结合验签功能一起使用，为特定场景使用功能。'),
    SOAP_DATA_NODE: intl.get(`${PREFIX}.model.services.soapDataNode`).d('Soap响应体标签'),
    REQUEST_CONTENT_TYPE: intl.get(`${PREFIX}.model.services.requestContentType`).d('请求内容类型'),
    RESPONSE_CONTENT_TYPE: intl
      .get(`${PREFIX}.model.services.responseContentType`)
      .d('响应内容类型'),
    SOAP_WSS_PASSWORD_TYPE: intl
      .get(`${PREFIX}.model.services.soapWssPasswordType`)
      .d('SOAP加密类型'),
    SOAP_WSS_PASSWORD_TYPE_TIP: intl
      .get(`${PREFIX}.model.services.soapWssPasswordType.tip`)
      .d(
        'SOAP加密类型。此加密类型用于兼容1.5(不含1.5)之前认证。1.5及以后，此功能过时，使用服务认证配置的"SOAP认证"替代。'
      ),
    SOAP_ELEMENT_PREFIX: intl.get(`${PREFIX}.model.services.soapElementPrefix`).d('SOAP参数前缀'),
    SOAP_NAMESPACE: intl.get(`${PREFIX}.model.services.soapNamespace`).d('SOAP命名空间'),
    SOAP_NAMESPACE_TIP: intl
      .get(`${PREFIX}.model.services.soapNamespace.tip`)
      .d('SOAP命名空间。一般为wsdl描述文件中"targetNamespace"或"xmlns:tns"等属性的值'),
    SOAP_REQUEST_TEMPLATE: intl
      .get(`${PREFIX}.model.services.soapRequestTemplate`)
      .d('SOAP请求参数模板'),
    SOAP_REQUEST_TEMPLATE_TIP: intl
      .get(`${PREFIX}.model.services.soapRequestTemplateTip`)
      .d(
        '针对于SOAP请求存在除SOAP版本相关的命名空间外多个命名空间的情况可以配置SOAP请求参数模板，可以通过配置值集和消息模板来扩展。可以对应模板值集值=对应模板消息模板的CODE即可。(注意 $ {soapSecurity}、$ {soapHeader}、$ {soapBody}需要放到模板对应的位置)，SOAP1.1对应的模板命名空间应为http://schemas.xmlsoap.org/soap/envelope/，SOAP1.2对应的模板命名空间应为http://www.w3.org/2003/05/soap-envelope'
      ),
    ADDRESS: intl.get(`${PREFIX}.model.services.address`).d('服务地址'),
    ADDRESS_TIP: intl
      .get(`${PREFIX}.model.services.address.tip`)
      .d(
        '服务地址。内部接口地址为HZero内服务，外部接口为实际对方接口地址。支持http/https，选择https时需选择平台证书，亦即需提前至平台证书处维护证书。'
      ),
    PUBLIC_FLAG: intl.get(`${PREFIX}.model.services.publicFlag`).d('公开服务'),
    SERVICE_CATEGORY: intl.get(`${PREFIX}.model.services.category`).d('服务类别'),
    SERVICE_TYPE: intl.get(`${PREFIX}.model.services.type`).d('服务类型'),
    SERVICE_TYPE_TIP: intl
      .get(`${PREFIX}.model.services.type.tip`)
      .d('服务类型。此处的类型特指集成协议，目前主要支持RESTful、Soap等协议。'),
    NAMESPACE_TIP: intl
      .get(`${PREFIX}.model.services.namespace.tip`)
      .d(
        '服务命名空间。默认为租户编码，选择租户或由当前上下文带出，不可更改。前置机自动注册服务时为前置机指定内容。'
      ),
    ASYNC_FLAG: intl.get(`${PREFIX}.model.services.asyncFlag`).d('异步调用'),
    ASYNC_FLAG_TIP: intl
      .get(`${PREFIX}.model.services.asyncFlag.tip`)
      .d(
        '异步调用。接口平台配置项。开启后透传将使用异步线程方式处理请求。如果您需要同步获取对方接口内容，切勿设置此项。'
      ),
    MAPPING_CLASS: intl.get(`${PREFIX}.model.services.mappingClass`).d('映射类'),
    MAPPING_CLASS_TIP: intl
      .get(`${PREFIX}.model.services.mappingClass.tip`)
      .d(
        '映射类。此功能为回调处理功能，一般用来处理请求参数或者响应内容。请求内容的处理将发生在透传处理最开始处，响应内容的处理将发生在sdk即将返回结果前(数据映射、数据转换发生在此功能之前)。'
      ),
    MAINTAIN_ENCRYPT_CONFIG: intl
      .get(`${PREFIX}.model.services.encryptConfig`)
      .d('报文加密配置维护'),
    ENCRYPT_CONFIG: intl.get(`${PREFIX}.view.button.encryptConfig`).d('报文加密配置'),

    CUSTOM_ATTR: intl.get(`${PREFIX}.model.services.customAttr`).d('自定义属性配置'),
    CUSTOM_ATTR_TIP: intl
      .get(`${PREFIX}.model.services.customAttrTip`)
      .d(
        '某些场景需要自定义一些参数到服务或接口中，方便后续取用。也可以开启传递，请求时会将参数放入到请求头中。'
      ),
    MAINTAIN_CUSTOM_ATTR: intl
      .get(`${PREFIX}.model.services.maintainCustomAttr`)
      .d('自定义属性配置维护'),
    CUSTOM_PARAMS_FLAG: intl.get(`${PREFIX}.model.services.customParamsFlag`).d('传递到请求头参数'),
    ATTR_NAME: intl.get(`${PREFIX}.model.services.attrName`).d('属性名'),
    ATTR_VALUE: intl.get(`${PREFIX}.model.services.attrValue`).d('属性值'),
    ADD_ATTR: intl.get(`${PREFIX}.view.button.addAttr`).d('添加属性'),
    CLEAR_ATTR: intl.get(`${PREFIX}.view.button.clearAttr`).d('清空属性'),
    ATTR_NAME_VALIDATE: intl.get(`${PREFIX}.model.services.attrNameValidate`).d('属性名不能重复'),

    CUSTOM_LOG: intl.get(`${PREFIX}.model.services.customLog`).d('日志字段值提取配置'),
    MAINTAIN_CUSTOM_LOG: intl.get(`${PREFIX}.model.services.customLog`).d('日志字段值提取配置维护'),
    SOURCE_SYSTEM: intl.get(`${PREFIX}.model.services.sourceSystem`).d('来源系统取值'),
    SOURCE_DOCUMENT_NUM: intl.get(`${PREFIX}.model.services.sourceDocumentNum`).d('来源单据号取值'),
    SOURCE_DOCUMENT_ID: intl.get(`${PREFIX}.model.services.sourceDocumentId`).d('来源单据ID取值'),
    SOURCE_DOCUMENT_ID_TIP: intl
      .get(`${PREFIX}.model.services.sourceDocumentIdTip`)
      .d('来源单据ID, 获取的值必须为整形，否则不能正确设置'),

    STATUS: intl.get(`${PREFIX}.model.services.status`).d('状态'),
    HTTP_CONFIG: intl.get(`${PREFIX}.model.services.httpConfig`).d('http配置'),
    HTTP_CONFIG_TIP: intl
      .get(`${PREFIX}.model.services.httpConfig.tip`)
      .d('http配置。可设置连接超时以及读超时时间，优先级高于服务级别的HTTP参数配置'),
    REQUEST_TRANSFORM: intl.get(`${PREFIX}.model.services.requestTransform`).d('请求字段映射'),
    RESPONSE_TRANSFORM: intl.get(`${PREFIX}.model.services.responseTransform`).d('响应字段映射'),
    REQUEST_CAST: intl.get(`${PREFIX}.model.services.requestCast`).d('请求数据映射'),
    RESPONSE_CAST: intl.get(`${PREFIX}.model.services.responseCast`).d('响应数据映射'),
    PUBLISH_URL: intl.get(`${PREFIX}.model.services.publishUrl`).d('发布地址'),
    ENABLE_CERTIFICATE: intl
      .get(`${PREFIX}.model.services.enabledCertificateFlag`)
      .d('是否启用证书'),
    CERTIFICATE: intl.get(`${PREFIX}.model.services.certificate`).d('证书'),
    SWAGGER_URL: intl.get(`${PREFIX}.model.services.swaggerUrl`).d('swagger地址'),
    SWAGGER_URL_TIP: intl
      .get(`${PREFIX}.model.services.swaggerUrlTip`)
      .d(
        'swagger地址即swagger相应实例中页面描述里API文档下的接口地址通常格式如下http://hzeronb.saas.hand-china.com/swagger/docs/hzero-interface?version=1.8.0'
      ),
    SOAP_USER_NAME: intl.get(`${PREFIX}.model.services.soapUsername`).d('校验用户名'),
    SOAP_PASSWORD: intl.get(`${PREFIX}.model.services.soapPassword`).d('校验密码'),

    DATASOURCE_LOV: intl.get(`${PREFIX}.model.services.dataSourceLov`).d('数据源名称'),
    DS_TYPE: intl.get(`${PREFIX}.model.services.dsType`).d('数据源类型'),
    EXPR_TYPE: intl.get(`${PREFIX}.model.services.exprType`).d('表达式类型'),
    REMARK: intl.get(`${PREFIX}.model.services.useRemark`).d('用途说明'),

    CREATE_MODEL: intl.get(`${PREFIX}.view.title.create`).d('新建服务模型'),
    ATTR_LIST: intl.get(`${PREFIX}.view.title.attrList`).d('属性列表'),
    VIEW: intl.get(`${PREFIX}.model.services.view`).d('表或视图'),
    BUTTON_ADD: intl.get(`${PREFIX}.view.button.add`).d('新增'),
    BUTTON_BATCH_DELETE: intl.get(`${PREFIX}.view.button.batchDelete`).d('批量删除'),
    BUTTON_RELEASE: intl.get(`${PREFIX}.view.button.release`).d('发布'),
    BUTTON_OFFLINE: intl.get(`${PREFIX}.view.button.offline`).d('下线'),
    BUTTON_CREATE: intl.get(`${PREFIX}.view.button.create`).d('注册'),
    VIEW_MAPPING_CLASS: intl.get(`${PREFIX}.view.title.viewMappingClass`).d('查看映射类详情'),
    VIEW_HTTP_CONFIG: intl.get(`${PREFIX}.view.title.viewHttpConfig`).d('查看http配置'),
    MAIN_CONFIG: intl.get(`${PREFIX}.view.title.mainConfig`).d('详细配置'),
    SQL: intl.get(`${PREFIX}.model.services.sql`).d('SQL表达式'),
    PARAM_CANCEL_CHECK: intl
      .get(`${PREFIX}.view.title.paramCancelCheck`)
      .d('取消勾选将会删除关联的参数行'),
    SAVE_VALIDATE: intl.get(`${PREFIX}.view.validate.save`).d('请完善必输信息'),
    ANALYSIS: intl
      .get(`${PREFIX}.view.title.analysis`)
      .d('解析SQL将会删除属性列表和参数列表数据，是否解析'),
    SQL_ERROR: intl.get(`${PREFIX}.view.title.sqlError`).d('请先填写SQL表达式'),
    CHANGE_VIEW: intl
      .get(`${PREFIX}.view.title.changeView`)
      .d('切换表或视图将会删除属性列表和参数列表数据，是否切换'),

    BUTTON_ANALYSIS: intl.get(`${PREFIX}.view.button.analysis`).d('解析'),
    MODEL_FIELD_LIST: intl.get(`${PREFIX}.view.title.modelFieldList`).d('选择属性'),
    QUERY_PARAM_LIST: intl.get(`${PREFIX}.view.title.queryParamList`).d('查询参数列表'),
    UPDATE_PARAM_LIST: intl.get(`${PREFIX}.view.title.updateParamList`).d('更新参数列表'),
    DELETE_PARAM_LIST: intl.get(`${PREFIX}.view.title.deleteParamList`).d('删除参数列表'),

    SQL_EXTRA: intl.get(`${PREFIX}.view.message.sql`).d('在sql最外层请不要写SELECT *'),
    ATTR_SAVE_ERROR: intl
      .get(`${PREFIX}.view.message.attrSaveError`)
      .d('新建的接口只能通过右下角保存按钮进行保存'),
    FIELD_DELETE_CONFIRM: intl
      .get(`${PREFIX}.view.message.fieldDeleteConfirm`)
      .d('删除该属性字段的同时，会删除被其绑定的参数，是否确认删除？'),
    FIELDS_SELECT_NOTIFICATION: intl
      .get(`${PREFIX}.view.message.fieldsSelectedAll`)
      .d('在线状态的模型不支持选择属性字段作为参数，请先下线模型后再进行选择！'),
    SQL_PARSE_WARNING: intl
      .get(`${PREFIX}.view.message.sqlParseWarning`)
      .d('未解析出属性字段或者请求参数，请确认sql是否正确！'),
    NOTIFICATION_ERROR_MODEL: intl
      .get(`${PREFIX}.notification.error.model`)
      .d('表单验证失败，请检查！'),
    BUTTON_CLEAN: intl.get(`${PREFIX}.view.button.clean`).d('清除'),
    BUTTON_DELETE: intl.get(`${PREFIX}.view.button.delete`).d('删除'),
    SOAP_VERSION_TOOLTIP: intl
      .get(`${PREFIX}.model.services.soapVersionTooltip`)
      .d(
        'SOAP V1.1 和 SOAP V1.2 都是万维网联盟 (W3C) 标准:SOAP1.1对应的接口ContentType为text/xml，SOAP1.2对应的接口ContentType为application/soap+xml'
      ),

    ANALYSIS_SQL: intl.get(`${PREFIX}.view.button.analysisSQL`).d('解析SQL'),
    UNCHANGE: intl.get(`${PREFIX}.view.placeholder.unchange`).d('未更改'),
    CHANGE_TABLE: intl.get(`${PREFIX}.view.button.changeTable`).d('切换表或视图'),

    SUBJECT: intl.get(`${PREFIX}.model.services.subject`).d('对象'),
    CONDITION: intl.get(`${PREFIX}.model.services.condition`).d('条件'),
    FIELD: intl.get(`${PREFIX}.model.services.field`).d('字段'),
    KEY: intl.get(`${PREFIX}.model.services.key`).d('键'),
    VALUE: intl.get(`${PREFIX}.model.services.value`).d('值'),
    TYPE: intl.get(`${PREFIX}.model.services.type`).d('类型'),
    MOCK_FLAG: intl.get(`${PREFIX}.model.services.mockFlag`).d('mock标识'),
    MOCK_GROUP: intl.get(`${PREFIX}.model.services.mockGroup`).d('mock组'),
    EXPECTATION: intl.get(`${PREFIX}.model.services.expectation`).d('期望值'),
    JSON_BODY: intl.get(`${PREFIX}.model.http.assertion.jsonBody`).d('JSON Path'),
    JSON_BODY_TIP: intl
      .get(`${PREFIX}.model.http.assertion.jsonBody.tip`)
      .d('JSON响应体需要通过JSON Path语法匹配对应值,可参考：'),
    XML_BODY: intl.get(`${PREFIX}.model.http.assertion.xmlBody`).d('XPath 1.0'),
    XML_BODY_TIP: intl
      .get(`${PREFIX}.model.http.assertion.xmlBody.tip`)
      .d('XML响应体需要通过XPath 1.0语法匹配对应值,可参考：'),

    TIMES: intl.get(`${PREFIX}.model.services.times`).d('次'),
    SECONDS: intl.get(`${PREFIX}.model.services.seconds`).d('秒'),
    RETRY_TIMES: intl.get(`${PREFIX}.model.services.retryTimes`).d('失败重试次数'),
    RETRY_INTERVAL: intl.get(`${PREFIX}.model.services.retryInterval`).d('失败重试间隔'),

    HTTP_CONN_UOM: intl.get(`${PREFIX}.model.services.ms`).d('毫秒'),
    HTTP_CONN_CONFIG: intl.get(`${PREFIX}.view.button.httpConnectConfig`).d('HTTP连接配置'),

    ASSERTION: intl.get(`${PREFIX}.model.services.assertion`).d('重试断言'),
    ASSERTION_TIP: intl
      .get(`${PREFIX}.model.services.assertion.tip`)
      .d(
        '断言，即通过下列选项设定判定条件，设定多个条件时为"与"的逻辑关系。满足条件则重试请求第三方接口。'
      ),
    BUSINESS_ASSERTION_ALERT: intl
      .get(`${PREFIX}.model.services.business.assertionAlert`)
      .d('业务状态断言告警'),
    ALERT_LOV: intl.get(`${PREFIX}.model.services.business.alertLov`).d('告警代码'),
    BUSINESS_ASSERTION: intl.get(`${PREFIX}.model.services.business.assertion`).d('业务状态断言'),
    BUSINESS_ASSERTION_TIP: intl
      .get(`${PREFIX}.model.services.business.assertion.tip`)
      .d(
        '断言，即通过下列选项设定判定条件，设定多个条件时为"与"的逻辑关系。在日志监控页面业务状态列体现。'
      ),

    ADD_ASSERTION: intl.get(`${PREFIX}.view.button.addAssertion`).d('添加断言'),
    CLEAR_ASSERTION: intl.get(`${PREFIX}.view.button.clearAssertion`).d('清空断言'),

    MAINTAIN_REQUEST_MAPPING: intl
      .get(`${PREFIX}.model.services.maintainRequestMapping`)
      .d('请求字段映射维护'),
    MAINTAIN_RESPONSE_MAPPING: intl
      .get(`${PREFIX}.model.services.maintainResponseMapping`)
      .d('响应字段映射维护'),
    CURRENT_VERSION: intl.get(`${PREFIX}.view.message.current.version`).d('当前版本'),
    HISTORY_VERSION: intl.get(`${PREFIX}.view.message.history.version`).d('历史版本'),
    MAINTAIN_REQUEST_DATA_MAPPING: intl
      .get(`${PREFIX}.model.services.maintainRequestDataMapping`)
      .d('请求数据映射维护'),
    MAINTAIN_RESPONSE_DATA_MAPPING: intl
      .get(`${PREFIX}.model.services.maintainResponseDataMapping`)
      .d('响应数据映射维护'),
    ERRPR_RESPONSE_MAPPING: intl
      .get(`${PREFIX}.model.services.errorResponseMapping`)
      .d('异常响应字段映射'),
    MAINTAIN_ERRPR_RESPONSE_MAPPING: intl
      .get(`${PREFIX}.model.services.maintainErrorResponseMapping`)
      .d('异常响应字段映射维护'),

    MAPPING_MESSAGE_CONFIRM: intl
      .get(`${PREFIX}.view.message.mappingMessageConfirm`)
      .d('新增的映射/转化信息尚未保存，请先保存再退出当前滑窗。'),

    FILE_PROTOCOL: intl.get(`${PREFIX}.model.services.file.protocol`).d('文件协议'),
    FILE_PATH: intl.get(`${PREFIX}.model.services.file.path`).d('文件路径'),
    FILE_FILE_NAME: intl.get(`${PREFIX}.model.services.file.fileName`).d('文件名'),
    FILE_ARCHIVE_PATH: intl.get(`${PREFIX}.model.services.file.archivePath`).d('归档路径'),
    FILE_ENABLE_ARCHIVE: intl.get(`${PREFIX}.model.services.file.enableArchive`).d('归档'),
    FILE_ENABLE_REPEAT_COLUMN: intl
      .get(`${PREFIX}.model.services.file.enableRepeatColumn`)
      .d('可重复列'),
    FILE_ENABLE_REPEAT_COLUMN_TIP: intl
      .get(`${PREFIX}.model.services.file.enableRepeatColumnTip`)
      .d('主要用于excel文件，启用后，将在每一列加上列数，未启用下存在重复列将报错'),
    FILE_PROTOCOL_CONFIG: intl
      .get(`${PREFIX}.model.services.file.protocol.config`)
      .d('文件协议配置'),

    FILE_PROTOCOL_AUTH: intl
      .get(`${PREFIX}.model.services.file.protocol.auth.password`)
      .d('认证模式'),
    FILE_PROTOCOL_AUTH_PASSWORD: intl
      .get(`${PREFIX}.model.services.file.protocol.auth.password`)
      .d('密码认证'),
    FILE_PROTOCOL_AUTH_PRIVATE_KEY: intl
      .get(`${PREFIX}.model.services.file.protocol.auth.privateKey`)
      .d('秘钥认证'),
    FILE_PROTOCOL_HOSTNAME: intl.get(`${PREFIX}.model.services.file.protocol.hostname`).d('主机'),
    FILE_PROTOCOL_PORT: intl.get(`${PREFIX}.model.services.file.protocol.port`).d('端口'),
    FILE_PROTOCOL_USERNAME: intl.get(`${PREFIX}.model.services.file.protocol.username`).d('用户名'),
    FILE_PROTOCOL_PRIVATE_KEY: intl
      .get(`${PREFIX}.model.services.file.protocol.privateKey`)
      .d('秘钥文件'),
    FILE_PROTOCOL_PASSPHRASE: intl
      .get(`${PREFIX}.model.services.file.protocol.passphrase`)
      .d('口令'),

    FILE_PROTOCOL_HOSTNAME_TIP: intl
      .get(`${PREFIX}.model.services.file.protocol.hostname.tip`)
      .d('输入服务器地址，不能添加协议类型，如127.0.0.1'),
    FILE_PROTOCOL_PORT_TIP: intl
      .get(`${PREFIX}.model.services.file.protocol.port.tip`)
      .d('输入服务器的监听端口。FTP的默认值是21，SFTP的默认值是22。'),
    FILE_PROTOCOL_PRIVATE_KEY_TIP: intl
      .get(`${PREFIX}.model.services.file.protocol.privateKey.tip`)
      .d('秘钥(私钥)文件，如id_rsa，不支持BEGIN OPENSSH PRIVATE KEY'),
    FILE_PROTOCOL_PASSPHRASE_TIP: intl
      .get(`${PREFIX}.model.services.file.protocol.passphrase.tip`)
      .d('生成密钥文件时，输入的口令(passphrase)'),
    FILE_FILE_NAME_TIP: intl
      .get(`${PREFIX}.model.services.file.fileName.tip`)
      .d(
        '支持正则表达式，不填则默认为.*，如发布类型为REST则读取json、txt、csv、xlsx、xls，发布类型为SOAP则读取xml、html、htm'
      ),
    FILE_ENABLE_ARCHIVE_TIP: intl
      .get(`${PREFIX}.model.services.file.enableArchive.tip`)
      .d(
        '归档文件到归档目录,读取成功归档到归档目录下success下，失败归档到failed下，FTP和SFTP归档属于文件移动而非复制'
      ),

    FILE_BATCH_ID: intl.get(`${PREFIX}.model.file.batchId`).d('文件批号'),
    FILE_BATCH_ID_TIP: intl
      .get(`${PREFIX}.model.services.model.file.sourceBatchIdTip`)
      .d('上传文件服务器时设置的批次号'),
    FILE_BUCKET_NAME: intl.get(`${PREFIX}.model.services.model.file.bucketName`).d('文件分组'),
    FILE_BUCKET_NAME_TIP: intl
      .get(`${PREFIX}.model.services.model.file.sourceBucketNameTip`)
      .d('文件存储配置的桶名；用于区分各个服务，例如hitf标识编排服务'),
    FILE_STORE_TYPE: intl.get(`${PREFIX}.model.services.model.file.storeType`).d('存储类型'),
    FILE_STORE_CODE: intl.get(`${PREFIX}.model.services.model.file.storeCode`).d('存储编码'),
    FILE_STORE_CODE_TIP: intl
      .get(`${PREFIX}.model.services.model.file.storeCodeTip`)
      .d('文件存储配置的存储编码'),

    TEST_CONNECT: intl.get(`${PREFIX}.model.services.file.protocol.testConnect`).d('测试连接'),
    CONNECT_SUCCESS: intl
      .get(`${PREFIX}.model.services.file.protocol.connectSuccess`)
      .d('连接成功'),
    CONNECT_FAILED: intl
      .get(`${PREFIX}.model.services.file.protocol.connectFailed`)
      .d('连接失败,请检查配置'),
    UPLOAD_SUCCESS: intl.get(`${PREFIX}.model.services.file.upload.success`).d('上传成功'),

    DEBUG_EXECUTE: intl.get(`${PREFIX}.button.fieldMapping.debug.execute`).d('执行'),
    SOURCE_DATA: intl.get(`${PREFIX}.model.fieldMapping.sourceData`).d('来源报文'),
    SCRIPT_DATA: intl.get(`${PREFIX}.model.fieldMapping.targetData`).d('转化脚本'),
    RESULT_DATA: intl.get(`${PREFIX}.model.fieldMapping.resultData`).d('调试结果'),

    MAINTAIN_FIELD_MAPPING: intl.get(`${PREFIX}.modal.fieldMapping`).d('字段映射'),
    MAINTAIN_DATA_MAPPING: intl.get(`${PREFIX}.modal.dataMapping`).d('数据映射'),

    REQ_CONFIG: intl.get(`hitf.document.view.title.req.config`).d('BODY参数配置'),
    RES_CONFIG: intl.get(`hitf.document.view.title.res.config`).d('响应结果配置'),
    JSON_FORMATTER: intl
      .get(`${PREFIX}.document.param.validation.formatter.json`)
      .d('JSON格式有误'),
    XML_FORMATTER: intl.get(`${PREFIX}.document.param.validation.formatter.xml`).d('XML格式有误'),
    IMPORT_SERVICE: intl.get(`${PREFIX}.model.services.importService`).d('根据WSDL注册SOAP'),
    RESTFUL_SERVICE: intl.get(`${PREFIX}.model.services.restfulService`).d('注册RESTful'),
    TENANT_NAME: intl.get(`${PREFIX}.model.services.tenantName`).d('所属租户'),
    IMPORT_WARNING: intl
      .get(`${PREFIX}.model.services.importWarning`)
      .d('您未勾选任何待注册接口记录，将仅为您创建服务不生成接口，确认请继续'),
    CONTINUE: intl.get(`${PREFIX}.model.services.continue`).d('继续'),
    BACK: intl.get(`${PREFIX}.model.services.back`).d('返回'),
    BASIC_CONFIG: intl.get(`${PREFIX}.model.services.wsdl.basicConfig`).d('基础设置'),
    WSDL_PLACEHOLDER: intl
      .get(`${PREFIX}.model.services.wsdlPlaceholder`)
      .d('WSDL地址或本地WSDL内容的文本文件'),
    PIC_FILES: intl.get(`${PREFIX}.model.services.picFiles`).d('选择文件'),
    LOAD_WSDL: intl.get(`${PREFIX}.model.services.loadWsdl`).d('加载WSDL'),
    TEXT_PLACEHOLDER: intl
      .get(`${PREFIX}.model.services.textPlaceholder`)
      .d("此参数可由'加载WSDL'触发后自动填充，若填写则以此为准"),
    ADVANCE_CONFIG: intl.get(`${PREFIX}.model.services.wsdl.advanceConfig`).d('高级设置'),
    INTERFACE: intl.get(`${PREFIX}.model.services.interface`).d('待注册接口'),
    IMPORT_URL: intl.get(`${PREFIX}.model.services.importUrl`).d('WSDL地址'),
    SERVER_NAME: intl.get(`${PREFIX}.model.services.serverName`).d('服务名称'),
    SERVER_CODE: intl.get(`${PREFIX}.model.services.serverCode`).d('服务代码'),
    USERNAME: intl.get(`${PREFIX}.model.services.wsdl.username`).d('认证账号'),
    AuthPASSWORD: intl.get(`${PREFIX}.model.services.wsdl.authPassword`).d('认证密码'),
    SWAGGER: intl.get(`${PREFIX}.model.services.swagger`).d('RESTful地址'),
    SWAGGER_FLAG: intl.get(`${PREFIX}.model.services.swaggerFlag`).d('注册方式'),
    REGISTER: intl.get(`${PREFIX}.model.services.wsdl.register`).d('手动注册'),
    RESTFUL: intl.get(`${PREFIX}.model.services.wsdl.Restful`).d('一键注册RESTful'),
    SOAP: intl.get(`${PREFIX}.model.services.wsdl.Soap`).d('一键注册SOAP'),
    REQUEST: intl.get(`${PREFIX}.model.services.restful.Soap`).d('请求方法'),
    IMPORT_PLACEHOLDER: intl.get(`${PREFIX}.model.services.wsdl.importPlaceholder`).d('默认为否'),
    REQUEST_PLACEHOLDER: intl
      .get(`${PREFIX}.model.services.wsdl.requestPlaceholder`)
      .d('默认为POST'),
    TRANSMISSION_FILE_FLAG: intl
      .get(`${PREFIX}.model.services.file.transmissionFileFlag`)
      .d('透传文件标识'),
    TRANSMISSION_FILE_FLAG_TIP: intl
      .get(`${PREFIX}.model.services.file.transmissionFileFlagTip`)
      .d('开启时，表示将透传的报文转换成文件透传'),

    IN: intl.get(`${PREFIX}.view.title.in`).d('入站'),
    OUT: intl.get(`${PREFIX}.view.title.out`).d('出站'),
    ENCRYPT_DIRECTION: intl.get(`${PREFIX}.model.services.encryptDirection`).d('加密方向'),
    ENCRYPT_POLICY: intl.get(`${PREFIX}.model.services.encryptPolicy`).d('加密策略'),
    ENCRYPT_POLICY_TIP: intl
      .get(`${PREFIX}.model.services.encryptPolicyTip`)
      .d(
        '指明进行加密的报文的可见范围，即接口平台内部可见加密（链路日志加密）还是延展到第三方可见（HTTP传输报文加密）'
      ),
    ENCRYPY_ALGORITHM: intl.get(`${PREFIX}.model.services.encryptAlgorithm`).d('加密算法'),
    ENCRYPT_KEY: intl.get(`${PREFIX}.model.services.encryptKey`).d('加密密钥'),
    RESET_ENCRY_KEY: intl.get(`${PREFIX}.view.button.resetEncryptKey`).d('重置秘钥'),
    ALGORITHM_NOT_EMPTY: intl
      .get(`${PREFIX}.model.validate..algorithmNotEmpty`)
      .d('加密算法不能为空'),

    MAINTAIN_CONFIG: intl.get(`${PREFIX}.view.button.operationalConfig`).d('运维配置'),
    INVOKE_DIMENSION: intl.get(`${PREFIX}.view.title.invokeDimension`).d('记录维度'),
    INVOKE_DETAIL: intl.get(`${PREFIX}.model.services.invokeDetailsFlag`).d('记录调用详情'),
    HEALTH_EXAMINATION: intl.get(`${PREFIX}.view.title.healthExamination`).d('健康检查'),
    HEALTH_CHECK_FLAG: intl.get(`${PREFIX}.model.services.healthCheckFlag`).d('是否开启健康检查'),
    CHECK_USECASE: intl.get(`${PREFIX}.model.services.checkUsecaseId`).d('所用测试用例'),
    CHECK_CYCLE: intl.get(`${PREFIX}.model.services.checkCycle`).d('检查周期（秒）'),
    CHECK_CYCLE_TIP: intl
      .get(`${PREFIX}.model.services.checkCycleTip`)
      .d('接口健康检查的轮询周期，检查周期必须为5的倍数且大于等于5'),
    FIVE_PLUS: intl.get(`${PREFIX}.model.services.fivePlus`).d('必须为5的倍数'),
    CHECK_PERIOD: intl.get(`${PREFIX}.model.services.checkPeriod`).d('统计周期（秒）'),
    CHECK_PERIOD_TIP: intl
      .get(`${PREFIX}.model.services.checkPeriodTip`)
      .d(
        '在统计周期内统计接口的报错次数，统计周期必须为5的倍数且大于等于5，并且统计周期必须大于等于检查周期与异常阈值的乘积。统计周期小于检查周期*异常阈值时，会自动调整统计周期值为检查周期*异常阈值'
      ),
    CHECK_THRESHOLD: intl.get(`${PREFIX}.model.services.checkThreshold`).d('异常阈值（次）'),
    CHECK_THRESHOLD_TIP: intl
      .get(`${PREFIX}.model.services.checkThresholdTip`)
      .d('当接口在统计周期内的报错次数大于异常阈值，会发送预警信息'),
    CHECK_WARNING_CODE: intl.get(`${PREFIX}.model.services.checkWarningCode`).d('预警代码'),
    ALERT_INFO: intl.get(`${PREFIX}.view.title.alertInfo`).d('告警配置'),
    ALERT_CODE: intl.get(`${PREFIX}.model.services.alertCode`).d('告警代码'),

    PROPERTY_CODE: intl.get(`${PREFIX}.model.services.propertyCode`).d('参数名'),
    PROPERTY_VALUE: intl.get(`${PREFIX}.model.services.propertyValue`).d('参数值'),

    INTERFACE_ADDRESS: intl.get(`${PREFIX}.model.services.interfaceAddress`).d('接口地址'),
    INTERNAL_INTERFACE: intl.get(`${PREFIX}.model.services.internalInterface`).d('内部接口'),

    INTERFACE_CONTEXT_DIGEST: intl
      .get(`${PREFIX}.model.services.interfaceContextDigest`)
      .d('路由摘要'),
    INTERFACE_CONTEXT_DIGEST_TIP: intl
      .get(`${PREFIX}.model.services.interfaceContextDigestTip`)
      .d('v2p版本接口透传路由上下文信息base64摘要'),
  };
  return LANGS[key];
};

export default getLang;
