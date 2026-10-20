import React from 'react';
import { Tag } from 'choerodon-ui';
import { Button, Table, DataSet } from 'choerodon-ui/pro';

import { renderTag } from '@/utils/utils';
import c7nModal from '@/utils/c7nModal';
import intl from 'utils/intl';
import openCompareModal from '@/routes/components/CompareModal';

import OtherForm from '../OrderDetail/otherForm';

const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';

const colorList = [
  { colorType: 'success', matchList: ['APPROVED', 'CONVERSION_COMPLETED', 'SUBMITTED'] },
  { colorType: 'failed', matchList: ['REJECTED', 'RETURNED'] },
  { colorType: 'invalid', matchList: ['CANCELED', 'WITHDRAWN'] },
  { colorType: 'warning', matchList: [] },
];
const tagRender = ({ record, text }) => {
  if (!record) return text;
  const { color, initStyle } = renderTag(colorList, record?.get('requestStatus'));
  return (
    <Tag color={color} style={initStyle}>
      {text}
    </Tag>
  );
};

const lineTagRender = ({ record, text }) => {
  if (!record) return text;
  const { color, initStyle } = renderTag(colorList, record?.get('lineStatus'));
  return (
    <Tag color={color} style={initStyle}>
      {text}
    </Tag>
  );
};

const baseDsFields = () => [
  {
    name: 'requestCode',
    type: 'string',
    label: intl.get('smodr.apply.model.applyCode').d('商城申请编码'),
  },
  {
    name: 'requestStatusMeaning',
    type: 'string',
    label: intl.get('smodr.apply.model.status').d('状态'),
    renderer: tagRender,
  },
  {
    name: 'requestTypeMeaning',
    type: 'string',
    label: intl.get('smodr.apply.model.requestType').d('申请类型'),
    // lovCode: 'S2FUL.MALL_REQUEST_TYPE',
    // ignore: 'always',
  },
  {
    name: 'sourceFromMeaning',
    type: 'string',
    label: intl.get('smodr.apply.model.billSource').d('单据来源'),
  },
  {
    name: 'sourceFromSystemMeaning',
    label: intl.get('smodr.common.model.sourceFromSystemMeaning').d('来源系统'),
  },
  {
    name: 'requestAmountMeaning',
    type: 'string',
    label: intl.get('smodr.apply.model.allAmount').d('总金额(含税)'),
  },
  {
    name: 'currencyName',
    type: 'string',
    label: intl.get('smodr.apply.model.currency').d('币种'),
  },
  {
    name: 'handleByName',
    type: 'string',
    label: intl.get('smodr.apply.model.handleByName').d('受理人'),
  },
  {
    name: 'createdByName',
    type: 'string',
    label: intl.get('smodr.apply.model.creationPeople').d('创建人'),
  },
  {
    name: 'requestDate',
    type: 'string',
    label: intl.get('smodr.apply.model.requestDate').d('申请时间'),
  },
  {
    name: 'remark',
    type: 'string',
    label: intl.get('smodr.apply.model.remark').d('备注'),
  },
  {
    name: 'attachmentUuid',
    type: 'attachment',
    bucketName: PRIVATE_BUCKET,
      // label: intl.get('smodr.apply.model.attachmentUuid').d('附件'),
  },
];

const handleCheckHeader = (record) => {
  const dimValueDTO = record.get('dimValueDTO');
  const newlist = (dimValueDTO?.headerCustomizedList || []).concat(
    dimValueDTO?.lineCustomizedList || []
  );
  const modal = c7nModal({
    title: intl.get('smodr.apply.model.otherInfo').d('其他信息'),
    footer: (
      <Button color="primary" onClick={() => modal?.close()}>
        {intl.get('smodr.apply.model.close').d('关闭')}
      </Button>
    ),
    children: <OtherForm list={newlist} />,
    style: { width: 380 },
  });
};

