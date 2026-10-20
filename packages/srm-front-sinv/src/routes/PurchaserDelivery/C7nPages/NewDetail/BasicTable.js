import React, { Fragment } from 'react';
import { Table, Tabs, Spin, Form, TextField, Output } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { Content } from 'components/Page';
import { yesOrNoRender, dateRender } from 'utils/renderer';
import styles from './form.less';
import { showBigNumber } from '@/routes/components/utils';
import ImageList from '@/routes/components/ImageList';
import { showUomText, handleBomRecord } from '../../utils';
import { CustModal } from '@/routes/components/C7nCustomModal';
import LogisticsDetail from '@/routes/components/C7nFormLogistic';

const { TabPane } = Tabs;

const BasicTable = (props) => {
  const {
    basicDs,
    otherDs,
    logisticsBasicDs,
    headerInfo,
    customizeTable,
    customizeForm,
    customizeTabPane,
    editFlag = false,
  } = props;

  const basicColumns = [
    {
      name: 'asnLineNum',
      width: 100,
    },
    {
      name: 'itemCode',
      width: 150,
    },
    {
      name: 'categoryName',
      width: 120,
    },
    {
      name: 'itemName',
      width: 214,
    },
    {
      name: 'supplierItemNum',
      width: 110,
    },
    {
      name: 'supplierItemDesc',
      width: 180,
    },
    {
      name: 'cancelledFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'closedFlag',
      width: 80,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'shipQuantity',
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'grossWeightStandard',
      width: 120,
    },
    {
      name: 'netWeightStandard',
      width: 120,
    },
    {
      name: 'weightUomName',
      width: 120,
      renderer: ({ record }) => showUomText(record, 'weightUomCode', 'weightUomName'),
    },
    {
      name: 'uomName',
      width: 100,
      renderer: ({ record }) => showUomText(record, 'uomCode', 'uomName'),
    },
    {
      name: 'receiveStatusMeaning',
      width: 110,
    },
    {
      name: 'receiveQuantity',
      width: 80,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'displayPoNum',
      width: 140,
    },
    {
      name: 'displayReleaseNum',
      width: 90,
    },
    {
      name: 'displayLineNum',
      width: 110,
    },
    {
      name: 'displayLineLocationNum',
      width: 90,
    },
    {
      name: 'versionNum',
      width: 90,
    },
    {
      name: 'batchNo',
      width: 150,
    },
    {
      name: 'lotNum',
      width: 150,
    },
    {
      name: 'neededDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'promisedDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'purchaseAgentName',
      width: 120,
    },
    {
      name: 'inventoryName',
      width: 90,
    },
    {
      name: 'locationName',
      width: 90,
    },
    {
      name: 'productionOrderNum',
      width: 120,
    },
    {
      name: 'contactInfo',
      width: 150,
    },
    {
      name: 'productNum',
      width: 150,
    },
    {
      name: 'productName',
      width: 150,
    },
    {
      name: 'catalogName',
      width: 150,
    },
    {
      name: 'purchaseRemark',
      width: 150,
    },
    {
      name: 'approveAttachmentUuid',
      width: 130,
    },
    {
      name: 'reviewAttachmentUuid',
      width: 130,
    },
    {
      name: 'otherAttachmentUuid',
      width: 130,
      editor: editFlag,
    },
    {
      name: 'supplierRemark',
      width: 150,
    },
    {
      name: 'attachmentUuid',
      width: 120,
    },
    {
      name: 'customSpecsJson',
      width: 120,
      renderer: ({ value }) => {
        return <CustModal dataSource={value ? JSON.parse(value) : []} />;
      },
    },
    {
      name: 'attachmentUrlList',
      width: 100,
      renderer: ({ value }) => {
        return <ImageList imageDTO={(value && value.slice()) || []} />;
      },
    },
  ];

  const otherColumns = [
    {
      name: 'asnLineNum',
      width: 80,
    },
    {
      name: 'itemCode',
      width: 120,
    },
    {
      name: 'categoryName',
      width: 120,
    },
    {
      name: 'itemName',
      width: 214,
    },
    {
      name: 'productionDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'shelfLife',
      width: 150,
    },
    {
      name: 'lotExpirationDate',
      width: 150,
      renderer: ({ value }) => dateRender(value),
    },
    {
      name: 'unitPackageQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'packageQuantity',
      width: 60,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'remainderQuantity',
      width: 110,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'serialNum',
      width: 100,
    },
    {
      name: 'invoiceNum',
      width: 90,
    },
    {
      name: 'oldItemCode',
    },
    {
      name: 'bom',
      width: 120,
      renderer: ({ record }) => (
        <a onClick={() => handleBomRecord(record)}>
          {intl.get(`hzero.common.button.view`).d('查看')}
        </a>
      ),
    },
  ];

  const logisticsBasicColumns = [
    {
      name: 'expressNum',
      disabled: true,
    },
    {
      name: 'logisticsStaff',
      disabled: true,
    },
    {
      name: 'logisticsPhoneNum',
      disabled: true,
      renderer: ({ value, record }) =>
        `${(record && record.get('internationalTelMeaning')) || ''} | ${value || ''}`,
    },
    {
      name: 'logisticsCompany',
      disabled: true,
    },
    {
      name: 'logisticsContactInfo',
      disabled: true,
    },
    {
      name: 'logisticsCost',
      disabled: true,
    },
    {
      name: 'carNumber',
      disabled: true,
    },
  ];

  const logisticsDetailProps = {
    customizeForm,
    headerInfo,
  };

  return (
    <Fragment>
      <div id="purchaser-delivery-basicInfo">
        <Content className={styles['table-info']}>
          {customizeTabPane(
            {
              code: 'SINV.PURCHASER_DELIVERY.DETAIL.LINE_TABS',
            },
            <Tabs animated={false}>
              <TabPane
                tab={intl.get(`sinv.purchaserDelivery.view.message.title.basicInfo`).d('基本信息')}
                key="basicInfo"
              >
                {customizeTable(
                  {
                    code: `SINV.PURCHASER_DELIVERY.DETAIL.NEW_BASIC`,
                    readOnly: !editFlag,
                    __force_record_to_update__: true,
                  },
                  <Table
                    virtual
                    dataSet={basicDs}
                    columns={basicColumns}
                    style={{ maxHeight: 400 }}
                  />
                )}
              </TabPane>
              <TabPane
                tab={intl.get(`sinv.purchaserDelivery.view.message.title.otherInfo`).d('其他信息')}
                key="otherInfo"
              >
                {customizeTable(
                  {
                    code: `SINV.PURCHASER_DELIVERY.DETAIL.OTHER`,
                    readOnly: !editFlag,
                    __force_record_to_update__: true,
                  },
                  <Table
                    virtual
                    dataSet={otherDs}
                    columns={otherColumns}
                    style={{ maxHeight: 400 }}
                  />
                )}
              </TabPane>
              <TabPane
                tab={intl.get(`sinv.purchaserDelivery.view.message.title.logistics`).d('物流信息')}
                key="logistics"
              >
                <Spin dataSet={logisticsBasicDs}>
                  <div className={styles['logistics-title']}>
                    {intl.get(`sinv.common.view.message.title.basicInfo`).d('基本信息')}
                  </div>
                  <div className={editFlag ? styles['content-edit'] : styles.content}>
                    {customizeForm(
                      {
                        code: 'SINV.SUPPLIER_DELIVERY.DETAIL.LOGISTICS',
                        readOnly: !editFlag,
                        __force_record_to_update__: true,
                      },
                      <Form
                        labelLayout={editFlag ? 'float' : 'vertical'}
                        dataSet={logisticsBasicDs}
                        columns={3}
                      >
                        {logisticsBasicColumns.map((res) =>
                          editFlag ? <TextField {...res} /> : <Output {...res} />
                        )}
                      </Form>
                    )}
                  </div>

                  {/* 物流公共组件 */}
                  <LogisticsDetail {...logisticsDetailProps} />
                </Spin>
              </TabPane>
            </Tabs>
          )}
        </Content>
      </div>
    </Fragment>
  );
};

export default BasicTable;
