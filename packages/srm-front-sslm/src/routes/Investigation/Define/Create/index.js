/**
 * InvestigationMaintain 调查表维护页面
 * @date: 2018-7-25
 * @author dengtingmin <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 *  @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { connect } from 'dva';
import qs from 'querystring';
import { Form, Button, Input, Row, Col, Tabs, Select, Modal, Spin } from 'hzero-ui';
import { isEmpty, cloneDeep, unionBy, isArray } from 'lodash';
import { Bind } from 'lodash-decorators';

import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { Header, Content } from 'components/Page';
import Lov from 'components/Lov';
import remote from 'utils/remote';

import {
  getCurrentOrganizationId,
  getEditTableData,
  createPagination,
  getCurrentTenant,
  getResponse,
} from 'utils/utils';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import '@/routes/index.less';
import { fetchConfigTable } from '@/services/commonService';
import Investigation from '../../Component/Investigation';
import InvestigationMaintainTable from './InvestigationMaintainTable';

const { Option } = Select;
const FormItem = Form.Item;
const { TabPane } = Tabs;
@Form.create({ fieldNameProp: null })
@connect(({ investigationMaintain, loading }) => ({
  investigationMaintain,
  loading:
    loading.effects['investigationMaintain/investigateCreateAndRelease'] ||
    loading.effects['investigationMaintain/querySupplierInfo'] ||
    loading.effects['investigationMaintain/fetchLifeCycleDimConfigs'] ||
    loading.effects['investigationMaintain/investigateCreate'] ||
    loading.effects['investigationMaintain/checkReleaseBlackSupplier'],
}))
@formatterCollections({
  code: ['sslm.investMaintain', 'sslm.common', 'sslm.enterpriseInform'],
})
@withCustomize({
  unitCode: [
    'SSLM.INVESTIGATION_CREATE_DETAIL.HEADER',
    'SSLM.INVESTIGATION_CREATE_DETAIL.INVESTIGATE_SUPPLIERS',
    'SSLM.INVESTIGATION_CREATE_DETAIL.SELECT_SUPPLIERS',
  ],
})
@remote(
  {
    code: 'SSLM_INVESTIGATE_CREATE_OLD', // 对应二开模块暴露的Expose的编码
    name: 'investigateCreateRemote', // 默认 'remote'， 如有属性冲突可以改此属性
  },
  {
    events: {
      cuxHandleReleaseResp() {}, // 二开发布按钮报错
    },
  }
)
export default class Maintain extends PureComponent {
  constructor(props) {
    super(props);
    const routerParams = qs.parse(props.location.search.substr(1));
    const { sourceType, riskEventNum, riskProcessUuid } = routerParams;
    this.state = {
      sourceType,
      riskEventNum,
      riskProcessUuid,
      organizationId: getCurrentOrganizationId(),
      selectedRows: [], // 保存表格勾选后的数据
      selectedRowKeys: [], // 保存表格勾选后的id
      investigateTemplateId: '', // 保存调查表模板
      companyId: '', // 公司ID
      dimensionCode: '', // 调查表维度
      userInfo: {}, // 用户信息
      showOldModal: false,
      isAmktClient: sourceType === 'AMKT_CLIENT', // 单据来源为应用商店
    };
  }

  getSnapshotBeforeUpdate(prevProps) {
    const thisParams = qs.parse(this.props.location.search.substr(1));
    const prevParams = qs.parse(prevProps.location.search.substr(1));
    const { companyId, supplierCompanyId, sourceType } = thisParams;
    const { companyId: prevCompanyId, supplierCompanyId: prevSupplierCompanyId } = prevParams;
    if (companyId !== prevCompanyId || supplierCompanyId !== prevSupplierCompanyId) {
      return { companyId, supplierCompanyId, sourceType };
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    if (snapshot && (snapshot.companyId || snapshot.supplierCompanyId)) {
      this.querySupplierInfo(snapshot);
    }
    if (prevProps.custLoading && !this.props.custLoading) {
      this.forceUpdate();
    }
  }

  componentDidMount() {
    const { dispatch, form, location } = this.props;
    const routerParams = qs.parse(location.search.substr(1));
    const { companyId, supplierCompanyId, sourceType } = routerParams;
    this.batchCode();
    this.dimensionConfig();
    this.getUserDefaultMsg();
    // 将表单与model的值清空
    form.resetFields();
    dispatch({
      type: 'investigationMaintain/updateState',
      payload: {
        investigationList: {
          content: [],
          investigationPagination: {},
        },
      },
    });
    if (companyId || supplierCompanyId) {
      this.querySupplierInfo({ companyId, supplierCompanyId, sourceType });
    }
    // 查询配置表展示不同的选择供应商弹窗
    fetchConfigTable({
      configCode: 'source_supplier_lov_old_config',
      data: {
        tenantNum: getCurrentTenant().tenantNum,
      },
    }).then(res => {
      if (getResponse(res)) {
        this.setState({
          showOldModal: !isEmpty(res),
        });
      }
    });
  }

  /**
   * 工作台行新建查询信息
   * @param {*} payload - 查询参数
   */
  @Bind()
  querySupplierInfo(payload) {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationMaintain/querySupplierInfo',
      payload,
    }).then(res => {
      if (res) {
        const content = [
          {
            ...res,
            companyNum: res.supplierCompanyNum,
            companyName: res.supplierCompanyName,
            _status: 'update',
          },
        ];
        const pageObject = {
          content,
          number: 0,
          size: 10,
          totalElements: content.length,
        };
        dispatch({
          type: 'investigationMaintain/updateState',
          payload: {
            dimensionConfig: { ...res },
            investigationList: {
              content,
              investigationPagination: createPagination(pageObject),
            },
          },
        });
      }
    });
  }

  /**
   * 查询用户默认信息
   */
  @Bind()
  getUserDefaultMsg() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationMaintain/getUserDefaultMsg',
    }).then(res => {
      if (res) {
        this.setState({ userInfo: res });
      }
    });
  }

  /**
   * 管控维度配置获取
   */
  @Bind()
  dimensionConfig() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationMaintain/fetchLifeCycleDimConfigs',
    }).then(res => {
      if (res) {
        this.setState({ dimensionCode: res.dimensionCode });
      }
    });
  }

  /**
   * 值级获取
   */
  @Bind()
  batchCode() {
    const { dispatch } = this.props;
    dispatch({
      type: 'investigationMaintain/batchCode',
    });
  }

  /**
   * 调查表模板lov获得调查表模板ID
   * @param {string} text -当前lov选择值
   * @param {Object} record --当前lov行数据
   */
  @Bind()
  fetchTemplateId(text, record = {}) {
    this.setState({
      investigateTemplateId: text && text !== undefined ? record.investigateTemplateId : '',
    });
  }

  /**
   * 选择调查表类型后,调查表模板显示的值
   */
  @Bind()
  handleSelectChange() {
    const { form } = this.props;
    form.resetFields(['investigateTemplateId']);
    this.setState({
      investigateTemplateId: '',
    });
  }

  /**
   * 选择调查表管控维度后,调查表公司显示的值
   */
  @Bind()
  handleLevelSelectChange(record = {}) {
    const { form } = this.props;
    this.companyOnChange();
    this.setState({ dimensionCode: record }, () => {
      form.resetFields(['companyId']);
    });
  }

  /**
   * 编辑调查表
   * @param {object} record --当前行数据
   * @param {boolean} flag --是否编辑
   */
  @Bind()
  handlerEditInvestigation(record = {}, flag) {
    const {
      dispatch,
      investigationMaintain: {
        investigationList: { content },
      },
    } = this.props;
    const index = content.findIndex(item => item.companyNum === record.companyNum);
    const updateFlag = flag ? 'update' : '';
    dispatch({
      type: 'investigationMaintain/updateState',
      payload: {
        investigationList: {
          content: [
            ...content.slice(0, index),
            {
              ...record,
              _status: updateFlag,
            },
            ...content.slice(index + 1),
          ],
        },
      },
    });
  }

  /**
   * 表格勾选某一行ID与某一行数据
   * @param {object} selectedRowKeys --勾选数据Key
   * @param {object} selectedRows    --勾选当前行数据
   */
  @Bind()
  handleRowSelectChange(selectedRowKeys, selectedRows) {
    this.setState({
      selectedRows,
      selectedRowKeys,
    });
  }

  /**
   * 保存表格中lov选择的数据，新建
   * @param {object} record --点击lov后对应一行的值
   * @param {boolean} flag --是否编辑
   */
  @Bind()
  saveRecordRows(record = []) {
    const {
      dispatch,
      investigationMaintain: { investigationList = {} },
    } = this.props;
    let result = investigationList.content;
    // 判断是否是新增的数据且判断历史数据与新增数据是否一致
    const flagList = [];
    investigationList.content.forEach(e => {
      record.forEach(ele => {
        if (e.companyNum === ele.companyNum) {
          flagList.push(ele);
        }
      });
    });
    if (
      // isEmpty((investigationList.content || []).filter(o => o.companyNum === record.companyNum))
      flagList.length < 1
    ) {
      const _status = 'update';
      record.forEach(item => {
        const copyList = { ...item, _status };
        result.push(copyList);
      });
    } else {
      result = result.filter(item => item.companyNum);
      notification.warning({
        message: intl
          .get('sslm.investMaintain.view.message.investMaintain.repetition')
          .d('不可选择已存在供应商'),
      });
    }
    const pageObject = {
      content: result,
      number: 0,
      size: 10,
      totalElements: result.length,
    };
    dispatch({
      type: 'investigationMaintain/updateState',
      payload: {
        investigationList: {
          content: result,
          investigationPagination: createPagination(pageObject),
        },
      },
    });
  }

  @Bind()
  handleReset(params = {}) {
    const { backList = true, investgHeaderId, investigateTemplateId } = params;
    const { form, dispatch, history } = this.props;
    // 将表单清空
    form.resetFields();
    // 将model里面的值清空
    dispatch({
      type: 'investigationMaintain/updateState',
      payload: {
        investigationList: {
          content: [],
          investigationPagination: {},
        },
      },
    });
    if (backList) {
      history.push(`/sslm/investigation/list`);
    } else {
      history.push({
        pathname: `/sslm/investigation/detail`,
        search: qs.stringify({
          investgHeaderId,
          investigateTemplateId,
        }),
      });
    }
  }

  /**
   * 确定与确定发布
   * @param {number} selectButton --1为确定，0为确定且发布
   */
  @Bind()
  handlerRelease(selectButton = {}) {
    const {
      dispatch,
      form,
      investigationMaintain: { investigationList = {} },
    } = this.props;
    const { content: tableList = [] } = investigationList;
    const { organizationId, sourceType, riskEventNum, riskProcessUuid } = this.state;
    const { number } = selectButton;
    const params = getEditTableData(investigationList.content, ['_status']);
    if (Array.isArray(params) && params.length === 0) {
      notification.warning({
        message: intl.get('sslm.investMaintain.view.message.noNewData').d('未进行数据新增或编辑'),
      });
      return;
    }
    const editSupplierList = investigationList.content.filter(
      item => item._status === 'update' || item._status === 'create'
    );
    const selectSupplierList = unionBy(params, editSupplierList, 'companyNum');

    // 判断表单的值
    form.validateFields((err, values) => {
      if (!err) {
        const otherValue = {
          finalFlag: '',
          investgNumber: '',
          partnerRemark: '',
          processDate: undefined,
          releaseDate: undefined,
          submitDate: undefined,
          tenantId: organizationId,
          triggerByCode: '',
          triggerById: '',
        };
        const featchEndData = selectSupplierList.map(item => {
          const copyList = {
            ...item,
            ...values,
            ...otherValue,
            sourceType,
            riskEventNum,
            riskProcessUuid,
          };
          // eslint-disable-next-line
          delete copyList[`buildDate`];
          // eslint-disable-next-line
          delete copyList[`createUserName`];
          return copyList;
        });
        if (investigationList.content.length < 1) {
          notification.warning({
            message: intl
              .get('sslm.investMaintain.view.message.noData')
              .d('请至少选择一项需调查的供应商'),
          });
          return;
        }
        const payload = {
          body: featchEndData,
          organizationId,
          customizeUnitCode: [
            'SSLM.INVESTIGATION_CREATE_DETAIL.HEADER',
            'SSLM.INVESTIGATION_CREATE_DETAIL.INVESTIGATE_SUPPLIERS',
            'SSLM.INVESTIGATION_CREATE_DETAIL.SELECT_SUPPLIERS',
          ].join(),
        };
        dispatch({
          type:
            number === 1
              ? 'investigationMaintain/investigateCreate'
              : // 校验黑名单供应商
                'investigationMaintain/checkReleaseBlackSupplier',
          payload,
        }).then(res => {
          if (!isEmpty(res)) {
            if (number === 1) {
              // 保存
              notification.success();
              if (tableList.length === 1) {
                // 跳转发布页
                const reslut = isArray(res) ? res[0] : {};
                const { investgHeaderId, investigateTemplateId } = reslut || {};
                this.handleReset({
                  backList: false,
                  investgHeaderId,
                  investigateTemplateId,
                });
              } else {
                // 返回列表页
                this.handleReset();
              }
            } else {
              // 发布
              this.handleRelease(payload);
            }
          }
        });
      }
    });
  }

  // 发布调查表
  @Bind()
  handleRelease(payload) {
    const { dispatch, modal, investigateCreateRemote } = this.props;
    const { isAmktClient } = this.state;
    let response = {};
    dispatch({
      type: 'investigationMaintain/investigateCreateAndRelease',
      payload,
    })
      .then(res => {
        response = res;
        if (getResponse(res)) {
          notification.success();
          // 如果是应用商店跳转过来的，发布后什么都不渲染
          if (isAmktClient) {
            if (modal) {
              modal.close();
            }
          }
        }
      })
      .finally(async () => {
        // 如果是应用商店跳转过来的，发布后不返回详情页
        if (!isAmktClient) {
          // 发布不管是否成功都返回列表页
          // 二开埋点增加报错处理，不返回列表页
          const eventProps = {
            response,
          };
          const resultFlag = await investigateCreateRemote.event.fireEvent(
            'cuxHandleReleaseResp',
            eventProps
          );
          if (!resultFlag) {
            return;
          }
          this.handleReset();
        }
      });
  }

  /**
   * 删除(非接口删除)
   */
  @Bind()
  fetchDeleteInvestigation() {
    const { selectedRows } = this.state;
    const {
      dispatch,
      investigationMaintain: { investigationList = {} },
    } = this.props;
    const queryList = cloneDeep(investigationList.content);
    for (let i = 0; i < queryList.length; i++) {
      for (let j = 0; j < selectedRows.length; j++) {
        if (queryList[i].sourceKey === selectedRows[j].sourceKey) {
          queryList.splice(i, 1);
        }
      }
    }
    const pageObject = {
      content: queryList,
      number: 0,
      size: 10,
      totalElements: queryList.length,
    };
    dispatch({
      type: 'investigationMaintain/updateState',
      payload: {
        investigationList: {
          content: queryList,
          investigationPagination: createPagination(pageObject),
        },
      },
    });
    this.setState({
      selectedRows: [],
      selectedRowKeys: [],
    });
  }

  /**
   * 确定保存提示框
   */
  @Bind()
  handleConfirm() {
    const number = 1;
    this.handlerRelease({ number });
  }

  /**
   * 确定保存并发布提示框
   */
  @Bind()
  handlerSaveConfirm() {
    const { loading } = this.props;
    const { handlerRelease } = this;
    const number = 2;
    Modal.confirm({
      title: intl.get('sslm.investMaintain.view.message.warningContent').d('确定保存并发布吗?'),
      onOk() {
        return new Promise(resolve => {
          handlerRelease({ number });
          resolve();
        }).catch(() => {});
      },
      onCancel() {},
      confirmLoading: loading,
    });
  }

  @Bind()
  companyOnChange(record = {}) {
    const { isAmktClient } = this.state;
    const { form, dispatch } = this.props;
    form.setFieldsValue({
      investigateType: null,
      investigateTemplateId: null,
    });
    this.setState({ companyId: record.companyId });
    // 应用商店过来的自带供应商，变更公司不清空，后端校验是否合作
    if (!isAmktClient) {
      // 将model里面的值清空
      dispatch({
        type: 'investigationMaintain/updateState',
        payload: {
          investigationList: {
            content: [],
            investigationPagination: {},
          },
        },
      });
    }
  }

  // list表格
  getFeilds() {
    const { getFieldDecorator, getFieldsValue } = this.props.form;
    const { organizationId, userInfo } = this.state;
    const {
      form,
      customizeForm,
      custLoading,
      investigateCreateRemote,
      investigationMaintain: {
        code: { investigateTypeList = [], investigateLevelList = [] } = {},
        dimensionConfig = {},
        dimensionConfig: { dimensionCode } = {},
      },
    } = this.props;
    const formItemLayout = {
      labelCol: { span: 9 },
      wrapperCol: { span: 15 },
    };
    const { investigateType, companyId } = getFieldsValue();

    return customizeForm(
      {
        code: 'SSLM.INVESTIGATION_CREATE_DETAIL.HEADER',
        form,
        dataSource: dimensionConfig,
      },
      <Form className="ued-edit-form" custLoading={custLoading}>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.investMaintain.model.investMaintain.level').d('调查表管控维度')}
              {...formItemLayout}
            >
              {getFieldDecorator('investigateLevel', {
                initialValue: dimensionCode === 'BOTH' ? undefined : dimensionCode,
                rules: [
                  {
                    required: true,
                    message: intl
                      .get('sslm.investMaintain.model.investMaintain.level')
                      .d('调查表管控维度'),
                  },
                ],
              })(
                <Select allowClear onChange={this.handleLevelSelectChange}>
                  {investigateLevelList.map(n => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.common.view.company.name').d('公司')}
              {...formItemLayout}
            >
              {getFieldDecorator('companyId', {
                initialValue: dimensionConfig.companyId,
                rules: [
                  {
                    required: this.state.dimensionCode === 'COMPANY',
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.common.view.company.name').d('公司'),
                    }),
                  },
                ],
              })(
                <Lov
                  textValue={dimensionConfig.companyName}
                  code="SPFM.USER_AUTHORITY_COMPANY"
                  queryParams={{ tenantId: organizationId, enabledFlag: 1 }}
                  onChange={(_, lovRecord) => {
                    this.companyOnChange(lovRecord);
                  }}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.investMaintain.model.investMaintain.type').d('调查表类型')}
              {...formItemLayout}
            >
              {getFieldDecorator('investigateType', {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get('sslm.investMaintain.model.investMaintain.type')
                      .d('调查表类型'),
                  },
                ],
              })(
                <Select allowClear onChange={this.handleSelectChange}>
                  {investigateTypeList.map(n => (
                    <Option key={n.value} value={n.value}>
                      {n.meaning}
                    </Option>
                  ))}
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="writable-row">
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.investMaintain.model.investMaintain.template').d('调查表模板')}
              {...formItemLayout}
            >
              {getFieldDecorator('investigateTemplateId', {
                rules: [
                  {
                    required: true,
                    message: intl
                      .get('sslm.investMaintain.model.investMaintain.template')
                      .d('调查表模板'),
                  },
                ],
              })(
                <Lov
                  code="SSLM.INVESTIGATE_TEMPLATE_ID"
                  queryParams={{
                    organizationId,
                    enabledFlag: 1,
                    investigateType,
                    companyId,
                    assignMenuScope:
                      'srm.partner.investigation-po.investigatation-create-and-release',
                  }}
                  onChange={(text, record) => {
                    this.fetchTemplateId(text, record);
                  }}
                  disabled={!investigateType}
                />
              )}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.common.view.creator.name').d('创建人')}
              {...formItemLayout}
            >
              {getFieldDecorator('createUserName', {
                initialValue: userInfo.realName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={8}>
            <FormItem
              label={intl.get('sslm.common.view.creator.unitName').d('创建人部门')}
              {...formItemLayout}
            >
              {getFieldDecorator('unitName', {
                initialValue: userInfo.unitName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={48} className="half-row">
          <Col span={24}>
            <FormItem
              label={intl.get('sslm.investMaintain.model.investMaintain.remark').d('调查说明')}
            >
              {getFieldDecorator('remark')(<Input.TextArea rows={4} />)}
            </FormItem>
          </Col>
        </Row>
        {investigateCreateRemote.process(
          'SSLM_INVESTIGATE_CREATE_OLD_DETAIL_HEADER_INFO_EXTRA',
          null,
          { form, dimensionConfig }
        )}
      </Form>
    );
  }

  // tab切换页
  getTabs() {
    const {
      investigationMaintain: { investigationList = {} },
      customizeTable,
      custLoading,
      form,
      investigateCreateRemote,
    } = this.props;
    const { investigateTemplateId, companyId, showOldModal } = this.state;
    const { isAmktClient, organizationId, selectedRows, selectedRowKeys } = this.state;
    const selectSupper = {
      form,
      companyId,
      organizationId,
      investigationList,
      selectedRows,
      selectedRowKeys,
      isAmktClient,
      onSaveRecordRows: this.saveRecordRows,
      onDeleteRows: this.fetchDeleteInvestigation,
      onHandleRowSelectChange: this.handleRowSelectChange,
      onHandlerEditinvestigation: this.handlerEditInvestigation,
      custLoading,
      customizeTable,
      showOldModal,
      code: 'SSLM.INVESTIGATION_CREATE_DETAIL.INVESTIGATE_SUPPLIERS',
      investigateCreateRemote,
    };
    return (
      <Tabs defaultActiveKey="1" style={{ marginTop: '10px' }} animated={false}>
        <TabPane
          tab={intl.get('sslm.investMaintain.view.option.tabTileOne').d('选择调查的供应商')}
          key="1"
        >
          <InvestigationMaintainTable
            {...selectSupper}
            ref={ref => {
              this.companySearcMaintainTable = ref;
            }}
          />
        </TabPane>
        {this.state.investigateTemplateId === '' ? (
          <TabPane
            tab={intl.get('sslm.investMaintain.view.option.tabTileTwo').d('预览调查表内容')}
            key="2"
            disabled
          />
        ) : (
          <TabPane
            tab={intl.get('sslm.investMaintain.view.option.tabTileTwo').d('预览调查表内容')}
            key="2"
          >
            <Investigation
              investigateTemplateId={investigateTemplateId}
              organizationId={organizationId}
              key={investigateTemplateId}
              isEdit
              previewFlag
            />
          </TabPane>
        )}
      </Tabs>
    );
  }

  render() {
    const { loading } = this.props;
    const { isAmktClient } = this.state;
    return (
      <Spin spinning={loading || false}>
        <Header
          title={intl.get('sslm.investMaintain.view.option.headerTitle').d('调查表创建')}
          backPath={isAmktClient ? '' : '/sslm/investigation'}
        >
          <Button type="primary" icon="rocket" onClick={this.handlerSaveConfirm} loading={loading}>
            {intl.get('hzero.common.button.release').d('发布')}
          </Button>
          {!isAmktClient && (
            <Button icon="save" onClick={this.handleConfirm} loading={loading}>
              {intl.get('hzero.common.button.save').d('保存')}
            </Button>
          )}
        </Header>
        <Content>
          {this.getFeilds()}
          {this.getTabs()}
        </Content>
      </Spin>
    );
  }
}