const handleCheck = (value) => {
  const data = JSON?.parse(value || null) || [];
  const ds = new DataSet({
    selection: false,
    fields: [
      { name: 'attributeNameCode', label: intl.get('smodr.apply.model.attributeNameCode').d('属性编码') },
      { name: 'attributeName', label: intl.get('smodr.apply.model.attributeName').d('属性描述') },
      { name: 'attributeValueCode', label: intl.get('smodr.apply.model.attributeValueCode').d('属性值编码') },
      { name: 'attributeValue', label: intl.get('smodr.apply.model.attributeValue').d('属性值') },
    ],
  });
  ds.loadData(data);
  const modal = c7nModal({
    title: intl.get('smodr.apply.model.material').d('物料属性'),
    footer: (
      <Button color="primary" onClick={() => modal?.close()}>
        {intl.get('smodr.apply.model.close').d('关闭')}
      </Button>
    ),
    style: { width: 742 },
    children: (
      <Table dataSet={ds}>
        <Table.Column name='attributeNameCode' />
        <Table.Column name='attributeName' />
        <Table.Column name='attributeValueCode' />
        <Table.Column name='attributeValue' />
      </Table>
    ),
  });
};

const handleCheckMachine = (value) => {
  const data = JSON?.parse(value || null) || [];
  const ds = new DataSet({
    selection: false,
    fields: [
      { name: 'orderSeq', label: intl.get('smodr.apply.model.orderSeq').d('序号') },
      { name: 'configTypeName', label: intl.get('smodr.apply.model.configTypeName').d('配置类型') },
      { name: 'configName', label: intl.get('smodr.apply.model.configName').d('配置名称') },
      { name: 'configCode', label: intl.get('smodr.apply.model.configCode').d('配置编码') },
      { name: 'quantity', label: intl.get('smodr.apply.model.quantity').d('数量') },
    ],
  });
  ds.loadData(data);
  const modal = c7nModal({
    title: intl.get('smodr.apply.model.machine').d('兼容机配置'),
    footer: (
      <Button color="primary" onClick={() => modal?.close()}>
        {intl.get('smodr.apply.model.close').d('关闭')}
      </Button>
    ),
    style: { width: 742 },
    children: (
      <Table dataSet={ds}>
        <Table.Column name='orderSeq' />
        <Table.Column name='configTypeName' />
        <Table.Column name='configName' />
        <Table.Column name='configCode' />
        <Table.Column name='quantity' />
      </Table>
    ),
  });
};

