import { connect } from 'dva';
import { Button, DataSet, Modal, Table } from 'choerodon-ui/pro';
import { Tag } from 'choerodon-ui';
import React, { Fragment } from 'react';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import { compose } from 'lodash';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { Header, Content } from 'components/Page';
import withProps from 'utils/withProps';
import { SRM_FINANCE } from '_utils/config';
import formatterCollections from 'utils/intl/formatterCollections';
import { getCurrentOrganizationId, getResponse, filterNullValueObject } from 'utils/utils';
import FilterBarTable from '_components/FilterBarTable';


import { wholeDs, linkInvoiceDs, repush } from './store.js';


const Index = ({ lineDs }) => {

    const lineColumns = [
        { name: 'displayTrxNumAndLineNum' },
        {
            name: 'trxQuantity',
            renderer: ({ value, record }) => {
                const invoiceOccupiedQuantity = record?.get('invoiceOccupiedQuantity');
                return Math.abs(value) < Math.abs((invoiceOccupiedQuantity || 0)) ? <span style={{ color: 'red' }}>{value}</span> : value;
            },
        },
        {
            name: 'invoiceOccupiedQuantity',
            renderer: ({ value, record }) => {
                const trxQuantity = record?.get('trxQuantity');
                return Math.abs(trxQuantity) < Math.abs((value || 0)) ? <span style={{ color: 'red' }}>{value}</span> : value;
            },
        },
        { name: 'trxDate' },
        { name: 'displayPoNumAndLineNum' },
        { name: 'linkInvoiceModal', renderer: ({ record, dataSet }) => <a onClick={() => handleLookInvoice({ record, dataSet })}>{intl.get('hzero.common.buttonhzero.common.button.look').d('查看')}</a> },
    ];

    const invoiceDetailCols = [
        { name: 'invoiceNumAndLineNum' },
        { name: 'invoiceStatus' },
        { name: 'quantity' },
        {
            name: 'pushUpstreamStatus',
            width: 200,
            renderer: ({ value, record, dataSet }) => {
                return value ? (
                    <div>
                        <Tag
                            color={['SYNC_FAILURE', 'UNSYNCHRONIZED'].includes(value) ? 'red' : 'green'}
                            style={{
                                height: 'auto',
                                lineHeight: '15px',
                                marginLeft: '4px',
                                border: 'none',
                            }}
                        >{record?.get('pushUpstreamStatusMeaning')}
                        </Tag>
                        {['SYNC_FAILURE', 'UNSYNCHRONIZED'].includes(value) ? (
                            <Button
                                type="text"
                                funcType="link"
                                style={{ marginLeft: 0, marginRight: 16 }}
                                onClick={() => handleRePush({ record, dataSet })}
                            >{intl.get('sfin.invoiceBill.model.invoiceBill.repush').d('重推')}
                            </Button>
                        ) : <></>}
                    </div>
                ) : null;

            },
        },
        { name: 'pushUpstreamRemark' },
    ];

    const handleRePush = async ({ record, dataSet }) => {
        const data = record?.toData();
        const res = await (getResponse(repush(data)));
        if (res) {
            dataSet.query();
        }
    };

    const handleLookInvoice = ({ record }) => {
        const rcvTrxLineId = record.get('rcvTrxLineId');
        const invoiceDetailDs = new DataSet(linkInvoiceDs({ rcvTrxLineId }));
        Modal.open({
            drawer: true,
            key: 'errorMessage',
            destroyOnClose: true,
            style: { width: 780 },
            closable: true,
            title: intl.get(`sfin.invoiceBill.model.invoiceBill.linkInvoiceModal`).d('发票关联信息'),
            children: <Table columns={invoiceDetailCols} dataSet={invoiceDetailDs} />,
            okCancel: false,
            okText: intl.get('hzero.common.button.close').d('关闭'),

        });
    };

    const getQueryFrom = () => {
        const { selected = [] } = lineDs || {};
        if (selected?.length > 0) {
            const rcvTrxLineIdList = selected?.map((ele) => ele.get('rcvTrxLineId'));
            return { rcvTrxLineIdList };
        } else {
            const queryData = lineDs.queryDataSet.current.toJSONData();
            const { __dirty, __id, _status, trxDate, ...others } = queryData;
            const [trxDateStart, trxDateEnd] = trxDate?.split(',') || [];
            return filterNullValueObject({ trxDate: null, trxDateStart, trxDateEnd, ...(others || {}) });
            // customizeUnitCode: 'SIEC.PROJECT_LIST.SEARCH,SIEC.PROJECT_LIST.LIST',
            // exportSearchbarUnitCode: 'SIEC.PROJECT_LIST.SEARCH,SIEC.PROJECT_LIST.LIST',
        };
    };

    const HeaderBtn = observer(() => {
        const { selected = [] } = lineDs;
        const headerButtons = [
            {
                name: 'exportNew',
                noNest: true,
                child: (text) => (
                    <ExcelExportPro
                        data-name="exportNew"
                        {...{
                            templateCode: 'SRM_SFIN_INVOICE_MONITOR_EXPORT',
                            wait: 300,
                            buttonText:
                                text ||
                                (selected?.length > 0
                                    ? intl.get('hzero.common.button.selectedExport').d('勾选导出')
                                    : intl.get('hzero.common.export.new').d('导出')),
                            requestUrl: `${SRM_FINANCE}/v1/${getCurrentOrganizationId()}/invoice-monitor/export`,
                            method: 'POST',
                            allBody: true,
                            queryParams: () => getQueryFrom(true),
                            otherButtonProps: {
                                type: 'c7n-pro',
                                funcType: 'flat',
                            },
                        }}
                    />
                ),
            },
        ];
        return (<DynamicButtons buttons={headerButtons} />);
    }, []);


    return (
        <Fragment>
            <Header
                title={intl.get('sprm.forecastMgt.model.common.forecastMgtTempDef').d('预测管理模板定义')}
            >
                <HeaderBtn />
            </Header>
            <Content>
                <FilterBarTable
                    style={{ maxHeight: 'calc(100vh - 190px)' }}
                    dataSet={lineDs}
                    columns={lineColumns}
                    cacheState
                />
            </Content>
        </Fragment>
    );
};

export default compose(
    connect(() => ({})),
    formatterCollections({
        code: [
            'sfin.invoiceBill',
            'sfin.payment',
        ],
    }),
    withProps(
        () => {
            const lineDs = new DataSet(wholeDs());
            return {
                lineDs,
            };
        },
        { cacheState: true }
    )
)(Index);
