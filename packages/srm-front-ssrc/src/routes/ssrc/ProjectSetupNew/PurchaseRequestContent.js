/*
 * @Description:
 * @Version: 2.0
 * @Autor: wangmiao
 * @Date: 2021-10-11 14:52:46
 * @LastEditors: yiping.liu
 * @LastEditTime: 2023-02-09 15:45:06
 */
import React, { Component } from 'react';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Popover, Icon } from 'choerodon-ui';
import { DataSet, Modal, TextField } from 'choerodon-ui/pro';
import moment from 'moment';
import WithCustomizeC7N from 'srm-front-cuz/lib/c7nCustomize';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import { numberSeparatorRender } from '@/utils/renderer';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { Bind } from 'lodash-decorators';
import { getCurrentOrganizationId } from 'utils/utils';
import { getTableFixSelfAdaptStyle } from '@/utils/utils';
import PriceModalDS from './PriceModalDS.js';
import PriceModal from './PriceModal.js';
import styles from './index.less';

const organizationId = getCurrentOrganizationId();
class PurchaseRequestContent extends Component {
  constructor(props) {
    super(props);

    if (props.onRef) {
      props.onRef(this);
    }

    this.SearchBarRef = {};
    this.PriceModalDS = new DataSet(PriceModalDS());
    this.state = {
      displayPrNumOrDisplayLineNumValue: '',
    };
  }

  componentDidMount() {
    const { PurchaseRequestDS, executionLinkFlag } = this.props;
    if (executionLinkFlag) {
      PurchaseRequestDS.setQueryParameter('executionLinkFlag', executionLinkFlag);
    }
    // PurchaseRequestDS.query();
  }

  componentWillUnmount() {
    this.clearQueryParameter();
  }

  @Bind()
  handlePrice(record) {
    const modalKey = Modal.key();
    const data = record.toData();
    const priceModal = {
      supplierCompanyId: data.supplierCompanyId,
      itemId: data.itemId,
      purchaseOrgId: data.purchaseOrgId,
      companyId: data.companyId,
      ouId: data.ouId,
      invOrganizationId: data.invOrganizationId,
      uomId: data.uomId,
      prLineId: data.prLineId,
    };
    const Props = {
      PriceModalDS: this.PriceModalDS,
      priceModal,
    };
    Modal.open({
      destroyOnClose: true,
      closable: true,
      key: modalKey,
      drawer: true,
      title: intl.get(`ssrc.inquiryHall.model.inquiryHall.mReferencePrice`).d('物料参考价格'),
      children: <PriceModal {...Props} />,
      style: { width: '60%' },
      okCancel: false,
      okText: intl.get(`ssrc.inquiryHall.model.inquiryHall.closed`).d('关闭'),
    });
  }

  @Bind()
  getColumns() {
    const { doubleUnitFlag, history, remote } = this.props;
    const columns = [
      {
        name: 'displayPrNumOrDisplayLineNum',
        width: 230,
        renderer: ({ record }) => {
          return (
            <>
              {record.get('displayPrNum')}-{record.get('displayLineNum')}
              {record.get('urgentFlag') && Number(record.get('urgentFlag')) ? (
                <Icon type="flash_on" className={styles['row-agent-column-icon']} />
              ) : null}
            </>
          );
        },
      },
      {
        name: 'itemCode',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'referencePrice',
        width: 90,
        renderer: ({ record }) => {
          const { itemCode, referencePriceDisplayFlag } = record.toData();
          if (itemCode && referencePriceDisplayFlag) {
            return (
              <a onClick={() => this.handlePrice(record)}>
                {intl.get('ssrc.inquiryHall.model.inquiryHall.referencePr').d('参考价格')}
              </a>
            );
          }
        },
      },
      {
        name: 'commonName',
        width: 150,
      },
      {
        name: 'categoryName',
        width: 100,
      },
      {
        name: 'companyName',
        width: 150,
      },
      {
        name: 'ouName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 130,
      },
      doubleUnitFlag
        ? {
            name: 'secondaryQuantity',
            width: 80,
            align: 'right',
            renderer: ({ value }) => numberSeparatorRender(value),
          }
        : null,
      {
        name: 'occupiedQuantity',
        width: 140,
        align: 'right',
        renderer: ({ value, record }) =>
          doubleUnitFlag
            ? numberSeparatorRender(record?.get('secondaryOccupiedQuantity'))
            : numberSeparatorRender(value),
      },
      doubleUnitFlag
        ? {
            name: 'secondaryUomName',
            width: 80,
          }
        : null,
      {
        name: 'quantity',
        width: 100,
        align: 'right',
        renderer: ({ value }) => numberSeparatorRender(value),
      },
      {
        name: 'uomName',
        width: 100,
      },
      {
        name: 'currencyCode',
        width: 80,
      },
      {
        name: 'neededDate',
        width: 120,
        renderer: ({ value }) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'prRequestedName',
        width: 130,
      },
      {
        name: 'executorName',
        width: 100,
      },
      {
        name: 'purchaseAgentName',
        width: 100,
      },
      {
        name: 'unitName',
        width: 120,
      },
      {
        name: 'requestDate',
        width: 170,
        renderer: ({ value }) => value && moment(value).format(DEFAULT_DATE_FORMAT),
      },
      {
        name: 'remark',
        width: 200,
      },
      {
        name: 'prSourcePlatformMeaning',
        width: 130,
      },
      {
        name: 'assignedDate',
        width: 170,
      },
      {
        name: 'drawingNum',
        width: 130,
      },
      {
        name: 'drawingVersion',
        width: 120,
      },
      {
        name: 'surfaceTreatFlag',
        width: 120,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'supplierItemCode',
        width: 120,
      },
      {
        name: 'supplierItemNumDesc',
        width: 120,
      },
      {
        name: 'projectCategoryMeaning',
        width: 150,
      },
      {
        name: 'prTypeName',
        width: 150,
      },
      {
        name: 'attachmentUuid',
        width: 140,
      },
      {
        name: 'headerRemark',
        width: 200,
        renderer: ({ value }) =>
          value ? (
            <Popover placement="topLeft" content={value}>
              {value}
            </Popover>
          ) : (
            ''
          ),
      },
      {
        name: 'supplierCompanyName',
        width: 180,
      },
    ].filter(Boolean);
    return remote ? remote.process('SSRC.PROJECT_SETUP_NEW_CUX_COLUMNS', columns, { doubleUnitFlag, history }): columns;
  }

