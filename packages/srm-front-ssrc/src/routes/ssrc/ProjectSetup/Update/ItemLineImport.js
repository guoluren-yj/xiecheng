/**
 * routes 寻源立项-维护／供应商/批量添加Modal
 * @date: 2020-2-25
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { sum, isNumber } from 'lodash';
import { Modal, Form } from 'hzero-ui';
import { Attachment } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { Content } from 'components/Page';
import EditTable from 'components/EditTable';
import { numberSeparatorRender } from '@/utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

@Form.create({ fieldNameProp: null })
export default class AddMaterialModal extends Component {
  constructor(props) {
    super(props);
    props.onRef(this);
  }

  render() {
    const {
      organizationId,
      visible,
      dataSource,
      onCancel,
      pagination,
      onChange,
      rowSelection,
      saveSecItemLines,
      fetchExistItemLoading,
    } = this.props;

    const columns = [
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineNo.`).d('行号'),
        dataIndex: 'projectLineItemNum',
        width: 80,
        fixed: 'left',
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouId',
        width: 150,
        render: (_, record) => record.ouName,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.invOrganizationName`).d('库存组织'),
        dataIndex: 'invOrganizationId',
        width: 150,
        render: (_, record) => record.invOrganizationName,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCode`).d('物料编码'),
        dataIndex: 'itemId',
        width: 150,
        render: (_, record) => record.itemCode,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemDescs`).d('物料描述'),
        dataIndex: 'itemName',
        width: 200,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemCategory`).d('物料类别'),
        dataIndex: 'itemCategoryId',
        width: 150,
        render: (_, record) => record.itemCategoryName,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.specifications`).d('规格'),
        dataIndex: 'specifications',
        width: 120,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.quantity`).d('需求数量'),
        dataIndex: 'requiredQuantity',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.unit`).d('单位'),
        dataIndex: 'uomId',
        width: 150,
        render: (_, record) => record.uomName,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.predictUnitPrice`).d('预算单价(元)'),
        dataIndex: 'costPrice',
        width: 120,
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.forLineAmnt`).d('预算行金额(元)'),
        dataIndex: 'totalPrice',
        width: 120,
        align: 'right',
        render: numberSeparatorRender,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.itemRemark`).d('备注'),
        dataIndex: 'itemRemark',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.lineAttachment`).d('行附件'),
        dataIndex: 'itemAttachmentUuid',
        width: 150,
        render: (val) => (
          <Attachment
            readOnly
            bucketName={PRIVATE_BUCKET}
            bucketDirectory="ssrc-rfx-rfxitem"
            viewMode="popup"
            value={val}
            data={{
              tenantId: organizationId,
            }}
          />
        ),
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prNum`).d('采购申请编号'),
        dataIndex: 'prNum',
        width: 150,
      },
      {
        title: intl.get(`ssrc.inquiryHall.model.inquiryHall.prLineNum`).d('采购申请行号'),
        dataIndex: 'prLineNum',
        width: 150,
      },
      {
        title: intl.get('ssrc.bidHall.model.bidHall.applicant').d('申请人'),
        dataIndex: 'requestUserId',
        width: 120,
        render: (_, record) => record.requestUserName,
      },
    ];
    const scrollX = sum(columns.map((n) => (isNumber(n.width) ? n.width : 0)));
    return (
      <Modal
        destroyOnClose
        width={1000}
        visible={visible}
        title={intl.get(`ssrc.projectSetup.view.message.title.addMaterial`).d('添加物料')}
        onOk={saveSecItemLines}
        onCancel={onCancel}
      >
        <Content>
          <EditTable
            bordered
            rowKey="projectLineItemId"
            loading={fetchExistItemLoading}
            columns={columns}
            scroll={{ x: scrollX }}
            dataSource={dataSource}
            pagination={pagination}
            rowSelection={rowSelection}
            onChange={(page) => onChange(page)}
          />
        </Content>
      </Modal>
    );
  }
}
