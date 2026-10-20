import React from 'react';
import { Tag } from 'choerodon-ui';
import { Button, Attachment, Table, DataSet } from 'choerodon-ui/pro';

import { getCurrentUserId } from 'utils/utils';
import { renderTag } from '@/utils/utils';
import c7nModal from '@/utils/c7nModal';
import intl from 'utils/intl';
import openCompareModal from '@/routes/components/CompareModal';
import { addressCheck } from '@/services/oms/applyWorkBenchService';
import { Button as PermissionButton } from 'components/Permission';

import OtherForm from '../../OrderDetail/otherForm';

const PRIVATE_BUCKET = window.$$env.PRIVATE_BUCKET || 'private-bucket';
const permissionText = 'srm.mall.tenant.mall-request.workbench.button';
const userId = getCurrentUserId();
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
    name: 'handleAgentByNameLov',
    type: 'object',
    label: intl.get('smodr.apply.model.handleByName').d('受理人'),
    lovCode: 'SPFM.USER_AUTH.PURCHASE_AGENT',
    ignore: 'always',
    textField: 'purchaseAgentName',
  },
  {
    name: 'handleAgentByName',
    bind: 'handleAgentByNameLov.purchaseAgentName',
    filter: true,
  },
  {
    name: 'handleAgentByCode',
    bind: 'handleAgentByNameLov.purchaseAgentCode',
    filter: true,
  },
  {
    name: 'handleAgentBy',
    bind: 'handleAgentByNameLov.purchaseAgentId',
    filter: true,
  },
  // 新受理人
  {
    name: 'handleByNameLov',
    type: 'object',
    label: intl.get('smodr.apply.model.handleByNameNew').d('受理人'),
    lovCode: 'HIAM.TENANT.USER',
    textField: 'realName',
  },
  {
    name: 'handleByName',
    bind: 'handleByNameLov.realName',
    filter: true,
  },
  {
    name: 'handleByCode',
    bind: 'handleByNameLov.loginName',
    filter: true,
  },
  {
    name: 'handleBy',
    bind: 'handleByNameLov.id',
    filter: true,
  },
  {
    name: 'createdByName',
    type: 'string',
    label: intl.get('smodr.apply.model.creationPeople').d('创建人'),
  },
  {
    name: 'requestDate',
    type: 'dateTime',
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

const tableDsFields = (type, handleReceive, sourceFromCode) => {
  const editor = !!type;
  return [
    {
      name: 'purchaseAgentLov',
      type: 'object',
      label: intl.get('smodr.apply.model.purchaseAgentLov').d('采购员'),
      textField: 'purchaseAgentName',
      valueField: 'purchaseAgentId',
      lovCode: 'SMPC.PURCHASE_AGENT',
      editor: (record) => {
        // 当个性化配置可编辑时 电商来源 或者  运费行 仍旧不可编辑
        return editor && record.get('sourceType') !== 'EC' && record.get('sourceType') !== 'PUNCHOUT';
      },
      transformResponse: (_, record) => {
        return record?.purchaseAgentNameMeaning;
      },
    },
    {
      name: 'purchaseAgentName',
      bind: 'purchaseAgentLov.purchaseAgentName',
      columns: false,
    },
    {
      name: 'purchaseAgentId',
      bind: 'purchaseAgentLov.purchaseAgentId',
      columns: false,
    },
    {
      name: 'lineStatusMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.status').d('状态'),
      renderer: lineTagRender,
    },
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smodr.apply.model.skuCode').d('商品编码'),
      width: 120,
    },
    {
      name: 'skuName',
      type: 'string',
      label: intl.get('smodr.apply.model.skuName').d('商品名称'),
      width: 180,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('lineStatus') !== 'CANCELED';
        },
      },
      editor: (record) => editor && record.get('sourceType') === 'MANUAL' && record.get('lineStatus') !== 'CANCELED',
    },
    {
      name: 'productCompareDTO',
      type: 'string',
      label: intl.get('smodr.apply.model.competitive').d('比价单'),
      renderer: ({ value }) => value ? (
        <a
          onClick={() => openCompareModal(value)}
        >
          {intl.get('smodr.orderDetail.model.check').d('查看')}
        </a>
      ) : '-',
    },
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('smodr.apply.model.lineCode').d('行号'),
      width: 60,
    },
    // {
    //   name: 'remark',
    //   type: 'string',
    //   label: intl.get('smodr.apply.model.explain').d('说明'),
    // },
    {
      name: 'sourceTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.source').d('来源渠道'),
    },
    {
      name: 'skuTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.skuType').d('商品类型'),
    },
    {
      name: 'agreementBusinessTypeMeaning',
      type: 'string',
      label: intl.get('smodr.apply.model.agreeType').d('协议类型'),
    },
    {
      name: 'itemCode',
      type: 'object',
      label: intl.get('smodr.apply.model.itemCode').d('物料编码'),
      width: 140,
      lovCode: 'SMAL.CUSTOMER_ITEM',
      editor: (record) => editor && record.get('lineStatus') !== 'CANCELED',
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('smodr.apply.model.itemName').d('物料名称'),
      width: 140,
      validator: (value) => {
        if (value?.length > 360) {
          return intl.get('smodr.apply.tips.itemCode').d('物料名称长度超长，最长为360个汉字，请重新输入');
        } else {
          return true;
        }
      },
      editor: (record) => editor && record.get('lineStatus') !== 'CANCELED',
      dynamicProps: {
        disabled: ({ record }) => record.get('itemCode'),
      },
    },
    {
      name: 'attributeLongtext8',
      type: 'string',
      label: intl.get('smodr.apply.model.material').d('物料属性'),
      renderer: ({ value }) => {
        return (
          <a
            onClick={() => handleCheck(value)}
          >
            {intl.get('smodr.apply.model.check').d('查看')}
          </a>
        );
      },
    },
    {
      name: 'attributeLongtext7',
      type: 'string',
      label: intl.get('smodr.apply.model.machine').d('兼容机配置'),
      renderer: ({ value }) => {
        return (
          <a
            onClick={() => handleCheckMachine(value)}
          >
            {intl.get('smodr.apply.model.check').d('查看')}
          </a>
        );
      },
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('smodr.apply.model.quantity').d('数量'),
      dynamicProps: {
        required: ({ record }) => {
          return record.get('lineStatus') !== 'CANCELED';
        },
        precision: ({ record }) => record.get('uomPrecision'),
      },
      min: 0,
      validator: (value) => {
        if (value === 0) {
          return intl.get('smodr.apply.model.quantityTip').d('数量需大于0');
        }
      },
      filter: type === 'edit',
      editor: (record) => editor && record.get('sourceType') === 'MANUAL' && record.get('agreementBusinessType') !== 'RECEIVE' && record.get('lineStatus') !== 'CANCELED',
    },
    {
      name: 'quantityMeaning',
      label: intl.get('smodr.apply.model.quantity').d('数量'),
      align: 'right',
      editor: false,
      filter: type !== 'edit',
    },
    {
      name: 'uomName',
      type: 'object',
      label: intl.get('smodr.apply.model.uomName').d('单位'),
      editor: (record) => editor && record.get('sourceType') === 'MANUAL' && record.get('agreementBusinessType') !== 'RECEIVE' && record.get('lineStatus') !== 'CANCELED',
      lovCode: 'SMDM.UOM',
      textField: 'uomName',
      valueField: 'uomId',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('lineStatus') !== 'CANCELED';
        },
      },
    },
    {
      name: 'taxRate',
      type: 'object',
      align: 'right',
      label: intl.get('smodr.apply.model.tax').d('税率'),
      editor: (record) => editor && record.get('sourceType') === 'MANUAL' && record.get('agreementBusinessType') !== 'RECEIVE' && record.get('lineStatus') !== 'CANCELED',
      lovCode: 'SMDM.TAX',
    },
    {
      name: 'currencyName',
      type: 'string',
      label: intl.get('smodr.apply.model.currency').d('币种'),
    },
    {
      name: 'unitPrice',
      type: 'number',
      label: intl.get('smodr.apply.model.priceTax').d('预估单价(含税)'),
      width: 120,
      editor: (record) => editor && record.get('sourceType') === 'MANUAL' && record.get('agreementBusinessType') !== 'RECEIVE' && record.get('lineStatus') !== 'CANCELED',
      dynamicProps: {
        required: ({ record }) => {
          return record.get('lineStatus') !== 'CANCELED';
        },
        precision: ({ record }) => record.get('defaultPrecision'),
      },
      min: 0,
      align: 'right',
      filter: type === 'edit',
    },
    {
      name: 'unitPriceMeaning',
      label: intl.get('smodr.apply.model.priceTax').d('预估单价(含税)'),
      width: 120,
      editor: false,
      align: 'right',
      filter: type !== 'edit',
    },
    {
      name: 'nakedUnitPriceMeaning',
      label: intl.get('smodr.apply.model.priceNoTax').d('预估单价(不含税)'),
      width: 120,
      align: 'right',
    },
    {
      name: 'per',
      type: 'number',
      label: intl.get('smodr.apply.model.per').d('每'),
    },
    {
      name: 'amountMeaning',
      width: 120,
      label: intl.get('smodr.apply.model.amountTax').d('预估行金额(含税)'),
      align: 'right',
    },
    {
      name: 'nakedAmountMeaning',
      label: intl.get('smodr.apply.model.amountNoTax').d('预估行金额(不含税)'),
      align: 'right',
      width: 130,
    },
    {
      name: 'neededDate',
      type: 'dateTime',
      label: intl.get('smodr.apply.model.needDate').d('需求日期'),
      width: 120,
      dynamicProps: {
        required: ({ record }) => {
          return record.get('lineStatus') !== 'CANCELED';
        },
      },
      editor: (record) => editor && record.get('lineStatus') !== 'CANCELED',
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
      width: 180,
    },
    {
      name: 'supplierCompanyName',
      type: 'object',
      label: intl.get('smodr.apply.model.supplier').d('供应商'),
      width: 180,
      lovCode: 'SPFM.SUPPLIER',
      editor: (record) => editor && record.get('sourceType') === 'MANUAL' && record.get('agreementBusinessType') !== 'RECEIVE' && record.get('lineStatus') !== 'CANCELED',
    },
    {
      name: 'unitName',
      type: 'string',
      label: intl.get('smodr.apply.model.unit').d('部门'),
    },
    {
      name: 'ouLov',
      label: intl.get('smodr.apply.model.ouName').d('业务实体'),
      type: 'object',
      editor: editor && sourceFromCode === 'EXTERNAL_SYSTEM',
      lovCode: 'SMCT.SHOPPING_CART_OU',
      valueField: 'ouId',
      textField: 'ouName',
      ignore: 'always',
      dynamicProps: {
        disabled: ({ record }) => !record.get('purchaseCompanyId'),
        lovPara: ({ record }) => ({ companyId: record.get('purchaseCompanyId') }),
        required: ({ record }) => record.get('sourceBusinessDetailType') === 'EC_SHELF',
      },
    },
    {
      name: 'ouId',
      bind: 'ouLov.ouId',
      columns: false,
    },
    {
      name: 'ouName',
      bind: 'ouLov.ouName',
      columns: false,
    },
    {
      name: 'ouCode',
      bind: 'ouLov.ouCode',
      columns: false,
    },
    {
      name: 'purOrganizationLov',
      label: intl.get('smodr.apply.model.purchaseOrg').d('采购组织'),
      type: 'object',
      editor: editor && sourceFromCode === 'EXTERNAL_SYSTEM',
      lovCode: 'SPFM.USER_AUTH.PURCHASE_ORG',
      valueField: 'purchaseOrgId',
      textField: 'organizationName',
      ignore: 'always',
      dynamicProps: {
        disabled: ({ record }) => !record.get('ouId'),
        lovPara: ({ record }) => ({ ouId: record.get('ouId') }),
        required: ({ record }) => record.get('sourceBusinessDetailType') === 'EC_SHELF',
      },
      transformResponse: (_, data) => {
        return {
          purchaseOrgId: data.purOrganizationId,
          organizationName: data.purOrganizationName,
        };
      },
    },
    {
      name: 'purOrganizationId',
      bind: 'purOrganizationLov.purchaseOrgId',
      columns: false,
    },
    {
      name: 'purOrganizationName',
      bind: 'purOrganizationLov.organizationName',
      columns: false,
    },
    {
      name: 'purOrganizationCode',
      bind: 'purOrganizationLov.organizationCode',
      columns: false,
    },
    {
      name: 'invOrganizationLov',
      label: intl.get('smodr.apply.model.invorg').d('库存组织'),
      type: 'object',
      editor: editor && sourceFromCode === 'EXTERNAL_SYSTEM',
      lovCode: 'SMAL.USER_AUTH.INVORG',
      valueField: 'organizationId',
      textField: 'organizationName',
      ignore: 'always',
      dynamicProps: {
        disabled: ({ record }) => !record.get('purOrganizationId'),
        lovPara: ({ record }) => ({ ouId: record.get('ouId') }),
        required: ({ record }) => record.get('sourceBusinessDetailType') === 'EC_SHELF',
      },
      transformResponse: (_, data) => {
        return {
          organizationId: data.invOrganizationId,
          organizationName: data.invOrganizationName,
        };
      },
    },
    {
      name: 'invOrganizationId',
      bind: 'invOrganizationLov.organizationId',
      columns: false,
    },
    {
      name: 'invOrganizationName',
      bind: 'invOrganizationLov.organizationName',
      columns: false,
    },
    {
      name: 'invOrganizationCode',
      bind: 'invOrganizationLov.organizationCode',
      columns: false,
    },
    {
      name: 'receiveFullAddress',
      type: 'object',
      label: intl.get('smodr.apply.model.address').d('收货地址'),
      width: 200,
      lovCode: 'SMCT.ADDRESS',
      // required: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            companyId: record.get('purchaseCompanyId'),
            userId,
          };
        },
        required: ({ record }) => {
          return record?.get('sourceType') !== 'MANUAL' && record.get('lineStatus') !== 'CANCELED';
        },
      },
      validator: async (value, name, record) => {
        if (!record.get('receiveFullAddress')) {
          return true;
        }
        if (record.get('receiveFullAddress') && record.get('receiveAddressId')) {
          const res = await addressCheck(record.toData());
          if (res && !res.failed) {
            return true;
          } else {
            return res?.message;
          }
        }
      },
      editor: (record) => editor && (record.get('sourceType') === 'MANUAL' || record.get('sourceType') === 'CATA') && record.get('lineStatus') !== 'CANCELED' && record.get('agreementBusinessType') !== 'RECEIVE',
    },
    {
      name: 'receiveContactName',
      type: 'string',
      label: intl.get('smodr.apply.model.contacter').d('收货人'),
      // bind: 'receiveFullAddress.contactName',
    },
    {
      name: 'receiveMobilePhone',
      type: 'string',
      label: intl.get('smodr.apply.model.contactPhone').d('收货联系方式'),
      // bind: 'receiveFullAddress.mobile',
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
          return '-';
        }
      },
    },
    {
      name: 'attachmentUuid',
      type: 'attachment',
      label: intl.get('smodr.apply.model.attachmentUuid').d('附件'),
      fileSize: 1024 * 1024 * 100,
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: 'smodr',
      editor: (record) => editor && record.get('lineStatus') !== 'CANCELED' && <Attachment bucketName={PRIVATE_BUCKET} bucketDirectory='smodr' viewMode="popup" funcType="link" />,
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smodr.apply.model.remark').d('备注'),
      editor: (record) => editor && record.get('lineStatus') !== 'CANCELED',
    },
    {
      name: 'operation',
      type: 'string',
      label: intl.get('smodr.apply.model.operation').d('操作'),
      lock: 'right',
      filter: editor,
      renderer: ({ record }) => {
        if (record?.get('lineStatus') !== 'CANCELED'
          && (record?.get('sourceType') === 'MANUAL' || record?.get('sourceType') === 'CATA')
          && record?.get('agreementBusinessType') !== 'RECEIVE'
          && record?.toJSONData()?._status === 'update'
        ) {
          return (
            <PermissionButton
              type='c7n-pro'
              color='primary'
              funcType='link'
              onClick={() => handleReceive(record)}
              wait={1000}
              waitType="throttle"
              permissionList={[
                {
                  code: `${permissionText}.info.toreceive.entry`,
                  type: 'button',
                  meaning:
                    intl.get('smodr.apply.view.titleDetail').d('商城申请详情') -
                    intl.get('smodr.apply.view.permissionToLing').d('申请行转领用按钮'),
                },
              ]}
            >
              {intl.get('smodr.apply.model.toLing').d('转领用')}
            </PermissionButton>
          );
        } else {
          return <span>-</span>;
        }
      },
    },
  ].filter(i => i.filter !== false);
};

