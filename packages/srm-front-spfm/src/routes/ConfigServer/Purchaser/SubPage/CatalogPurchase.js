/*
 * 配置中心 - 目录化采购
 * @date: 2019-2-23
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Row, Col, Form, Select, Checkbox as Checkbox1, InputNumber } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined } from 'lodash';
import classnames from 'classnames';
import intl from 'utils/intl';
import Checkbox from 'components/Checkbox';

import styles from './index.less';
import SubMessage from '../../components/SubMessage';
// import SubCheckBox from '../../components/SubCheckBox';
import TouristModal from './TouristModal';

const CheckboxGroup = Checkbox1.Group;
@Form.create({ fieldNameProp: null })
export default class CatalogPurchase extends React.Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  handleSingleRule() {
    const { handleModal } = this.props;
    if (handleModal) {
      handleModal('splitOrderRulesVisible', true);
    }
  }

  /**
   * 进入游客模式的自定义列表
   */
  @Bind()
  handleModalVisible(visibleKey) {
    const { handleModal, form } = this.props;
    if (handleModal) {
      form.resetFields(); // 未保存的数据重置为初始状态
      handleModal(visibleKey, true);
    }
  }

  /**
   * 模态框的显示/隐藏
   */
  @Bind()
  changeEnabled(val, type) {
    const {
      form: { setFieldsValue },
    } = this.props;
    setFieldsValue({ [type]: val });
    let tmpVal = [];
    if (val) {
      tmpVal = ['COMPANY', 'GROUP'];
    }
    if (type === '011015') {
      setFieldsValue({ '011016': tmpVal });
    } else if (type === '011017') {
      setFieldsValue({ '011018': tmpVal });
    } else if (type === '011021') {
      setFieldsValue({ '011022': tmpVal });
    }
  }

  render() {
    const {
      saving,
      loading,
      onSave,
      settings,
      enumMap,
      handleModal,
      touristVisible,
      configHideArr = [],
      form: { getFieldDecorator, getFieldValue, setFieldsValue },
    } = this.props;
    const { mergeRules = [], productApprove = [], parityRules = [] } = enumMap;
    const touristModalProps = {
      onSave,
      settings,
      pagination: false,
      form: this.props.form,
      visible: touristVisible,
      loading: loading || saving,
      onCancel: () => handleModal('touristVisible', false),
    };
    const plainOptions = [
      {
        label: intl
          .get(`spfm.configServer.view.purchaseContract.message.companyMapping`)
          .d('公司物料映射'),
        value: 'COMPANY',
      },
      {
        label: intl
          .get(`spfm.configServer.view.purchaseContract.message.groupMapping`)
          .d('集团物料映射'),
        value: 'GROUP',
      },
    ];
    const configList = [
      {
        key: 1,
        href: 'purDismanRules',
        title: intl.get(`spfm.configServer.view.catalogPurchase.message.dismanRules`).d('拆单规则'),
        component: (
          <Row>
            <Col span={24}>
              {intl.get(`spfm.configServer.view.catalogPurchase.message.dismanRules`).d('拆单规则')}
            </Col>
            <Col span={24} className={styles['version-rule']}>
              <Form layout="inline" className={classnames(styles['form-item'], 'sub-item-fields')}>
                <Form.Item
                  label={intl
                    .get(`spfm.configServer.view.catalogPurchase.message.011000`)
                    .d('采购申请创建&拆单规则定义')}
                >
                  {getFieldDecorator('011000', {
                    initialValue: settings['011000'] || 'DEFAULT',
                  })(
                    <Select showSearch style={{ width: '150px' }}>
                      {mergeRules.map((item) => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Form>
              {getFieldValue('011000') === 'CUSTOMIZE' && (
                <a onClick={() => this.handleSingleRule()}>
                  {intl
                    .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                    .d('进入定义列表')}
                </a>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.catalogPurchase.message.011000subMsg`)
                .d(
                  '采购方商城选买时，系统会根据所配置的规则判断将所购买的商品拆分成不同的采购申请。'
                )}
            />
          </Row>
        ),
      },
      {
        key: 2,
        href: 'pur011002label',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011002label`)
          .d('商品维护审批'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011002label`)
                .d('商品维护审批')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011002`)
                .d('目录化商品维护审批方式')}
              ：
              <Form.Item>
                {getFieldDecorator('011003', {
                  initialValue: settings['011003'],
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.view.purchaseContract.message.011002`)
                          .d('目录化商品维护审批方式'),
                      }),
                    },
                  ],
                })(
                  <Select
                    showSearch
                    style={{ width: '150px' }}
                    allowClear
                    // onChange={this.change011003}
                  >
                    {productApprove.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011002subMsg`)
                .d(
                  '选择启用审批，则在商品维护提交后需要进行审批，工作流审批需配合工作流定义使用。'
                )}
            />
          </Row>
        ),
      },
      {
        key: 3,
        href: 'pur011004label',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011004label`)
          .d('商品下架审批'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011004label`)
                .d('商品下架审批')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011004`)
                .d('目录化商品下架审批方式')}
              ：
              <Form.Item>
                {getFieldDecorator('011005', {
                  initialValue: settings['011005'],
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.view.purchaseContract.message.011004`)
                          .d('目录化商品下架审批方式'),
                      }),
                    },
                  ],
                })(
                  <Select showSearch style={{ width: '150px' }} allowClear>
                    {productApprove.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011004subMsg`)
                .d(
                  '选择启用审批，则在商品下架提交后需要进行审批，工作流审批需配合工作流定义使用。'
                )}
            />
          </Row>
        ),
      },
      {
        key: 4,
        href: 'pur011006label',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011006label`)
          .d('商品分享配置'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011006label`)
                .d('商品分享配置')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('011006', {
                initialValue: settings['011006'],
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.011006`)
                    .d('启用被分享商品的自动流程')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011006subMsg`)
                .d('勾选启用，则待提交和新建状态的被分享商品将会自动提交、审批通过、上架')}
            />
          </Row>
        ),
      },
      {
        key: 5,
        href: 'pur011019label',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011019label`)
          .d('比价单配置'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011019label`)
                .d('比价单配置')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011019`)
                .d('比价单启用规则')}
              ：
              <Form.Item style={{ marginRight: '10px' }}>
                {getFieldDecorator('011019', {
                  initialValue: isUndefined(settings['011019'])
                    ? '0'
                    : settings['011019'].toString(),
                  rules: [
                    {
                      required: true,
                      message: intl.get('hzero.common.validation.notNull', {
                        name: intl
                          .get(`spfm.configServer.view.purchaseContract.message.011019`)
                          .d('比价单启用规则'),
                      }),
                    },
                  ],
                })(
                  <Select showSearch style={{ width: '150px' }} allowClear>
                    {parityRules.map((item) => (
                      <Select.Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Select.Option>
                    ))}
                  </Select>
                )}
              </Form.Item>
              {getFieldValue('011019') === '1' && (
                <React.Fragment>
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.011020`)
                    .d('最小比价家数')}
                  ：
                  <Form.Item>
                    {getFieldDecorator('011020', {
                      initialValue: settings['011020'] || 2,
                      rules: [
                        {
                          required: getFieldValue('011019') === '1',
                          message: intl.get('hzero.common.validation.notNull', {
                            name: intl
                              .get(`spfm.configServer.view.purchaseContract.message.011020`)
                              .d('最小比价家数'),
                          }),
                        },
                        {
                          validator: (_, value, callback) => {
                            if (value && (Number(value) < 2 || Number(value) === 0)) {
                              callback(
                                new Error(
                                  intl
                                    .get('spfm.configServer.view.purchaseContract.message.min')
                                    .d('比价家数最小值为2')
                                )
                              );
                            } else if (value && Number(value) > 5) {
                              callback(
                                new Error(
                                  intl
                                    .get('spfm.configServer.view.purchaseContract.message.max')
                                    .d('比价家数最大值为5')
                                )
                              );
                            } else if (value && isNaN(value)) {
                              callback(
                                new Error(
                                  intl
                                    .get('scec.common.warning.standard.taxPrice.fallShort')
                                    .d('比价家数不符规范')
                                )
                              );
                            } else {
                              callback();
                            }
                          },
                        },
                      ],
                    })(<InputNumber min={2} max={5} precision={0} />)}
                  </Form.Item>
                </React.Fragment>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011019subMsg`)
                .d('开启比价单，则加入购物车时需要生成比价单')}
            />
          </Row>
        ),
      },
      {
        key: 6,
        href: 'pur011011label',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011011label`)
          .d('游客浏览'),
        component: (
          <Row className="sub-item">
            <Col span={24}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011011label`)
                .d('游客浏览')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px' }}
            >
              {getFieldDecorator('011011', {
                initialValue: settings['011011'] || 0,
              })(
                <Checkbox
                  onChange={(e) => {
                    setFieldsValue({ '011011': e.target.checked });
                  }}
                >
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.011011`)
                    .d('允许游客浏览商城首页')}
                </Checkbox>
              )}
              {getFieldValue('011011') === 1 && (
                <a onClick={() => this.handleModalVisible('touristVisible')}>
                  {intl
                    .get(`spfm.configServer.view.demandPool.message.enterDefineList`)
                    .d('进入定义列表')}
                </a>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011011subMsg`)
                .d(
                  '开启该功能，可以选择一家属于租户集团的子公司，以该子公司的商品范围与价格，作为游客浏览时的参照。'
                )}
            />
            <TouristModal {...touristModalProps} />
          </Row>
        ),
      },
      {
        key: 7,
        href: 'pur011015label',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011015label`)
          .d('物料映射'),
        component: (
          <Row className="sub-item" style={{ marginLeft: '29px' }}>
            <Col span={24} style={{ marginLeft: '-29px' }}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011015label`)
                .d('物料映射')}
            </Col>
            {!configHideArr.includes('pur011015label-1') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px', marginLeft: '-29px' }}
                >
                  {getFieldDecorator('011015', {
                    initialValue: settings['011015'] || 0,
                  })(
                    <Checkbox onChange={(e) => this.changeEnabled(e.target.checked, '011015')}>
                      {intl
                        .get(`spfm.configServer.view.purchaseContract.message.011015`)
                        .d('启用采购申请物料编码回写功能')}
                    </Checkbox>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.purchaseContract.message.011015subMsg`)
                    .d(
                      '启用回写功能，来源于商城的采购申请中商品行上的物料编码和库存组织进行内容校验，校验存在内容变更时，物料编码和库存组织回写至公司物料映射或者集团物料映射'
                    )}
                />
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('011016', {
                    initialValue: settings['011016']
                      ? Array.isArray(settings['011016'])
                        ? settings['011016']
                        : settings['011016'].split('&')
                      : [],
                  })(
                    <CheckboxGroup
                      disabled={!getFieldValue('011015')}
                      options={plainOptions}
                      onChange={(val) => {
                        if (val.length === 0) {
                          setFieldsValue({ '011015': 0 });
                        }
                      }}
                    />
                  )}
                </Col>
              </>
            )}
            {!configHideArr.includes('pur011015label-2') && (
              <>
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px', marginLeft: '-29px' }}
                >
                  {getFieldDecorator('011017', {
                    initialValue: settings['011017'] || 0,
                  })(
                    <Checkbox onChange={(e) => this.changeEnabled(e.target.checked, '011017')}>
                      {intl
                        .get(`spfm.configServer.view.purchaseContract.message.011017`)
                        .d('启用采购订单物料编码回写功能')}
                    </Checkbox>
                  )}
                </Col>
                <SubMessage
                  content={intl
                    .get(`spfm.configServer.view.purchaseContract.message.011017subMsg`)
                    .d(
                      '启用回写功能，根据采购订单创建来源于商城的采购申请，订单中商品行上的物料编码和库存组织进行内容校验，校验存在内容变更时，物料编码和库存组织回写至公司物料映射或者集团物料映射'
                    )}
                />
                <Col
                  span={24}
                  className={classnames('sub-item-fields', styles['flex-form-item'])}
                  style={{ marginTop: '-10px', lineHeight: '39px' }}
                >
                  {getFieldDecorator('011018', {
                    initialValue: settings['011018']
                      ? Array.isArray(settings['011018'])
                        ? settings['011018']
                        : settings['011018'].split('&')
                      : [],
                  })(
                    <CheckboxGroup
                      disabled={!getFieldValue('011017')}
                      options={plainOptions}
                      onChange={(val) => {
                        if (val.length === 0) {
                          setFieldsValue({ '011017': 0 });
                        }
                      }}
                    />
                  )}
                </Col>
              </>
            )}
          </Row>
        ),
      },
      {
        key: 8,
        href: 'pur011021label',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011021label`)
          .d('电商商品手动上架'),
        component: (
          <Row className="sub-item" style={{ marginLeft: '29px' }}>
            <Col span={24} style={{ marginLeft: '-29px' }}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011021label`)
                .d('电商商品手动上架')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px', marginLeft: '-29px' }}
            >
              {getFieldDecorator('011021', {
                initialValue: settings['011021'] || 0,
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.011021`)
                    .d('启用电商商品手动上架功能')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011021subMsg`)
                .d(
                  '启用该功能，则所有电商商品需要在集团级商品上下架管理中手动选择商品上架，否则电商商品为自动上架'
                )}
            />
          </Row>
        ),
      },
      // {
      //   key: 10,
      //   href: 'pur011023label',
      //   title: intl
      //     .get(`spfm.configServer.view.purchaseContract.message.011023label`)
      //     .d('是否启用个人收货地址'),
      //   component: (
      //     <Row className="sub-item" style={{ marginLeft: '29px' }}>
      //       <Col span={24} style={{ marginLeft: '-29px' }}>
      //         {intl
      //           .get(`spfm.configServer.view.purchaseContract.message.011023label`)
      //           .d('是否启用个人收货地址')}
      //       </Col>
      //       <Col
      //         span={24}
      //         className={classnames('sub-item-fields', styles['flex-form-item'])}
      //         style={{ marginTop: '-10px', lineHeight: '39px', marginLeft: '-29px' }}
      //       >
      //         {getFieldDecorator('011023', {
      //           initialValue: settings['011023'],
      //         })(
      //           <Checkbox>
      //             {intl
      //               .get(`spfm.configServer.view.purchaseContract.message.011023`)
      //               .d('启用个人收货地址')}
      //           </Checkbox>
      //         )}
      //       </Col>
      //       <SubMessage
      //         content={intl
      //           .get(`spfm.configServer.view.purchaseContract.message.011023subMsg`)
      //           .d('启用该功能，则所有电商收货地址为个人收货地址，否则为公司收货地址')}
      //       />
      //     </Row>
      //   ),
      // },
      {
        key: 11,
        href: 'pur011024label',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011024label`)
          .d('启用电商框架协议'),
        component: (
          <Row className="sub-item" style={{ marginLeft: '29px' }}>
            <Col span={24} style={{ marginLeft: '-29px' }}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011024label`)
                .d('启用电商框架协议')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px', marginLeft: '-29px' }}
            >
              {getFieldDecorator('011024', {
                initialValue: settings['011024'] || 0,
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.011024label`)
                    .d('启用电商框架协议')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011024subMsg`)
                .d('启用该功能，租户的电商商品来源，必须通过框架协议')}
            />
          </Row>
        ),
      },
      {
        key: 12,
        href: 'pur011026desc',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011026desc`)
          .d('个人信息绑定弹窗'),
        component: (
          <Row className="sub-item" style={{ marginLeft: '29px' }}>
            <Col span={24} style={{ marginLeft: '-29px' }}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011026desc`)
                .d('个人信息绑定弹窗')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px', marginLeft: '-29px' }}
            >
              {getFieldDecorator('011026', {
                initialValue: settings['011026'] || 0,
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.011026label`)
                    .d('首页提示绑定个人信息')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011026subMsg`)
                .d(
                  '开启该功能，租户下未绑定个人信息的用户登录时，将提示绑定个人信息，不勾选则不提示绑定个人信息'
                )}
            />
          </Row>
        ),
      },
      {
        key: 13,
        href: 'pur011027title',
        title: intl
          .get(`spfm.configServer.view.purchaseContract.message.011027title`)
          .d('商城协议商品配置'),
        component: (
          <Row className="sub-item" style={{ marginLeft: '29px' }}>
            <Col span={24} style={{ marginLeft: '-29px' }}>
              {intl
                .get(`spfm.configServer.view.purchaseContract.message.011027title`)
                .d('商城协议商品配置')}
            </Col>
            <Col
              span={24}
              className={classnames('sub-item-fields', styles['flex-form-item'])}
              style={{ marginTop: '-10px', lineHeight: '39px', marginLeft: '-29px' }}
            >
              {getFieldDecorator('011027', {
                initialValue:
                  settings['011027'] && settings['011027'] !== 0 ? 1 : settings['011027'],
              })(
                <Checkbox>
                  {intl
                    .get(`spfm.configServer.view.purchaseContract.message.011027label`)
                    .d('启用商品审批')}
                </Checkbox>
              )}
            </Col>
            <SubMessage
              content={intl
                .get(`spfm.configServer.view.purchaseContract.message.011027subMsg`)
                .d('启用该功能，可以对协议内商品信息进行审批')}
            />
          </Row>
        ),
      },
    ];
    return (
      <Row className="tab-content" id="purCatalogPurchase">
        <Col span={3}>
          <span className="label-col">
            {intl.get(`spfm.configServer.view.catalogPurchase.message.title`).d('目录化采购')}
          </span>
        </Col>
        <Col span={21} className="sub-item-right">
          {configList.map((o) => {
            if (configHideArr.includes(o.href)) {
              return null;
            } else {
              return o.component;
            }
          })}
          {/* <Row className="sub-item"> */}
          {/* <Col span={24}>
              {intl
                .get(`spfm.configServer.view.catalogPurchase.message.011001label`)
                .d('电商订单配置')}
            </Col> */}
          {/* <Col span={24} className={styles['version-rule']}>
              <Form layout="inline" className={classnames(styles['form-item'], 'sub-item-fields')}>
                <Form.Item
                  label={intl
                    .get(`${catalogPurchasePrompt}.message.011001`)
                    .d('电商采购订单自动创建生成')}
                >
                  {getFieldDecorator('011001', {
                    initialValue: `${settings['011001']}`,
                  })(
                    <Select showSearch style={{ width: '150px' }}>
                      {flag.map(item => (
                        <Select.Option key={item.value} value={item.value}>
                          {item.meaning}
                        </Select.Option>
                      ))}
                    </Select>
                  )}
                </Form.Item>
              </Form>
              {getFieldValue('011001') === 'CUSTOMIZE' && (
                <a onClick={() => this.handleSingleRule()}>
                  {intl
                    .get(`spfm.configServer.view.common.message.enterDefinitionList`)
                    .d('进入定义列表')}
                </a>
              )}
            </Col> */}
          {/* <SubCheckBox
              content={intl
                .get(`spfm.configServer.view.catalogPurchase.message.011001`)
                .d('电商采购订单自动创建生成')}
              getFieldDecorator={getFieldDecorator}
              initialValue={settings['011001']}
              field="011001"
            /> */}
          {/* <SubMessage
              content={intl
                .get(`spfm.configServer.view.catalogPurchase.message.011001subMsg`)
                .d(
                  '采购方商城选买时，系统会根据所配置的规则判断将电商的采购申请自动生成对应的采购订单。'
                )}
            /> */}
          {/* </Row> */}
        </Col>
      </Row>
    );
  }
}
