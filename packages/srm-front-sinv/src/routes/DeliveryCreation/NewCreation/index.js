import React, { Fragment } from 'react';
import { Tooltip, Select } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { isNil } from 'lodash';
import { CustModal } from '@/routes/components/C7nCustomModal';
import urgentImg from '@/assets/icon-expedited.svg';
import yanqiImg from '@/assets/yanqi.svg';
import abnormal from '@/assets/abnormal.svg';
import styles from './index.less';
import { showBigNumber } from '@/routes/components/utils';

const { Option } = Select;

const Creation = (props) => {
  const {
    createDs,
    customizeTable,
    selectedChange = (e) => e,
    ruleData,
    planTypeFlag,
    searchBarTableRef,
    queryList = (e) => e,
  } = props;
  const { rcvFlag, planDataFlag, planFlag } = ruleData;

  const leftFlg = (rcvFlag && planDataFlag) || planFlag;

  /**
   * showUomText - unitCodeIsShow为1 显示code/name,为0 显示name,不存在则按旧逻辑显示
   * @param {object} record - 单条数据
   */
  const showUomText = (record) => {
    let text =
      record.get('uomName') && record.get('uomCode') ? (
        <span>{`${record.get('uomCode')}/${record.get('uomName')}`}</span>
      ) : (
        record.get('uomName')
      );
    if (!isNil(record.get('unitCodeIsShow'))) {
      text =
        record.get('unitCodeIsShow') === '1' && record.get('uomCode') && record.get('uomName')
          ? `${record.get('uomCode')}/${record.get('uomName')}`
          : record.get('uomName');
    }
    return text;
  };

  const columns = [
    {
      name: 'serialNumber',
      with: 100,
    },
    {
      name: 'itemCode',
      with: 150,
      sortable: true,
    },
    {
      name: 'itemName',
      with: 160,
    },
    {
      name: 'poSourcePlatformMeaning',
      with: 120,
    },
    {
      name: 'orderTypeName',
      with: 120,
    },
    {
      name: 'displayPoNum',
      with: 200,
      renderer: ({ value, record }) => (
        <div className={styles['row-agent-column']}>
          {value}
          {record.get('createSyncStatus') === 'FAIL' ? (
            <Tooltip title={record.sapMsg}>
              <img src={abnormal} alt="img" />
            </Tooltip>
          ) : null}
          {record.get('urgentFlag') === 1 ? (
            <Tooltip title={intl.get(`sinv.common.model.common.urgent`).d('订单加急')}>
              <img src={urgentImg} alt="img" />
            </Tooltip>
          ) : null}
          {record.get('overdueFlag') > 0 ? (
            <Tooltip title={intl.get(`sinv.common.model.common.yanqiImg`).d(`订单超期`)}>
              <img src={yanqiImg} alt="img" />
            </Tooltip>
          ) : null}
          {record.get('deliverySyncStatus') === 'FAIL' ? (
            <Tooltip
              title={intl
                .get(`sinv.deliveryCreation.view.message.feedbackMsg`)
                .d('订单承诺交期回传失败，请联系采购方重新同步')}
            >
              <img src={abnormal} alt="img" />
            </Tooltip>
          ) : null}
        </div>
      ),
    },
    {
      name: 'displayReleaseNum',
      with: 120,
    },
    {
      name: 'displayLineNum',
      with: 120,
    },
    {
      name: 'displayLineLocationNum',
      with: 120,
    },
    {
      name: 'versionNum',
      with: 100,
    },
    {
      name: 'quantity',
      with: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'canAsnQuantity',
      with: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'netReceivedQuantity',
      with: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'onWayQuantity',
      with: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'shippedQuantity',
      with: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'uomName',
      with: 100,
      renderer: ({ record }) => showUomText(record),
    },
    {
      name: 'needByDate',
      with: 100,
    },
    {
      name: 'promiseDeliveryDate',
      with: 100,
    },
    {
      name: 'exemptInspectionFlag',
      with: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'immedShippedFlag',
      with: 100,
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'purOrganizationName',
      with: 120,
    },
    {
      name: 'purchaseAgentName',
      with: 120,
    },
    {
      name: 'companyName',
      with: 180,
    },
    {
      name: 'invOrganizationName',
      with: 180,
    },
    {
      name: 'shipToThirdPartyAddress',
      with: 200,
      renderer: ({ value }) => (
        <Tooltip title={value} placement="topLeft">
          {value}
        </Tooltip>
      ),
    },
    {
      name: 'inventoryName',
      with: 180,
    },
    {
      name: 'locationName',
      with: 180,
    },
    {
      name: 'shipToThirdPartyName',
      with: 180,
    },
    {
      name: 'shipToThirdPartyContact',
      with: 180,
    },
    {
      name: 'productNum',
      with: 180,
    },
    {
      name: 'productName',
      with: 180,
    },
    {
      name: 'catalogName',
      with: 180,
    },
    {
      name: 'lineLocationRemark',
      with: 180,
    },
    {
      name: 'supplierCompanyName',
      with: 180,
    },
    {
      name: 'supplierSiteName',
      with: 200,
      renderer: ({ value }) => (
        <Tooltip title={value} placement="topLeft">
          {value}
        </Tooltip>
      ),
    },
    {
      name: 'commonName',
      with: 100,
    },
    {
      name: 'categoryName',
      with: 100,
    },
    {
      name: 'customSpecsJson',
      with: 100,
      renderer: ({ value }) => {
        return <CustModal dataSource={value ? JSON.parse(value) : []} />;
      },
    },
  ];

  return (
    <Fragment>
      <div style={{ height: 'calc(100vh - 245px)' }}>
        {customizeTable(
          {
            code: +planTypeFlag
              ? 'SINV.DELIVERY_CREATION.LIST_BY_PLAN'
              : 'SINV.DELIVERY_CREATION.LIST',
          },
          <SearchBarTable
            searchCode="SINV.DELIVERY_CREATION.NEW_FILTER"
            cacheState
            dataSet={createDs}
            columns={columns}
            // style={{ maxHeight: `calc(100vh - 400px)` }}
            boxSizing="wrapper"
            style={{ maxHeight: `calc(100% - 16px)` }}
            searchBarRef={searchBarTableRef}
            searchBarConfig={{
              onQuery: ({ params }) => queryList(params),
              left: {
                render: () =>
                  leftFlg === 1 && (
                    <Fragment>
                      <div>
                        <span>
                          {intl.get(`sinv.common.model.common.planFlag`).d('按计划送货')}:
                        </span>
                        <Select
                          clearButton={false}
                          require
                          onChange={(record) => {
                            selectedChange(record);
                          }}
                          defaultValue="1"
                          className={styles['node-select']}
                          placeholder={intl
                            .get(`sinv.common.model.common.planFlag`)
                            .d('按计划送货')}
                        >
                          <Option key="1" value="1">
                            {intl.get('hzero.common.yes').d('是')}
                          </Option>
                          <Option key="0" value="0">
                            {intl.get('hzero.common.no').d('否')}
                          </Option>
                        </Select>
                      </div>
                    </Fragment>
                  ),
              },
            }}
          />
        )}
      </div>
    </Fragment>
  );
};

export default Creation;
