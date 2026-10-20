# 竞价大厅

### intl
> intl.get('ssrc.biddingHall.view.title.biddingHallCurrentPlace').d('竞价现场')
> intl.get('ssrc.biddingHall.view.title.biddingHall').d('竞价大厅')
intl.get('ssrc.biddingHall.model.biddingPrice').d('竞价')

低于最低价:BELOW_THE_LOWEST_PRICE;低于上次报价: LOWER_THAN_LAST_QUOTE;高于最高价:ABOVE_MAXIMUM_PRICE;高于上次报价: ABOVE_THAN_LAST_QUOTE

###
POST http://localhost:8412/v1/{{organizationId}}/bidding-sup-line-recs/unit/item/table

###
POST http://localhost:8412/v1/{{organizationId}}/bidding-sup-line-recs/unit/item/charts

###
POST http://localhost:8412/v1/{{organizationId}}/bidding/unit/item/bidding-record

###
POST http://localhost:8412/v1/{{organizationId}}/bidding/item/trend/charts 
采购方单价竞价

// "{\"userId\":93,\"key\":\"/topic/monitor/bidding-hall-sup/11087/__-RqblN5UO7wgiuJPRe7YUSKSruiHFc1XZ4m1dOrUYGjU-__/1\",\"message\":\"{\\\"rfxHeaderId\\\":\\\"__-RqblN5UO7wgiuJPRe7YUSKSruiHFc1XZ4m1dOrUYGjU-__\\\",\\\"roundNumber\\\":1,\\\"refreshAllFlag\\\":1,\\\"tenantId\\\":11087}\",\"type\":\"U\",\"brokerId\":\"1ee5eb464e1c4affa82d3d181713ba49\"}"



### chat room
> https://lexiangla.com/teams/k100033/docs/ce5bdecc159811ee9044b6382a3e10dc?company_from=d8d18c5a850c11eab17f5254002f1020

## lov displayBiddingSupHeaderStatus

  //2.未开始：1）资格预审截止时间<签到结束时间<当前时间<试竞价开始时间；2）资格预审截止时间<签到结束时间<试竞价结束时间<当前时间<竞价开始时间；
  public static final String NOT_START = "NOT_START";
  //1.签到中：签到开始时间<当前时间<签到结束时间
  public static final String SIGN_IN = "SIGN_IN";
  //4.已关闭：竞价单被成功执行关闭操作。
  public static final String CLOSED = "CLOSED";
  //5.已结束：竞价单中所有物品行的状态是【已结束】，且竞价单的状态不是【完成】【暂停】【关闭】
  public static final String FINISHED = "FINISHED";
  //3.已暂停：竞价单被成功执行关闭操作。
  public static final String PAUSED = "PAUSED";
  //2.进行中：1）试竞价开始时间<当前时间<试竞价截止时间；2）竞价开始时间<当前时间<竞价截止时间。
  public static final String IN_PROGRESS = "IN_PROGRESS";
  /**
    * 已补充单价
    */
  public static final String SUPPLEMENTED_PRICE = "SUPPLEMENTED_PRICE";
  /**
    * 未补充单价
    */
  public static final String UN_SUPPLEMENT_PRICE = "UN_SUPPLEMENT_PRICE";

## displayBiddingSupLineStatus
//未开始
public static final String NOT_START = "NOT_START";

//已结束
public static final String BIDDING_END = "BIDDING_END";

//已关闭
public static final String CLOSED = "CLOSED";

//未中标
public static final String NO_SUGGESTED = "NO_SUGGESTED";

//已中标
public static final String SUGGESTED = "SUGGESTED";

//已暂停
public static final String PAUSED = "PAUSED";

//进行中
public static final String IN_PROGRESS = "IN_PROGRESS";

- 
签到未开始 SIGN_IN_NOT_START
签到中  SIGN_IN
试竞价未开始  TRIAL_BIDDING_NOT_START
试竞价中 TRIAL_BIDDING
竞价未开始 BIDDING_NOT_START
竞价中  BIDDING
竞价截止 BIDDING_END
补充单价 BIDDING_SUPPLEMENT_PRICE

## supplier
### socket
/topic/monitor/bidding-hall-sup/{tenantId}/{rfxHeaderId}/{roundNumber}
{
  "refreshAllFlag":1,
  "refreshBiddingRuleFlag":0,
  "refreshTimeFlag":0,
  "refreshSuspendFlag":0,
  "refreshFiringFlag":0,
  "refreshBiddingCloseFlag":0,
  "refreshQuotationInfoFlag":0,
  "refreshCollectionFlag":0
}

