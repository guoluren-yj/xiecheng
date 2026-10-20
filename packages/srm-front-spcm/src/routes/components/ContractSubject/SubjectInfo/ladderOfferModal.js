import React, { PureComponent } from 'react';
import { Modal, Form, Col, Row, Tooltip } from 'hzero-ui';

import { EDIT_FORM_ITEM_LAYOUT, FORM_COL_3_LAYOUT } from 'utils/constants';
import EditTable from 'components/EditTable';
import intl from 'utils/intl';
import { getDynamicLabel } from '@/utils/util';

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
export default class LadderOfferModal extends PureComponent {
  componentDidMount() {
    const { fetchLadderOffer } = this.props;
    fetchLadderOffer();
  }

  render() {
    const {
      visible,
      hideModal,
      ladderOfferList,
      loadingLadderOffer,
      LadderLevelHeaderData,
      doubleUnitEnabled,
    } = this.props;
    const { supplierCompanyName = [], itemCode = '', itemName = '' } = LadderLevelHeaderData;
    const columns = [
      {
        title: intl.get('spcm.common.model.common.lineNumber').d('行号'),
        dataIndex: 'rfxLadderLineNum',
        width: 100,
      },
      doubleUnitEnabled && {
        title: intl.get('spcm.common.model.common.quantityFrom').d('数量从(>=)'),
        dataIndex: 'secondaryLadderFrom',
        width: 130,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'ladderFrom'),
        dataIndex: 'ladderFrom',
        width: 130,
      },
      doubleUnitEnabled && {
        title: intl.get('spcm.common.model.common.quantityTo').d('数量至(<=)'),
        dataIndex: 'secondaryLadderTo',
        width: 130,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'ladderTo'),
        dataIndex: 'ladderTo',
        width: 130,
      },
      doubleUnitEnabled && {
        title: intl.get('spcm.common.model.new.price').d('单价(含税)'),
        dataIndex: 'validLadderSecPrice',
        width: 130,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'validLadderPrice'),
        dataIndex: 'validLadderPrice',
        width: 130,
      },
      doubleUnitEnabled && {
        title: intl.get('spcm.common.model.ladderNetPrice').d('单价(不含税)'),
        dataIndex: 'validNetLadderSecPrice',
        width: 130,
      },
      {
        title: getDynamicLabel(doubleUnitEnabled, 'validNetLadderPrice'),
        dataIndex: 'validNetLadderPrice',
        width: 130,
      },
      {
        title: intl.get(`spcm.common.model.inquiryHall.validBargainPrice`).d('有效还价单价'),
        dataIndex: 'validBargainPrice',
        width: 130,
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 100,
      },
    ].filter(Boolean);
    const tableProps = {
      columns,
      rowKey: 'ladderInquiryId',
      loading: loadingLadderOffer,
      dataSource: ladderOfferList,
      pagination: false,
    };
    return (
      <Modal
        width={800}
        destroyOnClose
        visible={visible}
        onCancel={hideModal}
        footer={null}
        title={intl.get(`spcm.common.view.message.title.ladderLevel`).d('阶梯等级')}
      >
        <React.Fragment>
          <Form>
            <Row gutter={48} className="read-row ssrc-ladder-level-header">
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`spcm.common.model.inquiryHall.supplierName`).d('供应商名称')}
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
                  label={intl.get(`spcm.common.model.inquiryHall.itemsCode`).d('物料编码')}
                  value={itemCode}
                />
              </Col>
              <Col {...FORM_COL_3_LAYOUT}>
                <UEDDisplayFormItem
                  label={intl.get(`spcm.common.model.inquiryHall.itemsName`).d('物料名称')}
                  value={itemName}
                />
              </Col>
            </Row>
          </Form>
          <EditTable bordered {...tableProps} />
        </React.Fragment>
      </Modal>
    );
  }
}