const tableDsFields = () => {
  return [
    {
      name: 'lineStatusMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.status').d('状态'),
      renderer: lineTagRender,
    },
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('smodr.apply.model.lineCode').d('行号'),
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.apply.model.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.apply.model.skuName').d('商品名称'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.skuType').d('商品类型'),
    },
    {
      name: 'sourceTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.source').d('来源渠道'),
    },
    {
      name: 'agreementBusinessTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.agreeType').d('协议类型'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('smodr.apply.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('smodr.apply.model.itemName').d('物料名称'),
    },
    {
      name: 'quantityMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.quantity').d('数量'),
      align: 'right',
    },
    // {
    //   name: 'attributeLongtext8',
    //   type: 'string',
    //   label: intl.get('smodr.apply.model.material').d('物料属性'),
    //   renderer: ({ value }) => {
    //     return (
    //       <a
    //         onClick={() => handleCheck(value)}
    //       >
    //         {intl.get('smodr.apply.model.check').d('查看')}
    //       </a>
    //     );
    //   },
    // },
    // {
    //   name: 'attributeLongtext7',
    //   type: 'string',
    //   label: intl.get('smodr.apply.model.machine').d('兼容机配置'),
    //   renderer: ({ value }) => {
    //     return (
    //       <a
    //         onClick={() => handleCheckMachine(value)}
    //       >
    //         {intl.get('smodr.apply.model.check').d('查看')}
    //       </a>
    //     );
    //   },
    // },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get('smodr.apply.model.uomName').d('单位'),
    },
    {
      name: 'taxRate',
      type: 'string',
      label: intl.get('smodr.apply.model.tax').d('税率'),
      align: 'right',
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.apply.model.currency').d('币种'),
    },
    {
      name: 'unitPriceMeaning',
      label: intl.get('smodr.apply.model.priceTax').d('预估单价(含税)'),
      align: 'right',
    },
    {
      name: 'nakedUnitPriceMeaning',
      label: intl.get('smodr.apply.model.priceNoTax').d('预估单价(不含税)'),
      align: 'right',
    },
    {
      name: 'per',
      type: 'number',
      label: intl.get('smodr.apply.model.per').d('每'),
    },
    {
      name: 'amountMeaning',
      label: intl.get('smodr.apply.model.amountTax').d('预估行金额(含税)'),
      align: 'right',
    },
    {
      name: 'nakedAmountMeaning',
      label: intl.get('smodr.apply.model.amountNoTax').d('预估行金额(不含税)'),
      align: 'right',
    },
    {
      name: 'neededDate',
      type: 'dateTime',
      label: intl.get('smodr.apply.model.needDate').d('需求日期'),
    },
    {
      name: 'requestByName',
      type: 'string',
      label: intl.get('smodr.apply.model.realRequestName').d('实际需求人'),
    },
    {
      name: 'productAttributeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.productAttributeMeaning').d('销售规格'),

    },
    {
      name: 'purchaseCompanyName',
      type: 'string',
      label: intl.get('smodr.apply.model.purchase').d('采购方'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smodr.apply.model.supplier').d('供应商'),
      lovCode: 'SPFM.USER_AUTH.SUPPLIER',
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get('smodr.apply.model.unit').d('部门'),

    },
    {
      name: 'ouName',
      type: 'string',
      label: intl.get('smodr.apply.model.ouName').d('业务实体'),

    },
    {
      name: 'purOrganizationName',
      type: 'string',
      label: intl.get('smodr.apply.model.purchaseOrg').d('采购组织'),

    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('smodr.apply.model.invorg').d('库存组织'),

    },
    {
      name: 'receiveContactName',
      type: 'string',
      label: intl.get('smodr.apply.model.contacter').d('收货人'),
    },
    {
      name: 'receiveMobilePhone',
      type: 'string',
      label: intl.get('smodr.apply.model.contactPhone').d('收货联系方式'),
    },
    {
      name: 'receiveFullAddress',
      type: 'string',
      label: intl.get('smodr.apply.model.address').d('收货地址'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smodr.apply.model.remark').d('备注'),
    },
    {
      name: 'otherInfo',
      type: 'string',
      label: intl.get('smodr.apply.model.otherInfo').d('其他信息'),
      renderer: ({ record }) => {
        const dimValueDTO = record.get('dimValueDTO');
        if (dimValueDTO && (dimValueDTO?.headerCustomizedList?.length > 0 || dimValueDTO?.lineCustomizedList?.length > 0)) {
          return (
            <Button
              color='primary'
              funcType='link'
              onClick={() => handleCheckHeader(record)}
            >
              {intl.get('smodr.apply.model.check').d('查看')}
            </Button>
          );
        } else {
          return <Button color='primary' funcType='link'>-</Button>;
        }
      },
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get('smodr.apply.model.attachmentUuid').d('附件'),
    },
    {
      name: 'productCompareDTO',
      label: intl.get('smodr.apply.model.competitive').d('比价单'),
      renderer: ({ value }) => (
        <a
          onClick={() => openCompareModal(value)}
        >
          {value
            ? intl.get('smodr.apply.model.check').d('查看')
            : '-'}
        </a>
      ),
    },
  ].filter(i => i.filter !== false);
};

export { baseDsFields, tableDsFields };

