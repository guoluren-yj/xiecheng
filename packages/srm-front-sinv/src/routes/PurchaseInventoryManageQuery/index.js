import React, { useEffect, useState, useMemo } from 'react';
import intl from 'utils/intl';
import { getUserOrganizationId, getCurrentOrganizationId, getResponse } from 'utils/utils';
import noData from '@/assets/noData.svg';
import { Form, TextField, Lov, DataSet, Button, Icon, Spin } from 'choerodon-ui/pro';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import { compose } from 'lodash';
import { observer } from 'mobx-react-lite';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import formatterCollections from 'utils/intl/formatterCollections';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import { SRM_SPUC } from '_utils/config';
import InvertoryList from './List/InvertoryList';
import InvertoryDataSet from './store/ListDs';
import SearchFormDataSet from './store/SearchFormDs';
import { queryInventoryList } from '../../services/PurchaseInventoryManageQueryService';
import { c7nModal } from '../PurchaseCollaborativeWorkbench/hooks';
import styles from './index.less';

const supplierTenantId = getUserOrganizationId();
const tenantId = getCurrentOrganizationId();

const Index = (props) => {
  const { customizeTable, history, InvertoryDs, customizeBtnGroup, customizeForm } = props;
  const SearchFormDs = useMemo(() => new DataSet(SearchFormDataSet()), []);
  const [svgWidth, setSvgWidth] = useState(0);
  const [invertoryData, setInvertoryData] = useState([{}]);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (document.getElementById('bg')) {
      setSvgWidth(document.getElementById('bg').offsetWidth * 0.13 + 138);
    }
    handleQuery();
  }, []);

  const handleQuery = async () => {
    const LogisticForm = () =>
      customizeForm(
        {
          code: 'SINV-PURCHASER-INVENTORY-QUERY.DRAWER_SEARCH',
        },
        <Form columns={1} dataSet={SearchFormDs}>
          <Lov name="supplierCompanyLov" />
          <Lov name="tempkeys" />
          <Lov name="invOrganizationId" />
          <Lov name="itemId" />
          <TextField name="itemName" disabled />
          <Lov name="inventoryId" />
          <Lov name="locatorId" />
          <TextField name="lotNum" />
        </Form>
      );
    return c7nModal({
      title: intl.get('sinv.inventoryBench.model.view.associatedNum').d('获取库存数据'),
      children: <LogisticForm />,
      style: { width: 380 },
      onOk: async () => {
        const flag = await SearchFormDs.validate();
        const params = {
          ...SearchFormDs?.current?.toJSONData(),
          customizeUnitCode: 'SINV-PURCHASER-INVENTORY-QUERY.DRAWER_SEARCH',
        };
        InvertoryDs.setQueryParameter('params', params);

        if (flag) {
          // ds.reset();
          // queryInventoryList(params).then((res) => {
          //   if (getResponse(res)) {
          //     if (Array.isArray(res?.content) && res?.content?.length) {
          //       setInvertoryData(res.content);
          //       InvertoryDs.loadData(res.content, res.totalElements);
          //     } else {
          //       // notification.warning({
          //       //   message: intl.get(`sinv.inventoryBench.model.view.noData`).d('暂无数据'),
          //       // });
          //       InvertoryDs.loadData(res.content, res.totalElements);
          //     }
          //   }
          // });
          try {
            setLoading(true);
            const res = await queryInventoryList(params);
            if (getResponse(res)) {
              if (Array.isArray(res?.content) && res?.content?.length) {
                setInvertoryData(res.content);
                InvertoryDs.loadData(res.content, res.totalElements);
              } else {
                // notification.warning({
                //   message: intl.get(`sinv.inventoryBench.model.view.noData`).d('暂无数据'),
                // });
                InvertoryDs.loadData(res.content, res.totalElements);
              }
            }
          } finally {
            setLoading(false);
          }
          return true;
        }
        return false;
      },
    });
  };

  const HeaderBtns = observer(({ dataSet }) => {
    // const creationQueryParams = filterNullValueObject({
    //   ...dataSet?.queryParameter.params,
    //   ...dataSet.queryDataSet?.toData()[0],
    // });
    const buttons = [
      {
        name: 'export',
        group: true,
        child: (
          <ExcelExportPro
            otherButtonProps={{
              icon: 'unarchive',
              type: 'c7n-pro',
              funcType: 'flat',
            }}
            requestUrl={`${SRM_SPUC}/v1/${tenantId}/stockout/report/export`}
            queryParams={{
              ...SearchFormDs?.current?.toJSONData(),
              supplierTenantId,
            }}
            templateCode="SINV_OUTSOURCING_INVENTORY_EXTERNAL_EXPORT"
          />
        ),
      },
      {
        name: 'update',
        group: true,
        child: (
          <>
            <Button color="primary" onClick={() => handleQuery(dataSet)}>
              <Icon type="rotate_left" style={{ marginRight: '4px' }} />
              {intl.get(`sinv.inventoryBench.model.view.updateInventoryData`).d('更新库存数据')}
            </Button>
          </>
        ),
      },
    ];

    return customizeBtnGroup(
      { code: 'SINV-PURCHASER-INVENTORY-QUERY.BTNS', pro: true },
      <DynamicButtons buttons={buttons} />
    );
  });

  const listProps = {
    customizeTable,
    InvertoryDs,
    history,
  };

  return (
    <>
      <Header
        title={intl
          .get(`sinv.inventoryBench.model.view.titleManageQuery`)
          .d('采购方库存现有量查询')}
      >
        {invertoryData.length ? <HeaderBtns dataSet={InvertoryDs} /> : null}
      </Header>
      {!invertoryData.length && (
        <div id="bg" style={{ overflow: 'hidden' }}>
          <Content className={styles.text}>
            <div className={styles.wrap}>
              <img src={noData} alt="img" width={svgWidth} />
              <div className={styles.wrapText}>
                <h3 className={styles.query}>
                  {intl
                    .get(`sinv.inventoryBench.model.view.titleManageQuery`)
                    .d('采购方库存现有量查询')}
                </h3>
                <h3 className={styles.tip}>
                  {intl
                    .get(`sinv.inventoryBench.model.view.tips`)
                    .d('当前需要您先输入相关参数数据,获取外部信息')}
                </h3>
                <Button onClick={handleQuery} color="primary" className={styles.btn}>
                  {intl.get(`sinv.inventoryBench.model.view.getInventoryData`).d('获取库存数据')}
                </Button>
              </div>
            </div>
          </Content>
        </div>
      )}

      {invertoryData.length ? (
        <Spin spinning={loading}>
          <Content>
            <InvertoryList {...listProps} />
          </Content>
        </Spin>
      ) : null}
    </>
  );
};

export default compose(
  formatterCollections({
    code: ['sinv.inventoryBench'],
  }),
  WithCustomize({
    unitCode: [
      'SINV-PURCHASER-INVENTORY-QUERY.SEARCH',
      'SINV-PURCHASER-INVENTORY-QUERY.BTNS',
      'SINV-PURCHASER-INVENTORY-QUERY.DRAWER_SEARCH',
      'SINV-PURCHASER-INVENTORY-QUERY.LIST',
    ],
  }),
  withProps(
    () => {
      const InvertoryDs = new DataSet(InvertoryDataSet());
      return { InvertoryDs };
    },
    { cacheState: true }
  )
)(Index);
