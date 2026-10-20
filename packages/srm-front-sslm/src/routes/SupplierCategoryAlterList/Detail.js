/* eslint-disable dot-notation */
import React, { Component } from 'react';
import { Button, Form, Table, Col, Row, Modal, Divider, Tabs, Spin, Tag } from 'hzero-ui';
import { connect } from 'dva';
import moment from 'moment';
import { enableRender, dateRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { Header, Content } from 'components/Page';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
// import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { createPagination, getCurrentOrganizationId, getAccessToken } from 'utils/utils';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { isReview, reviewFile, downLoadFile } from '@/routes/components/utils';
import styles from './index.less';

const { TabPane } = Tabs;
const { Item: FormItem } = Form;

const formItemLayout = {
  labelCol: { span: 9 },
  wrapperCol: { span: 15 },
};

const customizeUnitCode = [
  'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.HEADER',
  'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.ATTACHMENT_TABLE',
  'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.CATEGORY_TABLE',
];
@connect(({ supplierCategoryAlterList, user = {}, loading }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  let themeConfig = {};
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    themeConfig = {
      primaryColor: colorCode,
      tabsPrimaryColor: componentsColor['tabs-primary-color'],
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {
    supplierCategoryAlterList,
    user,
    tenantId: getCurrentOrganizationId(),
    formLoading: loading.effects['supplierCategoryAlterList/querySupplierCategoryAlterDetail'],
    categoryLoading: loading.effects['supplierCategoryAlterList/queryCurrentSupplierCtg'],
    ...themeConfig,
  };
})
@formatterCollections({
  code: ['sslm.supplierCategoryAlter', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
@withCustomize({
  unitCode: [
    'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.ATTACHMENT_TABLE',
    'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.CATEGORY_TABLE',
    'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.HEADER',
  ],
})
@Form.create({ fieldNameProp: null })
export default class Detail extends Component {
  constructor(props) {
    super(props);
    const { match } = this.props;
    const isNew = match.path.indexOf('create') !== -1;
    const categoryAlterId = isNew ? undefined : match.params.id;
    this.state = {
      processRecordVisible: false, // 操作记录模态框
      categoryAlterId, // 分类变更申请 id
      // categoryAlterQueryParams: {}, // 变更分类查询参数
      // targetCategoryQueryParams: {}, // 目标分类查询参数
    };
  }

  componentDidMount() {
    const { categoryAlterId } = this.state;
    if (categoryAlterId) {
      this.queryDetail(categoryAlterId);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const {
      supplierCategoryAlter: {
        operationType: nextOperationType,
        supplierTenantId,
        supplierCompanyId,
      } = {},
    } = nextProps.supplierCategoryAlterList.supplierCategoryAlterDetail;
    if (nextOperationType !== prevState.operationType) {
      let updateObj = {}; // 启禁用状态控制变更对象
      let categoryAlterQueryParams = {}; // 变更分类查询条件对象
      let targetCategoryQueryParams = {}; // 目标分类查询条件对象
      switch (nextOperationType) {
        case 'ADD': // 新增分类
          updateObj = {
            currentCategoryIdEnable: false,
            targetCategoryIdEnable: true,
          };
          targetCategoryQueryParams = {
            supplierTenantId,
            supplierCompanyId,
            isAssignFlag: 0,
          };
          break;
        // case 'ALTER': // 变更分类
        //   updateObj = {
        //     currentCategoryIdEnable: true,
        //     targetCategoryIdEnable: true,
        //   };
        //   categoryAlterQueryParams = {
        //     supplierCompanyId,
        //     supplierTenantId,
        //     isAssignFlag: 1,
        //   };
        //   break;
        case 'ENABLE': // 启用分类
          updateObj = {
            currentCategoryIdEnable: true,
            targetCategoryIdEnable: false,
          };
          categoryAlterQueryParams = {
            supplierTenantId,
            supplierCompanyId,
            isAssignFlag: 1,
            isEnabledFlag: 0,
          };
          break;
        case 'DISABLE': // 禁用分类
          updateObj = {
            currentCategoryIdEnable: true,
            targetCategoryIdEnable: false,
          };
          categoryAlterQueryParams = {
            supplierTenantId,
            supplierCompanyId,
            isAssignFlag: 1,
            isEnabledFlag: 1,
          };
          break;
        default:
          break;
      }
      return {
        ...updateObj,
        targetCategoryQueryParams,
        categoryAlterQueryParams,
        operationType: nextOperationType,
        supplierTenantId,
        supplierCompanyId,
      };
    }
    return null;
  }

  /**
   * 查询供应商分类变更申请明细
   * @param {Number} categoryAlterId - 申请单 id
   */
  @Bind()
  queryDetail(categoryAlterId, page = {}) {
    const {
      dispatch,
      // supplierCategoryAlterList: { currentSupplierCtgPage = {} },
    } = this.props;
    const { categoryAlterId: detailId } = this.state;
    dispatch({
      type: 'supplierCategoryAlterList/querySupplierCategoryAlterDetail',
      payload: {
        categoryAlterId: categoryAlterId || detailId,
        page,
        customizeUnitCode,
      },
    }).then(res => {
      if (res) {
        // const { supplierTenantId, supplierCompanyId } = res;
        // // 查询当前供应商分类
        // dispatch({
        //   type: 'supplierCategoryAlterList/queryCurrentSupplierCtg',
        //   payload: {
        //     page: currentSupplierCtgPage,
        //     supplierTenantId,
        //     supplierCompanyId,
        //     isAssignFlag: 1,
        //   },
        // });
      }
    });
  }

  /**
   * 查询当前供应商分类
   * @param {Object} page - 分页查询参数
   */
  @Bind()
  queryCurrentSupplierCtg(page = {}) {
    const { dispatch } = this.props;
    const { supplierCompanyId, supplierTenantId } = this.state;
    dispatch({
      type: 'supplierCategoryAlterList/queryCurrentSupplierCtg',
      payload: {
        page,
        supplierCompanyId,
        supplierTenantId,
        isAssignFlag: 1,
        customizeUnitCode: customizeUnitCode.join(),
      },
    });
  }

  /**
   * 查询操作记录
   * @param {Object} pagination - 操作记录查询分页参数
   */
  @Bind()
  queryProcessRecord(pagination) {
    const { dispatch } = this.props;
    const { categoryAlterId } = this.state;
    dispatch({
      type: 'supplierCategoryAlterList/queryProcessRecord',
      payload: {
        page: pagination ? pagination.current : 0,
        size: pagination ? pagination.pageSize : 10,
        categoryAlterId,
      },
    });
  }

  /**
   * 关闭操作记录模态框
   */
  @Bind()
  handleCancel() {
    const { dispatch } = this.props;
    dispatch({
      type: 'supplierCategoryAlterList/updateState',
      payload: { processRecordList: {} },
    });
    this.setState({
      processRecordVisible: false,
    });
  }

  // 操作记录表格
  processRecordTable() {
    const {
      categoryLoading,
      supplierCategoryAlterList: { processRecordList = {} },
    } = this.props; // 当前供应商分类加载状态
    const columns = [
      {
        title: intl.get('sslm.supplierCategoryAlter.model.prReTable.loginName').d('操作人'),
        width: 150,
        dataIndex: 'loginName',
        render: (value, record) => record.realName || value,
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.prReTable.processDate').d('操作日期'),
        width: 150,
        dataIndex: 'processDate',
        render: dateRender,
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.prReTable.processStatus').d('动作'),
        width: 80,
        dataIndex: 'processStatusMeaning',
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.prReTable.processRemark').d('说明'),
        dataIndex: 'processRemark',
      },
    ];
    return (
      <Table
        bordered
        rowKey="recordId"
        columns={columns}
        loading={categoryLoading}
        dataSource={processRecordList.content}
        pagination={createPagination(processRecordList)}
        onChange={this.queryProcessRecord}
      />
    );
  }

  // 当前供应商分类表格
  categoryTable() {
    const {
      categoryLoading,
      supplierCategoryAlterList: { currentSupplierCtg = {} },
      customizeTable,
      custLoading,
    } = this.props; // 当前供应商分类加载状态
    const { categoryAlterId } = this.state;
    const columns = [
      {
        title: intl
          .get('sslm.supplierCategoryAlter.model.cateTable.categoryCode')
          .d('供应商分类代码'),
        width: 200,
        dataIndex: 'categoryCode',
      },
      {
        title: intl
          .get('sslm.supplierCategoryAlter.model.cateTable.categoryDesc')
          .d('供应商分类描述'),
        width: 200,
        dataIndex: 'categoryDescription',
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.cateTable.evaluationLevel').d('评级'),
        width: 80,
        dataIndex: 'evaluationLevel',
        render: (_, record) => record.evaluationLevelMeaning,
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.cateTable.evaluationScore').d('评分'),
        width: 80,
        dataIndex: 'evaluationScore',
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.categoryTable.changeType').d('变更类型'),
        dataIndex: 'operationTypeMeaning',
        width: 120,
      },
      {
        title: intl.get('hzero.common.status').d('状态'),
        width: 80,
        dataIndex: 'enabledFlag',
        render: enableRender,
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.categoryTable.alterReason').d('变更理由'),
        dataIndex: 'alterReason',
      },
      // {
      //   title: intl.get('sslm.supplierCategoryAlter.model.categoryTable.alterDate').d('变更时间'),
      //   width: 150,
      //   dataIndex: 'alterDate',
      //   render: dateRender,
      // },
    ];
    return customizeTable(
      {
        code: 'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.CATEGORY_TABLE',
      },
      <Table
        bordered
        rowKey="categoryId"
        columns={columns}
        loading={categoryLoading}
        dataSource={currentSupplierCtg.content}
        pagination={createPagination(currentSupplierCtg)}
        onChange={page => this.queryDetail(categoryAlterId, page)}
        custLoading={custLoading}
      />
    );
  }

  @Bind()
  showProcessModal() {
    const { dispatch } = this.props;
    const { categoryAlterId } = this.state;
    dispatch({
      type: 'supplierCategoryAlterList/queryProcessRecord',
      payload: {
        page: 0,
        size: 10,
        categoryAlterId,
      },
    }).then(res => {
      if (res) {
        this.setState({ processRecordVisible: true });
      }
    });
  }

  // 附件列表
  attachmentTable() {
    const {
      supplierCategoryAlterList: { categoryAlterAttachmentLine = [] },
      customizeTable,
      custLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('sslm.supplierCategoryAlter.model.attachTable.attachDesc').d('附件名称'),
        dataIndex: 'attachmentDesc',
        render: (val, record) => {
          return isReview(record.attachmentDesc) && record.attachmentUrl ? (
            <a
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => reviewFile(record.attachmentDesc, record.attachmentUrl)}
            >
              {val}
            </a>
          ) : (
            val
          );
        },
      },
      {
        title: intl
          .get('sslm.supplierCategoryAlter.model.attachTable.attachSize')
          .d('附件大小（Mb）'),
        width: 150,
        dataIndex: 'attachmentSize',
        render: text => {
          if (text) {
            const size = `${text / (1024 * 1024)}`;
            return size.substring(0, 5);
          } else {
            return 0;
          }
        },
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.attachTable.uploadUserId').d('上传人'),
        width: 150,
        dataIndex: 'uploadUserId',
        render: (_, record) => record.realName || record.loginName,
      },
      {
        title: intl.get('sslm.supplierCategoryAlter.model.attachTable.uploadDate').d('上传时间'),
        width: 100,
        dataIndex: 'uploadDate',
        render: dateRender,
      },
      {
        title: intl.get(`hzero.common.button.action`).d('操作'),
        align: 'left',
        width: 80,
        render: (val, record) => {
          const { tenantId, attachmentUrl } = record;
          return (
            record.attachmentUrl && (
              <a
                href={downLoadFile({ tenantId, attachmentUrl })}
                target="_blank"
                rel="noopener noreferrer"
              >
                {intl.get('hzero.common.button.download').d('下载')}
              </a>
            )
          );
        },
      },
    ];
    return customizeTable(
      {
        code: 'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.ATTACHMENT_TABLE',
      },
      <Table
        bordered
        rowKey="attachmentLineId"
        columns={columns}
        dataSource={categoryAlterAttachmentLine}
        custLoading={custLoading}
      />
    );
  }

  render() {
    const {
      supplierCategoryAlterList: {
        supplierCategoryAlterDetail = {},
        categoryAlterAttachmentLine = [],
      },
      form,
      form: { getFieldDecorator },
      formLoading, // 请求详情信息加载状态
      match,
      customizeForm,
      custLoading,
      tabsPrimaryColor,
    } = this.props;
    const {
      categoryAlterId,
      processRecordVisible, // 操作记录模态框显示状态
      // categoryAlterQueryParams,
      // targetCategoryQueryParams,
    } = this.state;
    const {
      supplierCategoryAlter,
      supplierCategoryAlter: {
        categoryAlterNumber, // 申请单号
        // categoryAlterName, // 变更分类名
        // processStatus, // 状态
        processStatusMeaning, // 状态
        loginName, // 创建人登录名
        realName, // 创建人名
        supplierZhOrEnCompanyNum, // 供应商名称
        supplierCompanyNum, // 供应商编码
        creationDate, // 创建日期
        alterReason, // 变更理由
        remark, // 备注
        // operationTypeMeaning, // 操作类型
        // currentCategoryId, // 变更分类 id
        // currentEvaluationLevel, // 当前评级
        // currentEvaluationScore, // 当前评分
        // targetCategoryId, // 目标分类 id
        // targetCategoryName, // 目标分类名
        // targetEvaluationLevel, // 目标评级
        // targetEvaluationScore, // 目标评分
      } = {},
    } = supplierCategoryAlterDetail;
    const spinning = categoryAlterId ? formLoading : false;

    // 附件
    const accessToken = getAccessToken();
    const headers = {};
    if (accessToken) {
      headers.Authorization = `bearer ${accessToken}`;
    }
    const basePath =
      match.path.indexOf('/detail') === -1
        ? match.path.substring(0, match.path.indexOf('/create'))
        : match.path.substring(0, match.path.indexOf('/detail'));

    return (
      <React.Fragment>
        <Header
          title={intl
            .get('sslm.supplierCategoryAlter.view.title.supplyCategoryAlter')
            .d('供应商分类变更申请')}
          backPath={`${basePath}/list`}
        >
          <Button
            type="primary"
            icon="clock-circle-o"
            onClick={this.showProcessModal}
            loading={spinning}
          >
            {intl.get('sslm.supplierCategoryAlter.view.button.actionHistory').d('操作记录')}
          </Button>
        </Header>
        <Content>
          <Spin spinning={spinning}>
            <div className={styles['header']}>
              <div className={styles['second-title']}>
                <span className={styles['vertical-line']} />
                {intl.get('sslm.supplierCategoryAlter.view.title.dividerBasic').d('基本信息')}
              </div>
              <Divider style={{ marginTop: 16, marginBottom: 16 }} />
            </div>
            <div className={styles['information-container']}>
              {customizeForm(
                {
                  code: 'SSLM.SUP_CATEGORY_ALTER_QUERY_DETAIL.HEADER',
                  form,
                  dataSource: supplierCategoryAlter,
                },
                <Form className="ued-edit-form form-wrap" custLoading={custLoading}>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.supplierCategoryAlter.model.suCaAlter.cateAlterNum')
                          .d('申请单号')}
                      >
                        {getFieldDecorator('categoryAlterNumber', {
                          initialValue: categoryAlterNumber,
                        })(<span>{categoryAlterNumber}</span>)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl.get('hzero.common.status').d('状态')}
                      >
                        {getFieldDecorator('processStatusMeaning', {
                          initialValue: processStatusMeaning,
                        })(
                          <span>
                            {processStatusMeaning ||
                              intl.get('hzero.common.button.create').d('新建')}
                          </span>
                        )}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl.get('sslm.common.view.creator.name').d('创建人')}
                      >
                        {getFieldDecorator('loginName', {
                          initialValue: realName || loginName,
                        })(<span>{realName || loginName}</span>)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.supplierCategoryAlter.model.supply.supplyCompanyName')
                          .d('供应商名称')}
                      >
                        {getFieldDecorator('supplierNameLov', {
                          initialValue: supplierZhOrEnCompanyNum,
                        })(<span>{supplierZhOrEnCompanyNum}</span>)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.supplierCategoryAlter.model.suCaAlter.supplyCompNum')
                          .d('供应商编码')}
                      >
                        {getFieldDecorator('supplierCompanyNum', {
                          initialValue: supplierCompanyNum,
                        })(<span>{supplierCompanyNum}</span>)}
                      </FormItem>
                    </Col>
                    <Col span={8}>
                      <FormItem
                        {...formItemLayout}
                        label={intl.get('hzero.common.date.creation').d('创建日期')}
                      >
                        {getFieldDecorator('creationDate', {
                          initialValue: moment(creationDate),
                        })(<span>{dateRender(creationDate)}</span>)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem
                        {...formItemLayout}
                        label={intl
                          .get('sslm.supplierCategoryAlter.model.suCaAlter.alterReason')
                          .d('变更理由')}
                      >
                        {getFieldDecorator('alterReason', {
                          initialValue: alterReason,
                        })(<span>{alterReason}</span>)}
                      </FormItem>
                    </Col>
                  </Row>
                  <Row>
                    <Col span={12}>
                      <FormItem
                        {...formItemLayout}
                        label={intl.get('hzero.common.remark').d('备注')}
                      >
                        {getFieldDecorator('remark', {
                          initialValue: remark,
                        })(<span>{remark}</span>)}
                      </FormItem>
                    </Col>
                  </Row>
                </Form>
              )}
            </div>
          </Spin>
          <Tabs defaultActiveKey="1" animated={false}>
            <TabPane
              tab={intl
                .get('sslm.supplierCategoryAlter.view.title.tabCurrentCtg')
                .d('当前供应商分类')}
              key="1"
            >
              {this.categoryTable()}
            </TabPane>
            <TabPane
              tab={
                <span>
                  {intl.get('sslm.supplierCategoryAlter.view.title.tabAttachment').d('附件信息')}
                  <Tag
                    color={tabsPrimaryColor || '#108ee9'}
                    style={{
                      height: 'auto',
                      lineHeight: '15px',
                      marginLeft: '4px',
                    }}
                  >
                    {categoryAlterAttachmentLine && Array.isArray(categoryAlterAttachmentLine)
                      ? categoryAlterAttachmentLine.length
                      : 0}
                  </Tag>
                </span>
              }
              key="2"
            >
              {this.attachmentTable()}
            </TabPane>
          </Tabs>
        </Content>
        <Modal
          destroyOnClose
          title={intl.get('sslm.supplierCategoryAlter.view.button.actionHistory').d('操作记录')}
          visible={processRecordVisible}
          onCancel={this.handleCancel}
          footer={null}
          width={800}
        >
          {this.processRecordTable()}
        </Modal>
      </React.Fragment>
    );
  }
}
