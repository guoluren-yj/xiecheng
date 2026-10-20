// import moment from 'moment';
import intl from 'utils/intl';
import { SRM_FINANCE } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';

import request from 'utils/request';
import moment from 'moment';

const organizationId = getCurrentOrganizationId();

const wholeDs = () => ({
    pageSize: 20,
    fields: [
        {
            name: 'displayTrxNumAndLineNum',
            label: intl.get('sfin.invoiceBill.model.invoiceBill.trxAndLineNum').d('事务编号|行号'),
        },
        {
            name: 'trxQuantity',
            type: 'number',
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.trxQuantity`).d('事务数量'),
        },
        {
            name: 'invoiceOccupiedQuantity',
            type: 'number',
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceOccupiedQuantity`).d('发票已占用数量'),
        },
        {
            name: 'trxDate',
            type: 'dateTime',
            label: intl.get(`sfin.payment.trxDate`).d('事务日期'),
        },
        {
            name: 'displayPoNumAndLineNum',
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.poNumAndLineNum`).d('订单号|行号'),
        },
        {
            name: 'linkInvoiceModal',
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.linkInvoiceModal`).d('发票关联信息'),
        },

    ],
    queryFields: [
        {
            name: 'displayTrxNum',
            display: true,
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.displayTrxNum`).d('事务编号'),
        },
        {
            name: 'displayTrxLineNum',
            display: true,
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.displayTrxLineNum`).d('事务行号'),
        },
        {
            name: 'displayPoNum',
            display: true,
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.displayPoNum`).d('订单号'),
        },
        {
            name: 'displayPoLineNum',
            display: true,
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.displayPoLineNum`).d('订单行号'),
        },
        {
            name: 'trxDate',
            type: 'date',
            range: true,
            required: true,
            defaultValue: [moment().subtract(6, 'month'), moment()],
            display: true,
            label: intl.get(`sfin.payment.trxDate`).d('事务日期'),
        },
    ],
    transport: {
        read: ({ data }) => {
            const { trxDate } = data || {};
            const [trxDateStart, trxDateEnd] = trxDate?.split(',') || [];
            if (!trxDate) {
                return false;
            } else {
                return {
                    url: `${SRM_FINANCE}/v1/${organizationId}/invoice-monitor/page`,
                    method: 'GET',
                    data: { ...data, trxDate: null, trxDateStart, trxDateEnd },
                };
            }

        },
    },
});

const linkInvoiceDs = ({ rcvTrxLineId }) => ({
    pageSize: 20,
    selection: false,
    autoQuery: true,
    fields: [
        {
            name: 'invoiceNumAndLineNum',
            label: intl.get(`sfin.payment.invoiceNumAndLineNum`).d('SRM发票号|行号'),
        },
        {
            name: 'invoiceStatus',
            lookupCode: 'SFIN.INVOICE_STATUS',
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceStatus`).d('发票状态'),
        },
        {
            name: 'quantity',
            type: 'number',
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.invoiceQuantity`).d('本次开票数量'),
        },
        {
            name: 'pushUpstreamStatus',
            lookupCode: 'SFIN.INVOICE_SYNC_STATUS',
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.pushUpstreamStatus`).d('推送上游状态'),
        },
        {
            name: 'pushUpstreamRemark',
            label: intl.get(`sfin.invoiceBill.model.invoiceBill.pushUpstreamRemark`).d('推送上游备注'),
        },

    ],
    transport: {
        read: () => {
            return {
                url: `${SRM_FINANCE}/v1/${organizationId}/invoice-monitor/${rcvTrxLineId}`,
                method: 'GET',
            };
        },
    },
});


// 电商对账单-确认
const repush = async (data) => {
    return request(`${SRM_FINANCE}/v1/${organizationId}/invoice-monitor/cancel-re-sync`, {
        method: 'POST',
        body: data,
    });
};





export { wholeDs, linkInvoiceDs, repush };
