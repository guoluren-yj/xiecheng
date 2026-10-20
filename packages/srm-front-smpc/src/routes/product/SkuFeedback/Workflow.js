import React, { useMemo, useState, useEffect } from 'react';
import qs from 'qs';
import { DataSet, Table, CheckBox } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { SRM_SMPC } from '_utils/config';
import FormPro from '@/components/FormPro';
import WorkflowContent from '@/components/WorkflowContent';
import { updateWhiteList, updateSameSku } from './api';

const organizationId = getCurrentOrganizationId();

// 不可操作
const isNotAction = (mStatus) => ['PROCESSED', 'APPROVED', 'REJECTED'].includes(mStatus);

// 操作field
const getCheckBoxField = (fieldName) => ({
  name: fieldName,
  type: 'boolean',
  trueValue: 1,
  falseValue: 0,
  dynamicProps: { disabled: ({ dataSet }) => !!dataSet.getState('isNotAction') },
});

function FeedBackWorkflow(props) {
  const {
    location: { search = '' },
    onFormLoaded,
  } = props;
  const { manageId, readOnly } = qs.parse(search.substr(1));
  const [{ manageType, manageStatus }, setBaseInfo] = useState({
    manageType: '',
    manageStatus: 'PROCESSED',
  });
  const { baseInfoDataSet, sameSkusDataSet } = useMemo(
    () => ({
      baseInfoDataSet: new DataSet({
        autoQuery: false,
        selection: false,
        paging: false,
        fields: [getCheckBoxField('whitelistFlag')],
        events: {
          load({ dataSet }) {
            const record = dataSet.get(0);
            if (record) {
              const baseInfo = record.get(['manageType', 'manageStatus']);
              setBaseInfo(baseInfo);
            }
          },
          update: (args) => {
            if (args.name === 'whitelistFlag') {
              changeWhiteList(args);
            }
          },
        },
        transport: {
          read: {
            url: `${SRM_SMPC}/v1/${organizationId}/same-sku-manages/manage-detail/${manageId}`,
            method: 'GET',
          },
        },
      }),
      sameSkusDataSet: new DataSet({
        autoQuery: false,
        autoCreate: true,
        selection: false,
        fields: [getCheckBoxField('blacklistFlag')],
        events: {
          update: (args) => {
            if (args.name === 'blacklistFlag') {
              changeSameSku(args);
            }
          },
        },
        transport: {
          read: {
            url: `${SRM_SMPC}/v1/${organizationId}/same-sku-manage-lines/${manageId}`,
            method: 'GET',
          },
        },
      }),
    }),
    [manageId]
  );

  useEffect(() => {
    initData();
  }, []);

  const initData = async () => {
    await baseInfoDataSet.query();
    await sameSkusDataSet.query();
    if (onFormLoaded) {
      onFormLoaded(true);
    }
  };

  useEffect(() => {
    const checkBoxDisabled = readOnly === 'y' || isNotAction(manageStatus);
    baseInfoDataSet.setState('isNotAction', checkBoxDisabled);
    sameSkusDataSet.setState('isNotAction', checkBoxDisabled);
  }, [manageStatus, readOnly]);

  const baseInfoFields = useMemo(
    () => [
      { name: 'loginName', label: intl.get('smpc.feedback.view.userName').d('用户名') },
      { name: 'realName', label: intl.get('smpc.feedback.view.name').d('名称') },
      { name: 'feedbackTime', label: intl.get('smpc.feedback.view.feedbackTime').d('反馈时间') },
      {
        name: 'manageTypeMeaning',
        label: intl.get('smpc.feedback.view.problemType').d('问题类型'),
      },
      { name: 'remark', label: intl.get('smpc.product.model.remark').d('备注') },
    ],
    []
  );

  const feedbackColumns = useMemo(() => {
    return [
      {
        name: 'mainSkuCode',
        width: 120,
        header: intl.get('smpc.product.view.skuCode').d('商品编码'),
      },
      {
        name: 'mainSkuName',
        minWidth: 150,
        header: intl.get('smpc.product.view.skuName').d('商品名称'),
      },
      {
        name: 'thirdSkuCode',
        width: 130,
        header: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
      },
      {
        name: 'mainSupplierName',
        minWidth: 150,
        header: intl.get('smpc.product.view.supplier').d('供应商'),
      },
      {
        name: 'mainSkuPrice',
        minWidth: 130,
        align: 'right',
        header: intl.get('smpc.product.view.price.tax	').d('单价(含税)'),
      },
      { name: 'mainSkuUom', width: 100, header: intl.get('smpc.product.model.unit').d('单位') },
      {
        name: 'whitelistFlag',
        lock: 'right',
        width: 140,
        hidden: manageType !== 'CURRENT',
        header: intl.get('smpc.feedback.model.joinUserWhiteList').d('加入用户白名单'),
        editor: <CheckBox />,
      },
    ];
  }, [manageType]);

  const sameSkusColumns = useMemo(() => {
    return [
      {
        name: 'skuCode',
        width: 120,
        header: intl.get('smpc.product.view.skuCode').d('商品编码'),
      },
      {
        name: 'skuName',
        minWidth: 150,
        header: intl.get('smpc.product.view.skuName').d('商品名称'),
      },
      {
        name: 'thirdSkuCode',
        width: 130,
        header: intl.get('smpc.product.view.thirdSkuCode').d('第三方商品编码'),
      },
      {
        name: 'supplierCompanyName',
        minWidth: 150,
        header: intl.get('smpc.product.view.supplier').d('供应商'),
      },
      {
        name: 'skuPrice',
        minWidth: 130,
        align: 'right',
        header: intl.get('smpc.product.view.price.tax	').d('单价(含税)'),
      },
      { name: 'skuUom', width: 100, header: intl.get('smpc.product.model.unit').d('单位') },
      {
        name: 'blacklistFlag',
        lock: 'right',
        width: 100,
        header: intl.get('smpc.feedback.model.removeSameSku').d('移出同款'),
        editor: <CheckBox />,
      },
    ];
  }, []);

  async function changeWhiteList({ name, record, oldValue }) {
    const params = record.toJSONData();
    try {
      baseInfoDataSet.status = 'loading';
      const res = getResponse(await updateWhiteList(params));
      if (res) {
        baseInfoDataSet.query();
      } else {
        record.init(name, oldValue);
      }
    } finally {
      baseInfoDataSet.status = 'ready';
    }
  }

  async function changeSameSku({ name, record, oldValue }) {
    const params = record.toJSONData();
    try {
      sameSkusDataSet.status = 'loading';
      const res = getResponse(await updateSameSku([params]));
      if (res) {
        sameSkusDataSet.query(sameSkusDataSet.currentPage);
      } else {
        record.init(name, oldValue);
      }
    } finally {
      sameSkusDataSet.status = 'ready';
    }
  }

  return (
    <WorkflowContent
      contentList={[
        {
          title: intl.get('smpc.product.view.baseInfo').d('基本信息'),
          child: (
            <FormPro
              dataSet={baseInfoDataSet}
              readOnly
              columns={3}
              style={{ width: '75%' }}
              fields={baseInfoFields}
            />
          ),
        },
        {
          title: intl.get('smpc.feedback.view.feedbackSkuInfo').d('反馈商品信息'),
          child: <Table dataSet={baseInfoDataSet} columns={feedbackColumns} />,
        },
        {
          title: intl.get('smpc.feedback.view.sameSkuInfo').d('同款商品信息'),
          child: <Table dataSet={sameSkusDataSet} columns={sameSkusColumns} />,
        },
      ]}
    />
  );
}

export default formatterCollections({ code: ['smpc.product', 'smpc.feedback'] })(FeedBackWorkflow);