> refreshAllFlag：全部刷新标识，刷新节点：签到结束、试竞价开始、试竞价结束、正式竞价开始、正式竞价结束、核价提交完成、退回至核价
> refreshBiddingRuleFlag：竞价规则刷新标识，寻源过程控制调整规则或时间后则需要刷新
> refreshTimeFlag：时间刷新标识，寻源过程控制调整规则或时间后则需要刷新
> refreshSuspendFlag：暂停刷新标识，竞价单暂停后需要提示供应商是否需要保存数据，点击取消则刷新界面，点击确认则保存数据并刷新界面
> refreshFiringFlag：启动刷新标识
> refreshBiddingCloseFlag：竞价单关闭标识，竞价单关闭后需要刷新
> refreshQuotationInfoFlag：在供应商报价提交时推送此表示，前端接收到此标识5s内只刷新一次
> refreshCollectionFlag：供应商收藏提示其他供应商用户刷新

/topic/monitor/bidding-hall-sup/{tenantId}/{rfxHeaderId}/{roundNumber}/{rfxLineSupplierId}
{
  "refreshBiddingHeaderFlag":0,
  "refreshBiddingLineFlag":0,
  "refreshProhibitFlag":0
}
> refreshBiddingHeaderFlag：刷新竞价头信息，在采购方对供应商头报价信息删除以后发送给供应商方进行局部刷新
> refreshBiddingLineFlag：刷新竞价行信息，在采购方对供应商行报价信息删除以后发送给供应商方进行局部刷新
> refreshProhibitFlag：禁止报价刷新标识，禁止报价需要发送标识给供应商方进行界面全刷新

### price
> A.竞价方式是竞价，出价策略是低于最低价，数据公开规则是隐藏身份公开报价/公开身份公开报价，当最低价发生变化后，如果单价字段中的值<【最低价-报价幅度】，系统不对单价进行刷新。如果单价字段中的值>【最低价-报价幅度】,系统自动将单价字段中的值变为【最低价-报价幅度】；出价策略是低于上次出价，供应商出价后，系统自动将单价字段中的值变为【最低价-报价幅度】

> B.竞价方式是拍卖，出价策略是高于最高价，数据公开规则是隐藏身份公开报价/公开身份公开报价，如果单价字段中的值>【最高价+报价幅度】，系统不对单价进行刷新。如果单价字段中的值<【最高价+报价幅度】,系统自动将单价字段中的值变为【最低价-报价幅度】；出价策略是高于上次出价，供应商出价后，系统自动将单价字段中的值变为【最高价+报价幅度】

> PS：浮动方式是金额时，按照以上逻辑进行加减；浮动方式是比例，出价格策略是低于最低价时，报价幅度=最低价*比例；浮动方式是比例，出价格策略是低于上次出价时，报价幅度=上次出价*比例

### price -+
1.展示逻辑：

1）报价行的状态是【进行中】，点击+/-符号，可+/-报价幅度。

竞价方式是竞价，出价策略是低于最低价，供应商可以点击-，供应商的报价低于最低价至少2个报价幅度时，可点击+，否则置灰。出价策略是低于上次出价，供应商可以可以点击-，供应商的报价低于最低价至少2个报价幅度时，可点击+，否则置灰。

竞价方式是拍卖，出价策略是高于上次出价，供应商可以点击+，供应商的报价高于最高价至少2个报价幅度时，可点击-，否则置灰。出价策略是高于上次出价，供应商可以点击+，供应商的报价高于最高价至少2个报价幅度时，可点击-，否则置灰。

例：拍卖，出价策略是高于上次出价，报价幅度是10，当前最高价是100，单价高于等于120时，可以点击-，110时，不可以点击-

2）在报价行的状态是其他，+/-符号置灰，不可操作。

### TIMER
> 以当前日期=5月8日举例说明，不同情况的数据展示逻辑：
SIGN IN

1.签到截止时间< 24:00:00（当天）, 即签到截止时间< 5月8日 24:00:00，显示今天 ，具体展示形式为【签到结束时间 5月8日（今天） 19:00】

2.签到截止时间< 5月9日 24:00:00（第二天）， 即签到截止时间< 5月9日 24:00:00，显示明天，具体展示形式为【签到结束时间 5月9日（明天）  19:00】 

3.签到截止时间>= 5月10日 24:00:00（第二天）， 即签到截止时间>=5月9日 24:00:00，显示签到结束时间，具体展示形式为【签到结束时间 5月10日  19:00】

NOT START
以当前日期=5月8日举例说明，不同情况的数据展示逻辑：

1.试竞价开始时间<24:00:00（当天）, 即试竞价开始时间< 5月8日 24:00:00，显示今天 ，具体展示形式为【试竞价开始时间 5月8日（今天） 19:00】

2.试竞价开始时间<24:00:00（第二天），即试竞价开始时间< 5月9日 24:00:00，显示明天，具体展示形式为【试竞价开始时间 5月9日（明天）  19:00】

3.试竞价开始时间>=24:00:00（第二天），即试竞价开始时间>= 5月9日 24:00:00，显示试竞价开始时间，具体展示形式为【试竞价开始时间 5月10日  19:00】

4.竞价开始时间<24:00:00（当天）, 即竞价开始时间< 5月8日 24:00:00，显示今天 ，具体展示形式为【竞价开始时间 5月8日（今天） 19:00】

5.竞价开始时间<24:00:00（第二天），即试竞价开始时间< 5月9日 24:00:00，显示明天，具体展示形式为【竞价开始时间 5月9日（明天）  19:00】

