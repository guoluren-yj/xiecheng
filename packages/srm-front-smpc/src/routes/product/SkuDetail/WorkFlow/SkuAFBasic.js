import React, { useState, useContext } from 'react';
import { Button } from 'choerodon-ui/pro';
import qs from 'qs';

import { AFBasic } from '_components/AFCards';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { openTab } from 'utils/menuTab';

import operateRenderer from '@/routes/product/SkuWorkbench/records/operateRenderer';
import { openRecordTabs } from '../../SkuWorkbench/drawers';
import SkuContext from '../skuContext';

const ViewFilter = ({ onChange = () => null }) => {
  const [activeKey, setActiveKey] = useState('order'); // 无激活项
  const handleChange = (key) => {
    setActiveKey(key);
    onChange(key);
  };
  return (
    <div className="view-filter">
      <span
        className={`${activeKey === 'order' ? 'view-active' : ''}`}
        onClick={() => handleChange('order')}
      >
        {intl.get('smpc.product.view.updatedDetail').d('展示变更后单据')}
      </span>
      <span
        className={`${activeKey === 'item' ? 'view-active' : ''}`}
        onClick={() => handleChange('item')}
      >
        {intl.get('smpc.product.view.updatedItem').d('仅展示变更项')}
      </span>
    </div>
  );
};

export default function SkuAFBasic({
  dataSet,
  isSup,
  skuTemporaryId,
  skuId,
  changeFlag,
  hiddenHeaderBtn = false,
}) {
  const { onViewChange } = useContext(SkuContext);

  const operateRecord = (record) => {
    openRecordTabs(
      {
        rowRecord: record,
        skuTemporaryId,
        leftOperateArg: {
          url: `/smpc/v1/${getCurrentOrganizationId()}/sku-operation-records/list`,
          queryParams: {
            skuId: record.get('skuId'),
          },
          operateRenderer,
          partLoad: true,
        },
      },
      isSup
    );
  };

  // 预览
  function handlePreview() {
    if (!dataSet.current) return false;
    const { skuId: productId, sourceFrom } = dataSet.current.toData();
    openTab({
      key: '/smpc/sku-preview',
      title: 'srm.common.view.skuPreview',
      search: qs.stringify(
        filterNullValueObject({
          req: 'new',
          btnFlag: 'n',
          closePath: '/smpc/sku-workbench-pur/list',
          productId: productId || skuId,
          sourceFrom,
          skuTemporaryId,
        })
      ),
    });
  }

  return (
    <Content>
      <AFBasic
        dataSet={dataSet}
        titleField="skuName"
        tagFields={['sourceFrom', 'customFlag']}
        normalFields={['publisher', 'creationDate']}
        fieldsConfig={{
          skuName: {
            render({ value }) {
              if (!value) return '-';
              return `${value} - ${dataSet?.current?.get('skuCode')}`;
            },
          },
          // 组件有bug, 字段没值报错
          // publisher: {
          //   render({ value }) {
          //     return value || '-';
          //   },
          // },
          // creationDate: {
          //   render({ value }) {
          //     return value || '-';
          //   },
          // },
          customFlag: {
            hidden: !dataSet?.current?.get('customFlag'),
            render() {
              return intl.get('smpc.product.view.customSku').d('定制品');
            },
          },
          sourceFrom: {
            render({ value }) {
              return value === 'CATA'
                ? intl.get('smpc.product.view.cataSku').d('目录化商品')
                : intl.get('smpc.product.view.ecSku').d('电商商品');
            },
          },
        }}
        contentRemainWidth="25%"
        contentBottomRender={() => (
          <div className="basic-operate">
            <div className="basic-operate-left">
              {!hiddenHeaderBtn && (
                <>
                  <Button
                    icon="operation_service_request"
                    onClick={() => {
                      if (dataSet.current) {
                        operateRecord(dataSet.current);
                      }
                    }}
                    funcType="flat"
                  >
                    {intl.get('hzero.common.button.record').d('操作记录')}
                  </Button>
                  <Button icon="find_in_page" onClick={handlePreview} funcType="flat">
                    {intl.get('hzero.common.button.preview').d('预览')}
                  </Button>
                </>
              )}
            </div>
            <div className="basic-operate-right">
              {changeFlag ? (
                <div className="header-right">
                  <ViewFilter onChange={onViewChange} />
                </div>
              ) : (
                ''
              )}
            </div>
          </div>
        )}
      />
    </Content>
  );
}
