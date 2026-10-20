import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Button, Dropdown, Menu, Icon, Lov } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react-lite';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import ImportButton from 'components/Import';
import { openSkuSelect } from '@/modals';
import { getSkuInfoDsProps } from './dataSet';
import { addCentralizeSku } from '../api';
import styles from './index.less';

export default function SkuInfo(props) {
  const { templateId, readOnly } = props;
  const dataSet = useMemo(() => new DataSet(getSkuInfoDsProps()), []);
  const quoteDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'quote',
            type: 'object',
            lovCode: 'SMAL.PRODUCT_GROUP_LIST',
            lovPara: { belongType: 0, groupAttribute: 0, groupType: 0 },
          },
        ],
      }),
    []
  );

  useEffect(() => {
    dataSet.selection = readOnly ? false : 'multiple';
  }, [readOnly]);

  useEffect(() => {
    dataSet.setQueryParameter('templateId', templateId);
    dataSet.query();
  }, [templateId]);

  const columns = [
    {
      name: 'productCode',
      width: 200,
    },
    {
      name: 'productName',
    },
    {
      name: 'supplierCompanyName',
    },
  ].filter(f => f.show !== false);

  async function handleAddSku(data) {
    const list = data.map(d => ({ productId: d.skuId, productName: d.skuName, templateId }));
    const res = getResponse(await addCentralizeSku({ templateId, centralizedFixedSkuList: list }));
    if (res) {
      notification.success();
      dataSet.query();
    }
  }

  async function handleQuoteRecommend(data) {
    if (data) {
      try {
        dataSet.status = 'loading';
        const res = getResponse(await addCentralizeSku({ templateId, groupId: data.groupId }));
        if (res) {
          notification.success();
          dataSet.query();
        }
      } finally {
        dataSet.status = 'ready';
      }
    }
  }

  const menu = (
    <Menu>
      <div className={styles['menu-item']}>
        <Button funcType="flat" onClick={() => openSkuSelect({ onOk: handleAddSku })}>
          {intl.get('small.centralize.model.manualAddSku').d('手动添加商品')}
        </Button>
      </div>
      <div className={styles['menu-item']}>
        <ImportButton
          businessObjectTemplateCode="CENTRALIZED_FIXED_SKU_IMPORT"
          refreshButton
          buttonText={intl.get('small.centralize.model.batchImportSku').d('批量导入商品')}
          prefixPatch="/smct"
          args={{ templateId }}
          successCallBack={() => dataSet.query()}
          buttonProps={{
            icon: '',
            funcType: 'flat',
          }}
        />
      </div>
      <div className={styles['menu-item']}>
        <Lov
          mode="button"
          funcType="flat"
          name="quote"
          clearButton={false}
          dataSet={quoteDs}
          onChange={handleQuoteRecommend}
        >
          {intl.get('small.centralize.model.quoteRecommend').d('引用商品推荐列表')}
        </Lov>
      </div>
    </Menu>
  );

  const buttons = [
    <Dropdown overlay={menu}>
      <Button color="primary" funcType="flat" icon="playlist_add">
        {intl.get('small.centralize.model.addSku').d('添加商品')}
        <Icon type="keyboard_arrow_down" style={{ fontWeight: 400 }} />
      </Button>
    </Dropdown>,
    <Observer>
      {() => (
        <Button
          icon="delete_sweep"
          color="primary"
          funcType="flat"
          disabled={dataSet.selected.length < 1}
          onClick={() => dataSet.delete(dataSet.selected)}
        >
          {intl.get('small.centralize.button.batchDelete').d('批量删除')}
        </Button>
      )}
    </Observer>,
  ];

  return (
    <Table
      dataSet={dataSet}
      columns={columns}
      buttons={readOnly ? [] : buttons}
      customizedCode="SMALL.CENTRALIZE.DETAIL.SKU_INFO"
    />
  );
}