6.竞价开始时间>=24:00:00（第二天），即试竞价开始时间 >=5月9日 24:00:00，显示试竞价开始时间，具体展示形式为【竞价开始时间 5月10日  19:00】

### time
prequalEndDate
currentDateTime
private Date lineTrialQuotationStartDate;
private Date lineTrialQuotationEndDate;
private Date lineQuotationStartDate;
private Date lineQuotationEndDate;
private Date headerQuotationEndDate;
private Date headerQuotationStartDate;

#### biddingTotalPricePrinciple
单价必输：UNIT_PRICE_REQUIRED；
总价必输：TOTAL_PRICE_REQUIRED


```
const categories = (function () {
  let now = new Date();
  let res = [];
  let len = 10;
  while (len--) {
    res.unshift(now.toLocaleTimeString().replace(/^\D*/, ''));
    now = new Date(+now - 2000);
  }
  return res;
})();
const categories2 = (function () {
  let res = [];
  let len = 10;
  while (len--) {
    res.push(10 - len - 1);
  }
  return res;
})();
const data = (function () {
  let res = [];
  let len = 10;
  while (len--) {
    res.push(Math.round(Math.random() * 1000));
  }
  return res;
})();
const data2 = (function () {
  let res = [];
  let len = 0;
  while (len < 10) {
    res.push(+(Math.random() * 10 + 5).toFixed(1));
    len++;
  }
  return res;
})();
option = {
  title: {
    text: 'Dynamic Data'
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'cross',
      label: {
        backgroundColor: '#283b56'
      }
    }
  },
  legend: {},
  toolbox: {
    show: true,
    feature: {
      dataView: { readOnly: false },
      restore: {},
      saveAsImage: {}
    }
  },
  dataZoom: {
    show: false,
    start: 0,
    end: 100
  },
  xAxis: [
    {
      type: 'category',
      boundaryGap: true,
      data: categories
    },
    {
      type: 'category',
      boundaryGap: true,
      data: categories2
    }
  ],
  yAxis: [
    {
      type: 'value',
      scale: true,
      name: 'Price',
      max: 30,
      min: 0,
      boundaryGap: [0.2, 0.2]
    },
    {
      type: 'value',
      scale: true,
      name: 'Order',
      max: 1200,
      min: 0,
      boundaryGap: [0.2, 0.2]
    }
  ],
  series: [
    {
      name: 'Dynamic Bar',
      type: 'bar',
      xAxisIndex: 1,
      yAxisIndex: 1,
      data: data
    },
    {
      name: 'Dynamic Line',
      type: 'line',
      data: data2
    }
  ]
};
app.count = 11;
setInterval(function () {
  let axisData = new Date().toLocaleTimeString().replace(/^\D*/, '');
  data.shift();
  data.push(Math.round(Math.random() * 1000));
  data2.shift();
  data2.push(+(Math.random() * 10 + 5).toFixed(1));
  categories.shift();
  categories.push(axisData);
  categories2.shift();
  categories2.push(app.count++);
  myChart.setOption({
    xAxis: [
      {
        data: categories
      },
      {
        data: categories2
      }
    ],
    series: [
      {
        data: data
      },
      {
        data: data2
      }
    ]
  });
}, 2100);
```

## purchase



## 数据同步
### 个性化
'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE.LINE', // 报价行信息
'SSRC.BIDDING_HALL_SUPPLIER.UNIT_PRICE.LINE_SEARCH',
'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL.ITEM_LINE',
'SSRC.BIDDING_HALL_SUPPLIER.TOTAL_PRICE_DETAIL.ITEM_LINE_SEARCH',


RFX2023072500034 unit
RFX2023080100011 total

@ApiModelProperty(value = "单价竞价规则: WHOLE_BATCH 整单批量出价、SINGLE_ITEM 单物料出价(竞价大厅专用字段)")
	private String biddingUnitPriceRule;

  /**
    * 整单批量出价
    */
  public static final String WHOLE_BATCH = "WHOLE_BATCH";
  /**
    * 单物料出价
    */
  public static final String SINGLE_ITEM = "SINGLE_ITEM";




1.针对密封场景下，供应商的接受信息，是在【正式竞价结束后】还是【补充单价结束】后展示？----正式竞价结束后
2.采购方可选择哪些非淘汰的供应商进行补充单价，是否可以放在竞价大厅，类似于操作禁止/删除报错的地方，增加发送供补充单价？------允许所有已接受过的供应商可补充单价
3.关于密封报价的场景，未入围的供应商，在后续轮次不能看到哪些信息（如下一轮叫价、下一轮竞价时间、包括导航栏每个节点的时间信息）----只有日式竞价，针对未入围的供应商，在列表隐藏竞价大厅的按钮，等到正式竞价结束后，在列表展示竞价大厅的按钮
4.导航栏节点后（括号的时间和悬浮时间），针对日式/荷兰式场景隐藏
5.由于您连续X轮未接受，您无法参与后续的竞价过程
