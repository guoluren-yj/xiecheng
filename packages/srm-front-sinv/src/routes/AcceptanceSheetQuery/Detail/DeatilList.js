import React, { Component } from 'react';
import { Table, Collapse, Icon, Form } from 'hzero-ui';
import { sum, isNumber, isNil } from 'lodash';
import intl from 'utils/intl';
import classnames from 'classnames';
import { Bind } from 'lodash-decorators';
import { dateRender } from 'utils/renderer';
import Upload from 'components/Upload';
import { getCurrentOrganizationId } from 'utils/utils';

import { DETAIL_DEFAULT_CLASSNAME } from 'utils/constants';
import styles from './index.less';
import { showBigNumber } from '@/routes/components/utils';

const { Panel } = Collapse;

/**
 * 验收单详情行
 *
 * @export
 * @class DeatilList - 列表组件
 * @extends {Component} - React.Component
 * @reactProps {boolean} loading - 数据加载状态
 * @reactProps {object} tableData - 列表数据源
 * @reactProps {object} pagination - 列表分页信息
 * @reactProps {object} rowSelection - 选择行对象
 * @reactProps {function} onChange - 分页查询
 * @returns React.element
 */
export default class List extends Component {
  constructor(props) {
    super(props);
    if (props.onRef) props.onRef(this);
    this.state = {
      collapseKeys: ['list'],
      organizationId: getCurrentOrganizationId(),
    };
  }

  @Bind()
  onCollapseChange(collapseKeys) {
    this.setState({
      collapseKeys,
    });
  }

  @Bind()
  roundFun(value, n) {
    const val = Math.round(value * 10 ** n) / 10 ** n;
    return !isNaN(val) && Number.parseFloat(+val).toLocaleString();
  }

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */

  @Bind()
  showUomText(record) {
    const { uomName, uomCode, unitCodeIsShow } = record;
    let text = uomName && uomCode ? <span>{`${uomCode}/${uomName}`}</span> : uomName;
    if (!isNil(unitCodeIsShow)) {
      text = unitCodeIsShow === '1' && uomCode && uomName ? `${uomCode}/${uomName}` : uomName;
    }
    return text;
  }

