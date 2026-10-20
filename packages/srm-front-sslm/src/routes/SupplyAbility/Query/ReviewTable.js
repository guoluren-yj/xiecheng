/**
 * ReviewTable
 * @date: 2018-10-9
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent, Fragment } from 'react';
import {
  Form,
  Table,
  Badge,
  Input,
  Row,
  Col,
  InputNumber,
  DatePicker,
  Tooltip,
  Icon,
} from 'hzero-ui';
import moment from 'moment';
import { connect } from 'dva';
import { isNumber, sum } from 'lodash';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';
import { dateRender } from 'utils/renderer';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import formatterCollections from 'utils/intl/formatterCollections';
import Switch from 'components/Switch';
import ValueList from 'components/ValueList';
import LovMulti from 'srm-front-cuz/lib/custH0X/LovMulti';
import { getComponentsThemeColor } from 'hzero-front/lib/layouts/NewLayout/utils';
import { renderAttachmentText } from '@/routes/components/utils';
import AttachmentModal from '../Tables/AttachmentModal';
import styles from '../index.less';

const FormItem = Form.Item;

/**
 * 推荐物料/品类
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} showEditModal 显示编辑模态框
 * @reactProps {Object} form 表单
 * @return React.element
 */
@formatterCollections({
  code: ['sslm.supplyAbility', 'sslm.common'],
})
@Form.create({ fieldNameProp: null })
@connect(({ user = {} }) => {
  const { currentUser: { themeConfigVO = {} } = {} } = user;
  const {
    enableThemeConfig, // 是否开启了新主题
    colorCode, // 主题色
    fontFileId,
    componentColorList, // 组件主题列表
  } = themeConfigVO;
  if (enableThemeConfig) {
    const componentsColor = getComponentsThemeColor(componentColorList, colorCode);
    return {
      primaryColor: colorCode,
      linkColor: componentsColor['link-color'],
      anchorColor: componentsColor['anchor-primary-color'],
      fontFamily: `font-${fontFileId}`, // 字体
    };
  }
  return {};
})
export default class ReviewTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      recordSource: {},
      modalVisible: false, // 附件上传模态框
      abilityLineId: null, // 供货能力清单行id
      supplyAbilityId: null, // 供货能力清单id
    };
  }

  /**
   * 附件上传modal框
   */
  @Bind()
  handleAttamentModal(record = {}) {
    const { modalVisible } = this.state;
    const { abilityLineId, supplyAbilityId } = record;
    this.setState({ modalVisible: !modalVisible, abilityLineId, supplyAbilityId });
  }

  /**
   * 调转到详情页
   * @param {Number} supplyAbilityId
   */
  @Bind()
  handleGoDetail(supplyAbilityId) {
    const { onHandleGoDetail } = this.props;
    onHandleGoDetail(supplyAbilityId);
  }

  renderForm() {
    const { form } = this.props;
    const { getFieldDecorator } = form;
    // setFieldsValue, getFieldValue
    const { recordSource } = this.state;
    const formLayOut = {
      labelCol: { span: 6 },
      wrapperCol: { span: 16 },
    };
    const psaTip = intl
      .get(`sslm.supplyAbility.view.message.psaTip`)
      .d(
        'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评级即将概率风险指标量化，划分等级。'
      );
    const psaScoreTip = intl
      .get(`sslm.supplyAbility.view.message.psaScoreTip`)
      .d(
        'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评分即将概率风险指标量化，进行打分。'
      );
    const psaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.psaFinishDate`)
      .d('风险量化评价的完成时间。');
    const spaTip = intl
      .get(`sslm.supplyAbility.view.message.spaTip`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评级即将安全指标量化，划分等级。'
      );
    const spaScore = intl
      .get(`sslm.supplyAbility.view.message.spaScore`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评分即将安全指标量化，进行打分。'
      );
    const spaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.spaFinishDate`)
      .d('安全综合评价的完成时间。');
    getFieldDecorator('itemCode');
    getFieldDecorator('itemCategoryCode');
    return (
      <Form layout="horizontal">
        <Row>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码')}
            >
              {getFieldDecorator('itemCode', {
                initialValue: recordSource.itemCode,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述')}
            >
              {getFieldDecorator('itemName', {
                initialValue: recordSource.itemName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`)
                .d('品类代码')}
            >
              {getFieldDecorator('itemCategoryCode', {
                initialValue: recordSource.itemCategoryCode,
              })(<Input disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.categoryName`).d('品类名称')}
            >
              {getFieldDecorator('itemCategoryName', {
                initialValue: recordSource.itemCategoryName,
              })(<Input disabled />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供')}
            >
              {getFieldDecorator('supplyFlag', {
                initialValue: recordSource.supplyFlag,
              })(<Switch disabled />)}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl.get(`sslm.supplyAbility.model.supplyAbility.supplyStatus`).d('可供状态')}
            >
              {getFieldDecorator('supplyStatus', {
                initialValue: recordSource.supplyStatus,
              })(<ValueList lovCode="SSLM.SUPPLYING_STATUS" />)}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.psaEvaluationLevel`)
                .d('PSA评级')}
            >
              {getFieldDecorator('psaEvaluationLevel', {
                initialValue: recordSource.psaEvaluationLevel,
              })(
                <Tooltip title={psaTip}>
                  <ValueList lovCode="SSLM.EVALUATION_LEVEL" />
                </Tooltip>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.psaEvaluationScore`)
                .d('PSA评分')}
            >
              {getFieldDecorator('psaEvaluationScore', {
                initialValue: recordSource.psaEvaluationScore,
              })(
                <Tooltip title={psaScoreTip}>
                  <InputNumber min={0} precision={2} />
                </Tooltip>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.psaFinishDate`)
                .d('PSA完成时间')}
            >
              {getFieldDecorator('psaFinishDate', {
                initialValue:
                  recordSource.psaFinishDate &&
                  moment(recordSource.psaFinishDate, DEFAULT_DATE_FORMAT),
              })(
                <Tooltip title={psaFinishDate}>
                  <DatePicker placeholder="" />
                </Tooltip>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.spaEvaluationLevel`)
                .d('SPA评级')}
            >
              {getFieldDecorator('spaEvaluationLevel', {
                initialValue: recordSource.spaEvaluationLevel,
              })(
                <Tooltip title={spaTip}>
                  <ValueList lovCode="SSLM.EVALUATION_LEVEL" />
                </Tooltip>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.spaEvaluationScore`)
                .d('SPA评分')}
            >
              {getFieldDecorator('spaEvaluationScore', {
                initialValue: recordSource.spaEvaluationScore,
              })(
                <Tooltip title={spaScore}>
                  <InputNumber min={0} precision={2} />
                </Tooltip>
              )}
            </FormItem>
          </Col>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.spaFinishDate`)
                .d('SPA完成时间')}
            >
              {getFieldDecorator('spaFinishDate', {
                initialValue:
                  recordSource.spaFinishDate &&
                  moment(recordSource.spaFinishDate, DEFAULT_DATE_FORMAT),
              })(
                <Tooltip title={spaFinishDate}>
                  <DatePicker placeholder="" />
                </Tooltip>
              )}
            </FormItem>
          </Col>
        </Row>
        <Row>
          <Col span={12}>
            <FormItem
              {...formLayOut}
              label={intl
                .get(`sslm.supplyAbility.model.supplyAbility.evaluateRemark`)
                .d('评价信息')}
            >
              {getFieldDecorator('evaluateRemark', {
                initialValue: recordSource.evaluateRemark,
              })(<Input />)}
            </FormItem>
          </Col>
        </Row>
      </Form>
    );
  }

  render() {
    const {
      dataSource = {},
      tableChange,
      customizeTable,
      custLoading,
      linkColor,
      pagination,
    } = this.props;
    const { modalVisible, abilityLineId, supplyAbilityId } = this.state;
    const { content = [] } = dataSource;
    const style = { margin: 0, padding: 0, whiteSpace: 'nowrap' };
    const supplyStatusTip = (
      <React.Fragment>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-G：
          {intl.get(`sslm.supplyAbility.view.message.supplyStatusG`).d('Green, 表示供货能力强')};
        </p>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-Y：
          {intl
            .get(`sslm.supplyAbility.view.message.supplyStatusY`)
            .d('Yellow, 表示供货能力有风险')}
          ;
        </p>
        <p style={style}>
          {intl.get(`sslm.supplyAbility.model.supAbility.supplyStatus`).d('可供状态')}-R：
          {intl.get(`sslm.supplyAbility.view.message.supplyStatusR`).d('Red, 表示供货能力严重不足')}
          ;
        </p>
      </React.Fragment>
    );
    const psaTip = intl
      .get(`sslm.supplyAbility.view.message.psaTip`)
      .d(
        'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评级即将概率风险指标量化，划分等级。'
      );
    const psaScoreTip = intl
      .get(`sslm.supplyAbility.view.message.psaScoreTip`)
      .d(
        'PSA即Probabilistic  Safety Assessment，概率安全评价，也常称为概率风险评价（PRA），是以概率论为基础的风险量化评价技术。PSA评分即将概率风险指标量化，进行打分。'
      );
    const psaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.psaFinishDate`)
      .d('风险量化评价的完成时间。');
    const spaTip = intl
      .get(`sslm.supplyAbility.view.message.spaTip`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评级即将安全指标量化，划分等级。'
      );
    const spaScore = intl
      .get(`sslm.supplyAbility.view.message.spaScore`)
      .d(
        'SPA即Safety Comprehensive Assessment，安全综合评价，可避免企业选用不安全的流程或原材料，可降低或消除现实危险性。SPA评分即将安全指标量化，进行打分。'
      );
    const spaFinishDate = intl
      .get(`sslm.supplyAbility.view.message.spaFinishDate`)
      .d('安全综合评价的完成时间。');

    const attachmentModalProps = {
      supplyAbilityId,
      isVisible: modalVisible,
      supplyAbilityLineId: abilityLineId,
      onCancel: this.handleAttamentModal,
      attCustomizeCode: 'SSLM.SUPPLIER_ABILITY_QUERY.LINE_ATTACHMENT',
    };

    const columns = [
      {
        title: intl.get('sslm.common.view.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyNum',
        width: 120,
        render: (text, record) => (
          <a onClick={() => this.handleGoDetail(record.supplyAbilityId)}>{text}</a>
        ),
      },
      {
        title: intl.get('sslm.common.view.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lifeCycleStage`).d('生命周期阶段'),
        dataIndex: 'stageDescription',
        width: 120,
      },
      {
        title: intl.get(`sslm.common.view.company.name`).d('公司'),
        dataIndex: 'companyName',
        width: 200,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lineStatus`).d('行状态'),
        width: 120,
        dataIndex: 'supplyReviewStatusMeaning',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
        width: 130,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemName`).d('物料描述'),
        dataIndex: 'itemName',
        width: 130,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.itemCategoryCode`).d('品类代码'),
        dataIndex: 'itemCategoryCode',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.categoryName`).d('品类名称'),
        dataIndex: 'itemCategoryName',
        width: 100,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.supplyFlag`).d('是否可供'),
        dataIndex: 'supplyFlag',
        width: 90,
        render: value => {
          return (
            <Badge
              status={value === 1 ? 'success' : 'error'}
              text={
                value === 1
                  ? intl.get('hzero.common.status.yes').d('是')
                  : intl.get('hzero.common.status.no').d('否')
              }
            />
          );
        },
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.adapterProducts`).d('适配产品'),
        dataIndex: 'adapterProducts',
        width: 100,
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.countryIdMeaning').d('服务国家'),
        width: 140,
        dataIndex: 'countryIdMeaning',
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.regionIdMeaning').d('服务地区'),
        width: 140,
        dataIndex: 'regionIdMeaning',
      },
      {
        title: intl.get('sslm.supplyAbility.model.supplyAbility.cityIdMeaning').d('服务城市'),
        width: 140,
        dataIndex: 'cityIdMeaning',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateFrom`).d('有效期从'),
        dataIndex: 'dateFrom',
        width: 120,
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.dateTo`).d('有效期至'),
        dataIndex: 'dateTo',
        width: 120,
        render: dateRender,
      },
      {
        title: (
          <Tooltip title={supplyStatusTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.supplyStatus`).d('可供状态')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        dataIndex: 'supplyStatus',
        width: 120,
        onCell: record => {
          if (record.supplyStatus === 'G') {
            return { className: styles['table-column-g'] };
          } else if (record.supplyStatus === 'Y') {
            return { className: styles['table-column-y'] };
          } else if (record.supplyStatus === 'R') {
            return { className: styles['table-column-r'] };
          } else {
            return {};
          }
        },
        render: (_, record) => record.supplyStatusMeaning || record.supplyStatus,
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.purchasingOrganization`)
          .d('采购组织'),
        dataIndex: 'purchaseOrganizationName',
        width: 150,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.manufacturer`).d('生产厂家'),
        dataIndex: 'manufacturer',
        width: 150,
      },
      {
        title: (
          <Tooltip title={psaTip}>
            {intl.get(`sslm.supplyAbility.model.supAbility.psaEvaluationLevel`).d('PSA评级')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 120,
        dataIndex: 'psaEvaluationLevel',
      },
      {
        title: (
          <Tooltip title={psaScoreTip}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.psaScore`).d('PSA评分')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'psaEvaluationScore',
      },
      {
        title: (
          <Tooltip title={psaFinishDate}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.psaFinishDate`).d('PSA完成时间')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 150,
        dataIndex: 'psaFinishDate',
        render: dateRender,
      },
      {
        title: (
          <Tooltip title={spaTip}>
            {intl.get(`sslm.supplyAbility.model.supAbility.spaLevel`).d('SPA评级')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'spaEvaluationLevel',
      },
      {
        title: (
          <Tooltip title={spaScore}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.spaScore`).d('SPA评分')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 100,
        dataIndex: 'spaEvaluationScore',
      },
      {
        title: (
          <Tooltip title={spaFinishDate}>
            {intl.get(`sslm.supplyAbility.model.supplyAbility.spaFinishDate`).d('SPA完成时间')}
            <Icon style={{ fontSize: 14 }} type="exclamation" />
          </Tooltip>
        ),
        width: 150,
        dataIndex: 'spaFinishDate',
        render: dateRender,
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.evaluateRemark`).d('评价信息'),
        width: 200,
        dataIndex: 'evaluateRemark',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.quotaRatio`).d('配额'),
        width: 200,
        dataIndex: 'quotaRatio',
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.inventoryOrganization`)
          .d('库存组织'),
        dataIndex: 'inventoryOrganizationId',
        width: 100,
        render: value => {
          return <LovMulti code="SSLM.INV_ORGANIZATION" value={value} viewOnly />;
        },
      },
      {
        title: intl.get('hzero.common.upload.modal.title').d('附件'),
        width: 120,
        dataIndex: 'attachmentUuid',
        render: (_, record) => (
          <a onClick={() => this.handleAttamentModal(record)}>
            {renderAttachmentText({ editable: false, fileCount: record.fileCount, linkColor })}
          </a>
        ),
      },
      {
        title: intl.get('sslm.common.view.creator.name').d('创建人'),
        width: 100,
        dataIndex: 'createUserName',
      },
      {
        title: intl
          .get('sslm.supplyAbility.model.supplyAbility.createUserDepartment')
          .d('创建人部门'),
        width: 100,
        dataIndex: 'createUserDepartment',
      },
      {
        title: intl
          .get('sslm.supplyAbility.model.supplyAbility.createdByDepartment')
          .d('创建部门（创建时创建人部门）'),
        width: 100,
        dataIndex: 'createdUserDepartment',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.creationDate`).d('创建日期'),
        width: 120,
        dataIndex: 'creationDate',
        render: dateRender,
      },
      {
        title: intl
          .get(`sslm.supplyAbility.model.supplyAbility.lastUpdateUserName`)
          .d('最后更新人'),
        width: 100,
        dataIndex: 'lastUpdateUserName',
      },
      {
        title: intl.get(`sslm.supplyAbility.model.supplyAbility.lastUpdateDate`).d('最后更新日期'),
        width: 120,
        dataIndex: 'lastUpdateDate',
        render: dateRender,
      },
    ];
    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return (
      <Fragment>
        {customizeTable(
          {
            code: 'SSLM.SUPPLIER_ABILITY_QUERY.LIST_TABLE',
          },
          <Table
            bordered
            rowKey="abilityLineId"
            custLoading={custLoading}
            columns={columns}
            dataSource={content}
            pagination={pagination}
            onChange={tableChange}
            scroll={{ x: scrollX }}
          />
        )}
        {/* 上传附件模态框 */}
        {modalVisible && <AttachmentModal {...attachmentModalProps} />}
      </Fragment>
    );
  }
}