  @Bind()
  leftInput(ds) {
    const { PurchaseRequestDS } = this.props;
    const { displayPrNumOrDisplayLineNumValue } = this.state;

    return (
      <TextField
        style={{ width: '260px' }}
        placeholder={
          <span style={{ color: 'rgba(0, 0, 0, 0.65)' }}>
            {intl
              .get('ssrc.inquiryHall.model.inquiryHall.purchaseRequestQuestion')
              .d('请输入申请编号，申请编号-行号查询')}
          </span>
        }
        prefix={<Icon type="search" style={{ marginLeft: '5px' }} />}
        value={displayPrNumOrDisplayLineNumValue}
        dataSet={ds}
        name="multiSelectHeaderAndLineNums"
        valueChangeAction="blur"
        onChange={(val) => {
          const searchValue = val
            ? val.map((ele) => ele.trim().replace(/\s+/g, ',')).join(',')
            : undefined;
          // eslint-disable-next-line no-unused-expressions
          ds?.current?.set({
            multiSelectHeaderAndLineNums: val
              ? val
                  .map((ele) => ele.trim().replace(/\s+/g, ','))
                  .join(',')
                  .split(',')
              : undefined,
          });
          this.setState({ displayPrNumOrDisplayLineNumValue: val });
          PurchaseRequestDS.setQueryParameter('multiSelectHeaderAndLineNums', searchValue);
        }}
        multiple
        clearButton
      />
    );
  }

  @Bind()
  searchBlur() {
    const { PurchaseRequestDS } = this.props;
    PurchaseRequestDS.query();
  }

  @Bind()
  clearQueryParameter() {
    const { PurchaseRequestDS } = this.props;
    this.setState({ displayPrNumOrDisplayLineNumValue: '' });
    PurchaseRequestDS.setQueryParameter('multiSelectHeaderAndLineNums', '');
  }

  render() {
    const { PurchaseRequestDS, customizeTable, tableStyle = {} } = this.props;

    const tableStyleNew = {
      ...getTableFixSelfAdaptStyle()?.searchBarTableMaxHeight,
      ...(tableStyle || {}),
    };

    return (
      <React.Fragment>
        {customizeTable(
          { code: `SSRC.PROJECT_SETUP.APPLY_TO_PROJECT_NEW.LIST` },
          <SearchBarTable
            searchCode="SSRC.PROJECT_SETUP.APPLY_TO_PROJECT_NEW.FILTER"
            dataSet={PurchaseRequestDS}
            columns={this.getColumns()}
            style={tableStyleNew}
            searchBarConfig={{
              left: {
                render: (_, ds) => this.leftInput(ds),
              },
              fieldProps: {
                executorBys: {
                  lovCode: 'SSLM.KPI_USER',
                  lovPara: { tenantId: organizationId },
                },
              },
              onReset: this.clearQueryParameter,
              onClear: this.clearQueryParameter,
            }}
          />
        )}
      </React.Fragment>
    );
  }
}

export default WithCustomizeC7N({
  unitCode: [
    'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT_NEW.LIST',
    'SSRC.PROJECT_SETUP.APPLY_TO_PROJECT_NEW.FILTER',
  ],
})(PurchaseRequestContent);