  /**
   *根据不同状态获取页面字段动态变化
   */
  @Bind()
  getColumns() {
    const { headerInfo = {} } = this.props;
    const { organizationId } = this.state;
    const { acceptBaseCode, sourceCode } = headerInfo;
    const columns = {
      base: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.lineNum`).d('序号'),
          dataIndex: 'lineNum',
          width: 100,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcNum`).d('协议编号'),
          dataIndex: 'pcNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcName`).d('协议名称'),
          dataIndex: 'pcName',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
          width: 120,
          dataIndex: 'itemCategoryName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
          width: 150,
          dataIndex: 'uomName',
          render: (_val, record) => this.showUomText(record),
        },
      ],
      order: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.lineNum`).d('序号'),
          dataIndex: 'lineNum',
          width: 100,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderNumber`).d('订单号'),
          dataIndex: 'poHeaderNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderList`).d('订单行号'),
          dataIndex: 'poLineNum',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCode`).d('物料编码'),
          dataIndex: 'itemCode',
          width: 150,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemName`).d('物料名称'),
          dataIndex: 'itemName',
          width: 150,
        },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
        //   width: 120,
        //   dataIndex: 'itemCategoryName',
        // },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
        //   width: 150,
        //   dataIndex: 'uomName',
        // },
      ],
      orderAcceptance: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptQuantity`).d('本次验收数量'),
          width: 150,
          dataIndex: 'acceptQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptOpinion`).d('验收意见'),
          width: 150,
          dataIndex: 'acceptOpinionCodeMeaning',
        },
        // {
        //   title: intl.get(`sinv.acceptanceSheetCreate.model.cost`).d('费用'),
        //   width: 150,
        //   dataIndex: 'acceptAmount',
        // },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.canAcceptQuantity`).d('可验收数量'),
          width: 150,
          dataIndex: 'canAcceptQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptedQuantity`).d('已验收数量'),
          width: 150,
          dataIndex: 'acceptedQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.itemCategoryName`).d('物料类别'),
          width: 120,
          dataIndex: 'itemCategoryName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.uomName`).d('单位'),
          width: 150,
          dataIndex: 'uomName',
          render: (_val, record) => this.showUomText(record),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
          width: 150,
          dataIndex: 'quantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.poUnitPricea`).d('单价'),
          width: 150,
          dataIndex: 'poUnitPrice',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.amount`).d('金额'),
          width: 150,
          dataIndex: 'amount',
          render: (value, record) => showBigNumber(value, record.financialPrecision),
        },
      ],
      stageAcceptance: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
          width: 150,
          dataIndex: 'quantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.stage`).d('阶段'),
          width: 150,
          dataIndex: 'stageName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptQuantity`).d('本次验收数量'),
          width: 150,
          dataIndex: 'acceptQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl
            .get(`sinv.acceptanceSheetCreate.model.acceptOpinionCodeMeaning`)
            .d('验收意见'),
          width: 150,
          dataIndex: 'acceptOpinionCodeMeaning',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.cost`).d('费用'),
          dataIndex: 'acceptAmount',
          width: 150,
          render: (value, record) => showBigNumber(value, record.financialPrecision),
        },
      ],
      normalAcceptance: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.quantity`).d('数量'),
          width: 150,
          dataIndex: 'quantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.acceptQuantity`).d('本次验收数量'),
          width: 150,
          dataIndex: 'acceptQuantity',
          render: (value) => showBigNumber(value),
        },
        {
          title: intl
            .get(`sinv.acceptanceSheetCreate.model.acceptOpinionCodeMeaning`)
            .d('验收意见'),
          width: 150,
          dataIndex: 'acceptOpinionCodeMeaning',
        },
      ],
      others: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcTypeName`).d('协议类型'),
          width: 150,
          dataIndex: 'pcTypeName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specifications`).d('规格'),
          width: 150,
          dataIndex: 'specifications',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.model`).d('型号'),
          width: 150,
          dataIndex: 'model',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.deliverDate`).d('交付日期'),
          width: 150,
          dataIndex: 'deliverDate',
          render: dateRender,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.remark`).d('备注'),
          width: 150,
          dataIndex: 'remark',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceCode`).d('来源单据编号'),
          width: 150,
          dataIndex: 'pcSourceCode',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceLineNum`).d('来源单据行号'),
          width: 120,
          dataIndex: 'pcSourceLineNum',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specification`).d('验收说明'),
          width: 150,
          dataIndex: 'lineAcceptDescription',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.action`).d('操作'),
          width: 150,
          dataIndex: 'attachmentUuid',
          render: (val) => (
            <Upload
              bucketName="private-bucket"
              bucketDirectory="ssrc-rfx-rfxitem"
              attachmentUUID={val}
              tenantId={organizationId}
              icon="download"
              viewOnly
            />
          ),
        },
      ],
      orderOthers: [
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.orderType`).d('订单验型'),
          width: 150,
          dataIndex: 'orderTypeName',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specifications`).d('规格'),
          width: 150,
          dataIndex: 'specifications',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.model`).d('型号'),
          width: 150,
          dataIndex: 'model',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.deliverDate`).d('交付日期'),
          width: 150,
          dataIndex: 'deliverDate',
          render: dateRender,
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.remark`).d('备注'),
          width: 150,
          dataIndex: 'remark',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceCode`).d('来源单据编号'),
          width: 150,
          dataIndex: 'pcSourceCode',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.pcSourceLineNum`).d('来源单据行号'),
          width: 120,
          dataIndex: 'pcSourceLineNum',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.specification`).d('验收说明'),
          width: 150,
          dataIndex: 'lineAcceptDescription',
        },
        {
          title: intl.get(`sinv.acceptanceSheetCreate.model.action`).d('操作'),
          width: 150,
          dataIndex: 'attachmentUuid',
          render: (val) => {
            return (
              <Upload
                bucketName="private-bucket"
                bucketDirectory="ssrc-rfx-rfxitem"
                attachmentUUID={val}
                tenantId={organizationId}
                viewOnly
                filePreview
              />
            );
          },
        },
      ],
    };
    if (sourceCode === 'ORDER') {
      return columns.order.concat(columns.orderAcceptance, columns.orderOthers);
    } else if (acceptBaseCode === 'STAGE') {
      // 协议阶段
      return columns.base.concat(columns.stageAcceptance, columns.others);
    } else {
      return columns.base.concat(columns.normalAcceptance, columns.others);
    }
  }

  render() {
    const {
      pagination,
      dataSource,
      loading,
      handleSearch,
      sourceCode,
      customizeTable,
      customizeCode,
    } = this.props;
    const { collapseKeys } = this.state;
    const columns = [
      {
        title: intl.get(`sinv.acceptance.view.message.lineNum`).d('序号'),
        dataIndex: 'lineNum',
        width: 180,
      },
      {
        title: intl.get(`sinv.common.model.common.itemCategoryName`).d('物料品类'),
        dataIndex: 'itemCategoryName',
      },
      {
        title: intl.get(`sinv.common.model.common.itemCode`).d('物料编码'),
        dataIndex: 'itemCode',
      },
      {
        title: intl.get(`sinv.common.model.common.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.uomName`).d('单位'),
        dataIndex: 'uomName',
        width: 180,
        render: (_val, record) => this.showUomText(record),
      },
      {
        title: intl.get(`sinv.common.model.common.acceptQuantity`).d('本次验收数量'),
        dataIndex: 'acceptQuantity',
        width: 120,
      },
      {
        title: intl.get(`sinv.common.model.common.acceptOpinionCodeMeaning`).d('验收意见'),
        dataIndex: 'acceptOpinionCodeMeaning',
        width: 120,
      },
    ];
    const agreeColumns = this.getColumns();
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0))) + 240;
    return (
      <Form className={classnames(DETAIL_DEFAULT_CLASSNAME, styles['detail-form'])}>
        <Collapse
          className="form-collapse"
          defaultActiveKey={['list']}
          onChange={this.onCollapseChange}
        >
          <Panel
            showArrow={false}
            header={
              <React.Fragment>
                <h3>{intl.get(`sinv.common.model.common.acceptanceLiner`).d('验收行信息')}</h3>
                <a className="expand-button">
                  {collapseKeys.includes('list')
                    ? intl.get('hzero.common.button.up').d('收起')
                    : intl.get('hzero.common.button.expand').d('展开')}
                  {<Icon type={collapseKeys.includes('list') ? 'up' : 'down'} />}
                </a>
              </React.Fragment>
            }
            key="list"
          >
            {customizeTable(
              {
                code: customizeCode,
              },
              <Table
                bordered
                loading={loading}
                columns={sourceCode === 'NONE' ? columns : agreeColumns}
                dataSource={dataSource}
                pagination={pagination}
                scroll={{ x: scrollX }}
                rowKey="acceptListLineId"
                onChange={handleSearch}
              />
            )}
          </Panel>
        </Collapse>
      </Form>
    );
  }
}
