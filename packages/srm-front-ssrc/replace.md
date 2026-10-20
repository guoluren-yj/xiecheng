modelName ='supplierQuotation'

type: `${modelName}/updateState`,

const { modelName ='supplierQuotation' } = this.props;

[modelName]


expertScoring/

expertScoring:

qualificationExamination



原本统一用inquiryHall 现用功能模块数据隔离 新增nameSpace
inquiryHall 老询价大厅
inquiryHallNew 询价工作台
inquiryHallBid 招标工作台 
inquiryHallExpert 专家评分


原本统一用exportScoring 现用功能模块数据隔离 新增nameSpace
expertScoring 专家评分
expertScoringBidHall 招标工作台
expertScoringInquiryHall 询价工作台

原本统一用bargain 现用功能模块数据隔离 新增nameSpace
bargain 老询价大厅
bargainInquiryHall 询价工作台
bargainBidHall 招标工作台
bargainExpert 专家评分
bargainPub 工作流


替换正则:
type: ('|`)(supplierQuotation)(\/)(\w+)('|`)
type: `${modelName}$3$4`


(supplierQuotation)(: \{)
[modelName]$2

1. 页面改造  model/XXX [model]:
2. 更改成继承式
3. model改造
4. 增加入口， 改变modelName
5. 改造router.js（component替换，model替换）
6. 关注下改造页面的弹框 数据是传进去的还是自己查的，如果是自己dispatch的，要注意下，取值的models是从自己页面connect还是外面传进来的，传进来的要注意，可能要改

bidEventQuery
bidHall
inquiryHall
expertScoring
qualificationExamination
supplierBidQuery
supplierQuotation


@import '~hzero-front/lib/srm-variables.less';
@primary-color;

arrowIcon

primaryColor

.arrowIcon{
  margin-top: 10px;
  color: @primary-color;
}


 <Col span={8}>
              <Form.Item
                label={this.ruleForm('checkRecommendationStrategy')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('checkRecommendationStrategy', {
                  initialValue: dataSource.checkRecommendationStrategy || 'PRICE',
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.template.selectedStandard`)
                          .d('选用标准'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear disabled={isHistory || params.expertScoreType === 'NONE'}>
                    {map(checkRecommendationStrategys, (item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>

          <Col span={8}>
              <Form.Item
                label={this.ruleForm('checkSelectionDimension')}
                {...SEARCH_FORM_ITEM_LAYOUT}
              >
                {getFieldDecorator('checkSelectionDimension', {
                  initialValue:
                    dataSource.checkSelectionDimension ||
                    (params.onlyAllowAllWinBids ? 'ALL' : undefined),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`${promptCode}.model.template.selectedDimension`)
                          .d('选用维度'),
                      }),
                    },
                  ],
                })(
                  <Select allowClear disabled={isHistory || params.onlyAllowAllWinBids}>
                    {map(checkSelectionDimensions, (item) => (
                      <Select.Option value={item.value} key={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>

import SVGIcon from '@/routes/components/SvgIcon';


#### 二开埋点命名规范
1. 功能命名：SSRC_功能名 eg：核价 SSRC_CHECK_PRICE
2. render命名： SSRC_功能_RENDER_功能点 eg:核价比价的弹框 SSRC_CHECK_PRICE_RENDER_PRICE_MODAL
3. process命名：SSRC_功能_PROCESS_功能点 eg: 核价全部报价明细表格列 SSRC_CHECK_PRICE_PROCESS_ALL_QUOTATION_TABLE_COLUMNS
