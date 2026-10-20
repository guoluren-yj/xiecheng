import React, { useMemo, useEffect } from 'react';
import { DataSet, Table, Button, Dropdown, Menu, Icon, Lov, Modal } from 'choerodon-ui/pro';
import { Observer } from 'mobx-react-lite';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import ImportButton from 'components/Import';
import { openSkuSelect } from '@/modals';
import openRepeatList from './openRepeatList.js';

import { addCentralizeSku, centralizeDeleteCheckService } from '../api';
import styles from './index.less';

export default function SkuInfo(props) {
  const { templateId, readOnly, dataSet, formDataSet, customizeTable, remote } = props;
  const quoteDs = useMemo(
    () =>
      new DataSet({
        fields: [
          {
            name: 'quote',
            type: 'object',
            lovCode: 'SMAL.PRODUCT_GROUP_LIST',
            lovPara: { belongType: 0, groupAttribute: 0, groupType: 0, filterReceiveFlag: 1 },
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
    {
      name: 'purchaseQuantity',
      editor: !readOnly,
    },
  ].filter(f => f.show !== false);

  // 新增商品
  async function handleAddSku(data) {
    const list = data.map(d => ({ productId: d.skuId, productName: d.skuName, templateId }));
    const status = formDataSet.current?.get('publishStatus');
    const res = getResponse(await addCentralizeSku({ templateId, centralizedFixedSkuList: list }));
    if (res) {
      dataSet.query();
    }
    if (res && res.length > 0 && status === 'PUBLISHED') { // 已发布下添加商品的重复提示
      openRepeatList({ checkList: res });
    } else {
      notification.success();
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

  // 删除商品
  async function handleDeleteSku() {
    const status = formDataSet.current?.get('publishStatus');
    if(status === 'PUBLISHED') {
      const params = {
        centralizedFixedSkuList: dataSet.selected.map(r => r.toData()),
      };
      const newParams = remote?.process('PROCESS_DELETE_SKU_PARAMS', params) || params;
      const res = getResponse(await centralizeDeleteCheckService(newParams));
      if(res && res.length) {
        const ds = new DataSet({
          selection: false,
          paging: false,
          data: res,
          fields: [{
            name: 'productName',
            label: intl.get('small.centralize.view.skuName').d('商品名称'),
          }],
        });
        Modal.confirm({
          title: intl.get('small.common.view.tips').d('提示'),
          children: (
            <>
              <p className={styles['delete-sku-confirm']}>{intl.get('small.centralize.view.deleteSkuConfirm').d('以下商品已有用户加入拼单，删除后提需人提交的拼单商品可继续生成拼单活动订单，如确定此商品不再拼单请下单人自行驳回，请确认是否继续删除？')}</p>
              <Table
                dataSet={ds}
                columns={[{name: 'productName'}]}
                customizedCode="SMALL_CENTRALIZE_DELETE_CONFIRM_TABLE"
                style={{maxHeight: 200}}
              />
            </>
          ),
          onOk: () => dataSet.delete(dataSet.selected, false),
        });
        return;
      }
    }
    dataSet.delete(dataSet.selected);
  }

  const menu = (
    <Menu>
      <Menu.Item onClick={() => openSkuSelect({ onOk: handleAddSku, queryParams: { purSkuStatus: 1, receiveFlag: 0 } })}>
        {intl.get('small.centralize.model.manualAddSku').d('手动新增商品')}
      </Menu.Item>
      <Menu.Item className={styles['menu-item']}>
        <ImportButton
          businessObjectTemplateCode="CENTRALIZED_FIXED_SKU_IMPORT"
          refreshButton
          buttonText={intl.get('small.centralize.model.batchImportSku').d('批量导入商品')}
          prefixPatch="/smct"
          args={{ templateId }}
          successCallBack={() => dataSet.query()}
          buttonProps={{
            icon: '',
            funcType: 'link',
            color: 'dark',
          }}
        />
      </Menu.Item>
      <Menu.Item className={styles['menu-item']}>
        <Lov
          mode="button"
          funcType="link"
          color='dark'
          name="quote"
          clearButton={false}
          dataSet={quoteDs}
          onChange={handleQuoteRecommend}
        >
          {intl.get('small.centralize.model.quoteRecommend').d('引用商品推荐列表')}
        </Lov>
      </Menu.Item>
    </Menu>
  );

  const buttons = [
    <Dropdown overlay={menu}>
      <Button color="primary" funcType="flat" icon="playlist_add">
        {intl.get('small.centralize.model.addSku').d('新增商品')}
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
          onClick={() => handleDeleteSku()}
        >
          {intl.get('small.centralize.button.batchDelete').d('批量删除')}
        </Button>
      )}
    </Observer>,
  ];
  return (
    customizeTable(
      {
        code: `SMCT_CENTRALIZED_TEMPLATE.DETAIL.SKU_INFO`,
      },
      <Table
        dataSet={dataSet}
        columns={columns}
        buttons={readOnly ? [] : buttons}
        style={{maxHeight: '420px'}}
        customizedCode="SMCT_CENTRALIZED_TEMPLATE.DETAIL.SKU_INFO"
      />)
  );
}
