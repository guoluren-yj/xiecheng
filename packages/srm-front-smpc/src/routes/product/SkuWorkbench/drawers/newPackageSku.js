import React, { useEffect, useMemo, useState } from 'react';
import { DataSet, Table, Button, Lov } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { Tooltip, Alert } from 'choerodon-ui';
import notification from 'utils/notification';
import qs from 'querystring';

import intl from 'utils/intl';
import { getResponse, filterNullValueObject } from 'utils/utils';
import c7nModal from '@/utils/c7nModal';
import { fetchComposeCataSku } from '../api';

import styles from './style.less';

const packageDS = () => ({
  autoCreate: true,
  paging: false,
  selection: 'multiple',
  forceValidate: true,
  fields: [
    {
      name: 'skuCode',
      label: intl.get('smpc.product.view.skuCode').d('商品编码'),
    },
    {
      name: 'skuName',
      label: intl.get('smpc.product.view.skuName').d('商品名称'),
    },
    {
      name: 'packageNum',
      type: 'number',
      label: intl.get('small.common.model.quantity').d('数量'),
      required: true,
      step: 1,
      min: 1,
    },
  ],
});
const lovDS = (packageDs) => ({
  autoCreate: true,
  paging: false,
  strictPageSize: false,
  pageSize: 20,
  fields: [
    {
      name: 'drawer',
      valueField: 'skuId',
      textField: 'skuName',
      type: 'object',
      lovCode: 'SMPC.PUR_WORKBENCH_ADD',
      multiple: true,
      pageSize: 20,
      dynamicProps: {
        lovPara: () => {
          return {
            skuType: 'CATA',
            shelfFlag: 1,
            customizeFilterComparison: 'skuName:LIKE',
            customizeUnitCode: 'SMPC.WORKBENCH_PUR.SKU.SEARCH_BAR,SMPC.WORKBENCH_PUR.LIST_ALL',
          };
        },
      },
    },
  ],
  events: {
    update: ({ value, dataSet }) => {
      const skuIds = packageDs.map((r) => r.get('skuId')) || [];
      const data = value.filter((p) => !skuIds.includes(p.skuId)); // 已选中的商品不重复添加
      packageDs.appendData(data);
      dataSet.reset(); // 清楚已选数据
    },
  },
});

const DelBtn = observer(({ dataSet, onClick = (e) => e }) => (
  <Button
    icon="delete_sweep"
    funcType="flat"
    color="primary"
    disabled={dataSet.selected.length < 1}
    onClick={onClick}
  >
    {intl.get('smpc.product.button.batchDelete').d('批量删除')}
  </Button>
));

const OkBtn = observer(({ dataSet, onClick = (e) => e }) => {
  return (
    <Tooltip
      title={
        dataSet.length < 2
          ? intl.get(`smpc.workbench.view.confirmCreateTip`).d('请至少添加2个商品组成套餐')
          : dataSet.length > 100
          ? intl.get('smpc.workbench.view.addSkuMaxTen').d('至多添加100个商品组成套餐')
          : ''
      }
      placement="top"
    >
      <Button
        color="primary"
        disabled={dataSet.length < 2 || dataSet.length > 100}
        onClick={onClick}
      >
        {intl.get('smpc.workbench.view.confirmCreate').d('确认新建')}
      </Button>
    </Tooltip>
  );
});

function SkuTable(props) {
  const { modal, selected, history, prefixPath } = props;
  const [visiable, setVisible] = useState(true);
  const packageDs = useMemo(() => new DataSet(packageDS()), []);
  const lovDataSet = useMemo(() => new DataSet(lovDS(packageDs)), [packageDs]);
  const buttons = [
    <Lov
      dataSet={lovDataSet}
      clearButton={false}
      icon="playlist_add"
      mode="button"
      viewMode="drawer"
      name="drawer"
      tableProps={{
        style: { maxHeight: 'calc(100vh - 150px)' },
      }}
      modalProps={{
        style: { maxWidth: '1090px' },
      }}
    >
      {intl.get('smpc.workbench.view.addSku').d('添加商品')}
    </Lov>,
    <DelBtn dataSet={packageDs} onClick={() => handleDelete()} />,
  ];
  const columns = [
    {
      name: 'orderSequence',
      title: intl.get('smpc.product.model.displayOrderSeq').d('序号'),
      width: 60,
      renderer: ({ record }) => record.index + 1,
    },
    { name: 'skuCode', width: 140 },
    { name: 'skuName', width: 280 },
    { name: 'packageNum', width: 140, align: 'right', editor: true },
  ];
  const footer = (ok, cancelBtn) => {
    return [<OkBtn dataSet={packageDs} onClick={handleOk} />, cancelBtn];
  };
  const handleDelete = () => {
    packageDs.remove(packageDs.selected, true);
  };
  const handleOk = async () => {
    const flag = await packageDs.validate();
    if (!flag) return false;
    const params = {
      skuList: packageDs.toData(),
    };
    const composeSkuData = await fetchComposeCataSku(params);
    if (getResponse(composeSkuData)) {
      notification.success();
      history.push({
        pathname: `${prefixPath}/create`,
        search: qs.stringify(
          filterNullValueObject({
            req: 'cata',
          })
        ),
        state: {
          composeSkuData,
        },
      });
    }
  };

  useEffect(() => {
    if (selected && Array.isArray(selected)) {
      packageDs.loadData(selected.map((s) => s.toData()));
    }
    modal.update({ footer });
  }, [selected]);

  return (
    <>
      <Alert
        className={styles['warning-help']}
        message={intl.get('smpc.workbench.view.packageSkuTip').d('请添加2-100个商品组合套餐')}
        type="info"
        showIcon
        closable
        afterClose={() => setVisible(false)}
      />
      <Table
        dataSet={packageDs}
        buttons={buttons}
        columns={columns}
        customizedCode="SMPC.WORKBENCH_PUR.NEW_PACKAGE_SKU_TABLE"
        style={{
          maxHeight: visiable ? 'calc(100vh - 230px)' : 'calc(100vh - 194px)',
        }}
      />
    </>
  );
}

export default function openNewPackageSku(props) {
  c7nModal({
    style: { width: 742 },
    title: intl.get('smpc.workbench.view.createPackageSku').d('新建套餐商品'),
    children: <SkuTable {...props} />,
  });
}
