# page document

----

## /ssrc/quotation-detail-query  - 报价明细 - 专供订单物流使用
##### https://dev.isrm.going-link.com/app/ssrc/quotation-detail-query?quotationLineId=1111&sourceHeaderNum=RFX2022&sourceForm=RFX

| name  | type  | default  | required  |  description | remark |
|---|---|---|---|---|---|
| ***quotationLineId***  | string  | ""  | N  | 报价行ID  | 如果sourceResultId没值，则quotationLineId，sourceFrom必输，会用这两个参数去查到sourceResultId,执行后边逻辑 |
| ***sourceForm***  | string  | "RFX"  | N  | 寻价单来源  | |
| sourceHeaderNum  | string  | ""  | N  | 询价单编码  | |
| ***sourceResultId*** | string  | ""  | N  | 寻源结果行ID  | 如果sourceResultId有值，那quotationLineId，sourceFrom不需要传，用这个参数会查到的, 然后执行后边逻辑 |

-----

##  /ssrc/new-bid-hall/other-detail/:rfxId       招标单明细-其他模块使用-提供权限
## /ssrc/new-inquiry-hall/other-detail/:rfxId    询价单明细-其他模块使用-提供权限

| name  | type  | default  | required  |  description | remark |
|---|---|---|---|---|---|
| **:rfxId**  | string  | ""  | Y  | 询价单头ID  | 询价单头 rfxHeaderId |
| backPath  | string  | ''  | N  | Header上不显示返回icon  | 值是'0' / 'NO'，代表页面头没有返回icon, 值是一段完整页面url, 代表的是需要返回的上一级页面 |
| externalPb  | string  | "1"  | N  | 是否外部模块使用  | location.search中传递, 供外部模块，以/pub形式渲染整个页面 (为了解决询价单发布审批页面只有一个发布准备节点) |
|  disabledAllLinkFlag | string  | ""  | N  | 禁用所有链接的跳转功能  | 供外部系统嵌套，子页面，子组件的所有页面跳转功能，禁用当前页面的返回功能, 1禁用当前页面 |
| typeName ｜ sourcePage  | string  | ""  |  N  | 跳转到当前明细的父级页面的唯一标识  | 一般是标准使用 |
| permissionFilterFlag  | string  | ""  | N  | 是否分配权限  | 前端新增一个过滤权限参数permissionFilterFlag，后端在controller层增加埋点（明细页所有接口），如果permissionFilterFlag=1，则在适配器中二开判断当前租户是否要过滤权限（再埋点中加一层判断是为了避免前端修改路由参数的值导致直接权限过滤了，必须租户在脚本中写了过滤才真的需要过滤），通过PermissionParserHelper处理。 |
| inComingStatus  | string  | ""  | N  | 指定明细页面当前显示的节点编码  | 如果没传，走单据当前状态 [ 'FINISHED','SCORING',  'CHECK_PENDING',  'PRETRIAL_PENDING',  'OPEN_BID_PENDING',  'IN_QUOTATION',  'IN_PREQUAL',  'RELEASE_PREPARE',] |
| location.state?.stateBackPath  | string  | ""  | N  | 从明细返回父级页面的路由  | 可以用通过location.search.backPath |
| sourceCategory  | string  | ""  | N  | 寻源类别  | 询价单头 sourceCategory |
| projectLineSectionId  | string  | ""  | N  | 多标段标段ID  | 立项单头标段id |

----

## /pub/ssrc/supplier-reply/query/:quotationHeaderId 新报价- 报价查询-外部使用
### 链接
> /pub/ssrc/supplier-reply/query/null?rfxHeaderId={rfxHeaderId}&pageType=SUPPLIER_DETAIL_QUERY&externalFlag=1&quotationHeaderId={quotationHeaderId}&supplierCompanyId={supplierCompanyId}&supplierId={supplierId}

> /pub/ssrc/bid-supplier-reply/query/null?rfxHeaderId={rfxHeaderId}&pageType=SUPPLIER_DETAIL_QUERY&externalFlag=1&quotationHeaderId={quotationHeaderId}&supplierCompanyId={supplierCompanyId}&supplierId={supplierId}

 
### 弹窗
> /pub/ssrc/supplier-reply/query/null?rfxHeaderId={rfxHeaderId}&pageType=SUPPLIER_DETAIL_QUERY&quotationHeaderId={quotationHeaderId}&supplierCompanyId={supplierCompanyId}&supplierId={supplierId}&externalModalFlag=1

> /pub/ssrc/bid-supplier-reply/query/null?rfxHeaderId={rfxHeaderId}&pageType=SUPPLIER_DETAIL_QUERY&quotationHeaderId={quotationHeaderId}&supplierCompanyId={supplierCompanyId}&supplierId={supplierId}&externalModalFlag=1


| name  | type  | default  | required  |  description | remark |
|---|---|---|---|---|---|
| **:quotationHeaderId**  | string  | ""  | N  | 报价单头ID  | 如果外部模块,没有这个id，请写成null |
|  rfxHeaderId | string  | ""  | Y  | 询价单头id  |  |
|  quotationHeaderId | string  | ""  | N  | 报价单头ID  |  |
| noBackFlag  | string  | ''  | N  | Header上不显示返回icon  | 值是'0' / '1'，代表页面头没有返回icon |
| externalFlag  | string  | ""  | N  | 是否外部模块使用  | location.search中传递, 供外部模块，以/pub形式渲染整个页面, 页面头没有返回按钮 |
| externalModalFlag  | string  | ""  | N  | 是否外部模块使用，以弹窗形式配置显示  | location.search中传递, 供外部模块，以/pub形式渲染整个页面, 页面头没有返回按钮 |
| pageType ｜ sourcePage  | string  | ""  |  N  | 页面标识  | enum SUPPLIER_DETAIL_QUERY(报价查询) / HISTORY_VERSION(历史查询) |
| supplierCompanyId  | string  | ""  | N  | 供应商ID  | supplierCompanyId，supplierId，quotationHeaderId 后端会校验，必须存在一个 |
| supplierId  | string  | ""  | N  | 供应商ID |




-----

------
