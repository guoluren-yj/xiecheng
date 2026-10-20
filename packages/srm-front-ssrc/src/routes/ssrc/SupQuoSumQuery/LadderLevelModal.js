/**
 * LadderLevelModal - 供应商报价汇总查询-阶梯报价
 * @date: 2019-12-18
 * @author: jing.chen05@hand-china.com
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Modal, Form, Col, Row, Tooltip } from 'hzero-ui';
import EditTable from 'components/EditTable';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import intl from 'utils/intl';
import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import { yesOrNoRender } from 'utils/renderer';
import { getQuotationPrice } from '@/utils/utils';

const FormItem = Form.Item;
const UEDDisplayFormItem = (props) => {
  const { label, value } = props;
  return (
    <FormItem label={label} {...EDIT_FORM_ITEM_LAYOUT}>
      {value}
    </FormItem>
  );
};

@Form.create({ fieldNameProp: null })
export default class LadderLevelModal extends React.Component {
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
    const {
      ladderListHeaderInfo: { supplierCompanyName, itemCode, itemRemark },
    } = this.props;
    return (
      <Form>
        <Row gutter={48} className="read-row ssrc-ladder-level-header">
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl
                .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.supplierCompanyName`)
                .d('供应商名称')}
              value={
                <Tooltip placement="top" title={supplierCompanyName}>
                  {supplierCompanyName.length > 8
                    ? `${supplierCompanyName.substr(0, 8)}...`
                    : supplierCompanyName}
                </Tooltip>
              }
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemCode`).d('物品编码')}
              value={itemCode}
            />
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <UEDDisplayFormItem
              label={intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemsName`).d('物品描述')}
              value={itemRemark}
            />
          </Col>
        </Row>
      </Form>
    );
  }

  // 当前供应商分类表格
  feedLadderLevelyTable() {
    const {
      ladderLevelData = [],
      fetchLadderListLoading,
      ladderLevelRowSelection,
      ladderListHeaderInfo: { itemName },
      doubleUnitFlag,
    } = this.props;
    const newLadderLevelData =
      !isEmpty(ladderLevelData) &&
      ladderLevelData.map((item) => {
        return {
          ...item,
          itemName,
        };
      });
    const columns = [
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.rfxLadderLineNum`).d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 60,
      },
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.itemName`).d('物料名称'),
        dataIndex: 'itemName',
        width: 60,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.ladderFrom`).d('数量从')}
            {`(>=)`}
          </span>
        ),
        dataIndex: 'secondaryLadderFrom',
        width: 80,
      },
      {
        title: (
          <span>
            {intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.ladderTo`).d('数量至')} {`(<)`}
          </span>
        ),
        dataIndex: 'secondaryLadderTo',
        width: 80,
      },
      doubleUnitFlag
        ? {
            title: (
              <span>
                {`${intl
                  .get(`ssrc.common.model.inquiryHall.basicLadderFrom`)
                  .d('基本数量从')} (>=)`}
              </span>
            ),
            dataIndex: 'ladderFrom',
            width: 80,
          }
        : null,
      doubleUnitFlag
        ? {
            title: (
              <span>
                {`${intl
                  .get(`ssrc.inquiryHall.model.inquiryHall.basicLadderTo`)
                  .d('基本数量至')} (<)`}
              </span>
            ),
            dataIndex: 'ladderTo',
            width: 80,
          }
        : null,
      {
        title: intl.get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.unitPrice`).d('基本单价'),
        dataIndex: 'validLadderSecPrice',
        width: 80,
      },
      doubleUnitFlag
        ? {
            title: getQuotationPrice(doubleUnitFlag),
            dataIndex: 'currentLadderPrice',
            width: 80,
          }
        : null,
      {
        title: intl
          .get(`ssrc.supQuoSumQuery.model.supQuoSumQuery.cumulativeFlag`)
          .d('是否累计阶梯'),
        dataIndex: 'cumulativeFlag',
        width: 80,
        render: yesOrNoRender,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 120,
      },
    ].filter(Boolean);
    const scrollWidth = this.scrollWidth(columns, 0);
    return (
      <React.Fragment>
        <EditTable
          bordered
          scroll={{ x: scrollWidth }}
          rowKey="ladderQuotationId"
          loading={fetchLadderListLoading}
          rowSelection={ladderLevelRowSelection}
          columns={columns}
          pagination={false}
          dataSource={newLadderLevelData}
        />
      </React.Fragment>
    );
  }

  render() {
    const { hideModal, visible } = this.props;
    return (
      <Modal
        visible={visible}
        width={900}
        footer={null}
        onCancel={hideModal}
        title={intl.get(`ssrc.supQuoSumQuery.view.message.title.ladQuotate`).d('阶梯报价')}
      >
        {this.fetchLadderLevelyHeader()}
        {this.feedLadderLevelyTable()}
      </Modal>
    );
  }
}