const editDsFields = (type) => [
  {
    name: 'skuName',
    type: 'string',
    label: intl.get('smodr.apply.model.skuName').d('商品名称'),
    filter: type === 'MANUAL',
  },
  {
    name: 'itemCodeLov',
    type: 'object',
    label: intl.get('smodr.apply.model.itemCode').d('物料编码'),
    lovCode: 'SMAL.CUSTOMER_ITEM',
    ignore: 'always',
  },
  {
    name: 'itemName',
    type: 'string',
    // label: intl.get('smodr.apply.model.itemCode').d('物料编码'),
    bind: 'itemCodeLov.itemName',
  },
  {
    name: 'itemCode',
    type: 'string',
    // label: intl.get('smodr.apply.model.itemCode').d('物料编码'),
    bind: 'itemCodeLov.itemCode',
  },
  {
    name: 'itemId',
    bind: 'itemCodeLov.itemId',
  },
  {
    name: 'itemCategoryId',
    bind: 'itemCodeLov.categoryId',
  },
  {
    name: 'itemCategoryCode',
    bind: 'itemCodeLov.categoryCode',
  },
  {
    name: 'itemCategoryName',
    bind: 'itemCodeLov.categoryName',
  },
  {
    name: 'itemUomId',
    bind: 'itemCodeLov.uomId',
  },
  {
    name: 'itemUomCode',
    bind: 'itemCodeLov.uomCode',
  },
  {
    name: 'itemUomName',
    bind: 'itemCodeLov.uomName',
  },
  {
    name: 'quantityMeaning',
    label: intl.get('smodr.apply.model.quantity').d('数量'),
    filter: type === 'MANUAL',
  },
  {
    name: 'uomName',
    type: 'object',
    label: intl.get('smodr.apply.model.uomName').d('单位'),
    filter: type === 'MANUAL',
    lovCode: 'SMDM.UOM',
  },
  {
    name: 'taxRate',
    type: 'object',
    label: intl.get('smodr.apply.model.tax').d('税率'),
    lovCode: 'SMDM.TAX',
    filter: type === 'MANUAL',
  },
  {
    name: 'supplier',
    type: 'object',
    label: intl.get('smodr.apply.model.supplier').d('供应商'),
    lovCode: 'SPFM.USER_AUTH.SUPPLIER',
    ignore: 'always',
    filter: type === 'MANUAL',
  },
  {
    name: 'supplierId',
    bind: 'supplier.supplierId',
    filter: type === 'MANUAL',
  },
  {
    name: 'supplierCompanyCode',
    bind: 'supplier.supplierCompanyCode',
    filter: type === 'MANUAL',
  },
  {
    name: 'supplierCompanyName',
    bind: 'supplier.supplierCompanyName',
    filter: type === 'MANUAL',
  },
  {
    name: 'neededDate',
    type: 'dateTime',
    label: intl.get('smodr.apply.model.needDate').d('需求日期'),
  },
  // {
  //   name: 'receiveFullAddress',
  //   type: 'string',
  //   label: intl.get('smodr.apply.model.address').d('收货地址'),
  //   filter: ['MANUAL', 'CATA'].includes(type),
  // },
  {
    name: 'remark',
    type: 'string',
    label: intl.get('smodr.apply.model.remark').d('备注'),
  },
].filter(i => i.filter !== false);

export { baseDsFields, tableDsFields, editDsFields };

