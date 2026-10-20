# chat room 询价单 聊天室通用组件

> 目前只处理询价单模式( businessCode=source-rfx ) ，因为里面有许多供应商对采购方的数据展示规则，在标准代码中针对规则初始化了聊天室数据。
以后有别的单据需要聊天室，可能需要使用单据类别做特定的数据初始化。(建议businessCode区分不同聊天室)。

## /pub/ssrc/rfx-chat-room

1. 【按钮组件】 支持标准代码引用，组件是一个按钮，点击可打开一个弹窗， 其中渲染聊天室组件
COMMON 模式
组件需要的属性都需要代码指定传入 srm-front-ssrc

#### 聊天室支持两种模式

- ChatRoomSourceLink 返回标准button, 通过打开弹窗， 展示聊天室

- ChatRoomSourcePage 直接打开聊天室页面

``` js

import ChatRoom from 'srm-front-mobile/lib/components/Chat/Room';

import ChatRoomSourceLink from "@/routes/components/ChatRoomSource/ChatRoomSourceLink";

import ChatRoomSourceLink from "srm-front-ssrc/lib/routes/components/ChatRoomSource/ChatRoomSourceLink";

import ChatRoomSourcePage from "srm-front-ssrc/lib/routes/components/ChatRoomSource/ChatRoomSourcePage";

```


2. 【链接】 支持个性化配置链接，弹窗展示聊天室
MODAL 弹窗模式 页面需要的参数从？后边的截取href获得
LINK 页面链接 页面需要参数从location.search得到

``` text
采购方链接
/pub/ssrc/rfx-chat-room?rfxHeaderId={rfxHeaderId}&roleCategory=PURCHASE&pageType=LINK

采购方弹窗- **推荐**
/pub/ssrc/rfx-chat-room?rfxHeaderId={rfxHeaderId}&roleCategory=PURCHASE&pageType=MODAL

供应商方链接
/pub/ssrc/rfx-chat-room?quotationHeaderId={quotationHeaderId}&roleCategory=SUPPLIER&pageType=LINK

供应商方弹窗- **推荐**
/pub/ssrc/rfx-chat-room?quotationHeaderId={quotationHeaderId}&roleCategory=SUPPLIER&pageType=MODAL

```

### 复杂示例， businessCode 为公告类别
```
询价单公告
/pub/ssrc/rfx-chat-room?rfxHeaderId={rfxHeaderId}&roleCategory=PURCHASE&pageType=LINK&businessCode=source-rfx

竞价大厅公告
/pub/ssrc/rfx-chat-room?rfxHeaderId={rfxHeaderId}&roleCategory=PURCHASE&pageType=MODAL&businessCode=source-bidding

```

### 主要参数

| name  | type  | default  | required  |  description | remark |
|---|---|---|---|---|---|
| **rfxHeaderId**  | string  | ""  | Y  | 询价单头ID  | 来自询价单头， roleCategory如果是采购方，该参数必须， 用来查询聊天室需要的的参数 |
| **quotationHeaderId**  | string  | ""  | Y  | 报价单头ID  | 来自报价单头 roleCategory如果是供应商，该参数必须， 用来查询聊天室需要的的参数 |
| pageType  | string  | ''  | Y  | 聊天室场景，支持个性化配置弹窗， 链接， 标准组件直接引用  | MODAL 弹窗, LINK 页面链接, COMMON 标准代码调用代码 |
| roleCategory  | string  | 'PURCHASE'  | Y  | 用户角色,是采购方，供应商  | PURCHASE / SUPPLIER |
| readOnly  | boolean  | false  | N  | 是否是能查看聊天记录  | 该功能👋聊天室单据数据控制，功能几乎不受控制， 仅代码模式 |
|  businessCode | string  | "source-rfx"  | N  | 每个聊天室的唯一编码， 默认是询价单发布的聊天室  | 'source-bidding' "source-rfx" |
| hiddenFlag ｜ int  | string  | ""  |  0  | 是否隐藏聊天室打开按钮  | 只能在代码层面使用， 仅代码模式 |
| otherButtonProps  | object  | {}  | N  | 聊天室按钮的其它属性  | 给button的属性， 仅代码模式 |
| name  | string  | "chat"  | N  | 聊天室按钮的name  | 仅代码模式 |
| icon, buttonText,  | string  | ""  | N  | 聊天室按钮的一些属性  | 仅代码模式 |


**聊天室支持寻源以及外部使用，如果不是只读模式，每隔一定时间去查询一次当前人唯独消息数量，显示在按钮右侧**
> 聊天室整体逻辑，详情看聊天室对接文档

>> 最开始是初始化聊天室
>> 接着获取到聊天室需要的核心参数roomParams, 然后将当前用户加入到聊天室中
>> 然后就可以 进行一些操作， 比如加人，减人， 获取特定用户的未读消息等操作
>> 需要核心参数roomParams才可以渲染聊天室，聊天功能开启
>> 到达特定节点， 关闭聊天室， 用户只读消息

----------------------------------------------------------------------------------------------------
