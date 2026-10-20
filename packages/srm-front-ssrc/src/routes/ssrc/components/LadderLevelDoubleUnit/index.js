/**
 * LadderLevelModal - 寻源服务/阶梯报价
 * @date: 2019-3-26
 * @author: HZL <zili.hou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Tooltip } from 'hzero-ui';

import EditTable from 'components/EditTable';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import formatterCollections from 'utils/intl/formatterCollections';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import withCustomize from 'srm-front-cuz/lib/h0Customize';
import { noop } from 'lodash';
import { getLadderFrom, getLadderTo, getPriceName, getNetPriceName } from '@/utils/utils';

import { INQUIRY } from '@/utils/globalVariable';
import { numberSeparatorRender, useTernaryExpression } from '@/utils/renderer';

import style from './index.less';

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem className={style['ladder-level-wrapper']} label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};
class LadderLevelModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  @Bind()
  scrollWidth(columns, fixWidth) {
    const total = columns.reduce((prev, current) => prev + (current.width ? current.width : 0), 0);
    return total + fixWidth + 1;
  }

  /**
   * 阶梯报价头信息查询
   */
  @Bind()
  fetchLadderLevelyHeader() {
    const { supplierCompanyName, itemCode, itemName } = this.props.LadderLevelHeaderData;
    return (
      <Form>
        <Row gutter={48} className="read-row ssrc-ladder-level-header">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.supplierName`).d('供应商名称')}
              value={
                <Tooltip placement="top" title={supplierCompanyName}>
                  {supplierCompanyName}
                  {/* {supplierCompanyName.length > 8
                    ? `${supplierCompanyName.substr(0, 8)}...`
                    : supplierCompanyName} */}
                </Tooltip>
              }
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsCode`).d('物料编码')}
              value={itemCode}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.inquiryHall.model.inquiryHall.itemsName`).d('物料名称')}
              value={itemName}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  getTableCustomizeUnitCode = () => {
    const { sourceKey = INQUIRY } = this.props;
    const code = `SSRC.${
      sourceKey === INQUIRY ? INQUIRY : 'NEW_BID'
    }_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE`;

    return code;
  };

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const {
      quotaLadderLevelData,
      loading,
      customizeTable = noop,
      doubleUnitFlag = false,
      remote,
      remotePrefix = '',
    } = this.props;
    let columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo`).d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 80,
      },
      useTernaryExpression(doubleUnitFlag, {
        title: <span>{intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderFrom`).d('数量从')}</span>,
        dataIndex: 'secondaryLadderFrom',
        width: 100,
      }),
      useTernaryExpression(doubleUnitFlag, {
        title: (
          <span>
            {intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderTo`).d('数量至')}
            {`(<)`}
          </span>
        ),
        dataIndex: 'secondaryLadderTo',
        width: 100,
      }),
      {
        title: (
          <span>
            {getLadderFrom(doubleUnitFlag)}
            {`(>=)`}
          </span>
        ),
        dataIndex: 'ladderFrom',
        width: 120,
      },
      {
        title: (
          <span>
            {getLadderTo(doubleUnitFlag)}
            {`(<)`}
          </span>
        ),
        dataIndex: 'ladderTo',
        width: 120,
      },
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.taxPrice`).d('单价(含税)'),
        dataIndex: 'validLadderSecPrice',
        width: 100,
        render: numberSeparatorRender,
      }),
      useTernaryExpression(doubleUnitFlag, {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.netPrice`).d('单价(不含税)'),
        dataIndex: 'validNetLadderSecPrice',
        width: 100,
        render: numberSeparatorRender,
      }),
      {
        title: getPriceName(doubleUnitFlag),
        dataIndex: 'validLadderPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: getNetPriceName(doubleUnitFlag),
        dataIndex: 'validNetLadderPrice',
        width: 130,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.isCumulativeFlag`).d('是否累计阶梯'),
        dataIndex: 'cumulativeFlag',
        width: 120,
        render: yesOrNoRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.validBargainPrice`).d('有效还价单价'),
        dataIndex: 'validBargainPrice',
        width: 130,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`hzero.common.remark`).d('备注'),
        dataIndex: 'remark',
        width: 100,
      },
    ].filter(Boolean);

    columns = remote
      ? remote.process(`${remotePrefix}_TABLE_COLUMNS`, columns, {
          ...this.props,
        })
      : columns;

    const scrollWidth = this.scrollWidth(columns, 0);

    return (
      <React.Fragment>
        {customizeTable(
          {
            code: this.getTableCustomizeUnitCode(),
          },
          <EditTable
            bordered
            scroll={{ x: scrollWidth }}
            rowKey="rfxLadderLineNum"
            columns={columns}
            dataSource={quotaLadderLevelData}
            loading={loading}
            pagination={false}
          />
        )}
      </React.Fragment>
    );
  }

  render() {
    const { hideModal, visible, remote, remotePrefix = '' } = this.props;
    const modalProps = {};

    const cuxModalProps = remote
      ? remote.process(`${remotePrefix}_MODAL_PROPS`, modalProps, {
          ...this.props,
          customizeUnitCode: this.getTableCustomizeUnitCode(),
        })
      : modalProps;

    return (
      <Modal
        visible={visible}
        width="50%"
        footer={null}
        onCancel={hideModal}
        title={intl.get(`ssrc.inquiryHall.model.inquiryHall.ladderInquiryFlag`).d('阶梯报价')}
        {...(cuxModalProps || {})}
      >
        {this.fetchLadderLevelyHeader()}
        {this.feedLadderLevelyTable()}
      </Modal>
    );
  }
}

const hocComponent = (Com) => {
  return withCustomize({
    unitCode: ['SSRC.INQUIRY_HALL_CHECK_PRICE.LADDER_INQUIRY_TABLE'], // 阶梯报价-表格信息
  })(formatterCollections({ code: ['ssrc.inquiryHall'] })(Com));
};

export default hocComponent(LadderLevelModal);

export { LadderLevelModal, hocComponent };
