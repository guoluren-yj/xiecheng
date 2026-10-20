/**
 * index - 我的收货记录-操作
 * @date: 2018-12-4
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { DataSet, Spin, Table, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import moment from 'moment';
import notification from 'utils/notification';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { isNil } from 'lodash';
import { getResponse } from 'utils/utils';
import { alingeDetail } from '../../../../services/ReceipWorkbenchService';
import { importModalDS } from './importModalDS';
import { useLineTag } from '../../util';

export const Btns = ({ record, alingeDetailLoading = false, alingeDetails = (e) => e }) => {
  // 同步发货
  const SINV_TO_SLOD_FLAG =
    !['SUCCESS', 'IMPORTING'].includes(record.get('importStatus')) ||
    (['FAIL'].includes(record.get('importStatus')) && record.get('importType') === 'SINV_TO_SLOD');
  // 同步订单
  const SINV_TO_SODR_FLAG =
    (!['SUCCESS', 'IMPORTING'].includes(record.get('importStatus')) ||
      (['FAIL'].includes(record.get('importStatus')) &&
        record.get('importType') === 'SINV_TO_SODR')) &&
    record?.get('slodImportStatus') !== 'FAIL';
  if (record.get('importType') === 'SINV_TO_SLOD') {
    if (SINV_TO_SLOD_FLAG) {
      return (
        <Button
          loading={alingeDetailLoading}
          funcType="link"
          onClick={() => alingeDetails(record?.toData())}
        >
          {intl.get(`sinv.common.model.common.alinge`).d('重新执行')}
        </Button>
      );
    } else {
      return intl.get(`sinv.common.model.common.alinge`).d('重新执行');
    }
  } else if (record.get('importType') === 'SINV_TO_SODR') {
    if (SINV_TO_SODR_FLAG) {
      return (
        <Button
          loading={alingeDetailLoading}
          funcType="link"
          onClick={() => alingeDetails(record?.toData())}
        >
          {intl.get(`sinv.common.model.common.alinge`).d('重新执行')}
        </Button>
      );
    } else {
      return intl.get(`sinv.common.model.common.alinge`).d('重新执行');
    }
  } else {
    if (!['SUCCESS', 'IMPORTING'].includes(record.get('importStatus'))) {
      return (
        <Button
          loading={alingeDetailLoading}
          funcType="link"
          onClick={() => alingeDetails(record?.toData())}
        >
          {intl.get(`sinv.common.model.common.alinge`).d('重新执行')}
        </Button>
      );
    }
    return intl.get(`sinv.common.model.common.alinge`).d('重新执行');
  }
};

export default class ImportModal extends PureComponent {
  constructor(props) {
    super(props);
    this.handleClose = this.handleClose.bind(this);
    this.handleSearch = this.handleSearch.bind(this);
    this.alingeDetailChange = this.alingeDetailChange.bind(this);
  }

  tableDs = new DataSet(importModalDS());

  state = {
    alingeDetailLoading: false,
  };

  componentDidMount() {
    this.handleSearch();
  }

  handleSearch(page = {}) {
    const { id, headerId } = this.props;
    this.tableDs.setQueryParameter('params', { id, headerId, ...page });
    this.setState({ alingeDetailLoading: true });
    this.tableDs.query().then((res) => {
      if (res && !res.failed) {
        this.setState({ alingeDetailLoading: false });
      }
    });
  }

  handleClose() {
    const { close = (e) => e } = this.props;
    close();
  }

  alingeDetailChange(record) {
    const { id, headerId } = this.props;
    if (!isNil(id) && !isNil(headerId)) {
      this.setState({ alingeDetailLoading: true });
      alingeDetail({ headerId, id, record }).then((res) => {
        this.setState({ alingeDetailLoading: false });
        if (getResponse(res)) {
          if (res.type === 'error') return notification.error({ message: res?.message });
          if (res) {
            const newData = this.tableDs.data.map((i) =>
              i.get('recordId') === res.recordId ? res : i
            );
            this.tableDs.loadData(newData, this.tableDs.currentPage);
          }
        }
      });
    }
  }

  getColumns = () => {
    return [
      {
        name: 'importTypeMeaning',
        width: 100,
      },
      {
        name: 'importStatusMeaning',
        width: 100,
        renderer: ({ record }) => useLineTag(record),
      },
      {
        name: 'externalSystemCode',
        width: 140,
      },
      {
        name: 'importMessage',
        width: 140,
      },
      {
        name: 'lastUpdateDate',
        width: 150,
        renderer: ({ value }) => (value ? moment(value).format(DEFAULT_DATETIME_FORMAT) : null),
      },
      {
        name: 'lastUpdatedName',
        width: 100,
      },
      {
        name: 'button',
        // renderer: ({ record }) =>
        //   !['SUCCESS', 'IMPORTING'].includes(record.get('importStatus')) ||
        //   (['FAIL'].includes(record.get('importStatus')) &&
        //     (record.get('importType') === 'SINV_TO_SLOD' ||
        //       record.get('importType') === 'SINV_TO_SODR')) ? (
        //         <Button
        //           loading={this.state.alingeDetailLoading}
        //           funcType="link"
        //           onClick={this.alingeDetailChange.bind(this, record.toData())}
        //         >
        //           {intl.get(`sinv.common.model.common.alinge`).d('重新执行')}
        //         </Button>
        //   ) : (
        //     intl.get(`sinv.common.model.common.alinge`).d('重新执行')
        // ),
        renderer: ({ record }) => (
          <Btns
            record={record}
            // dataSet={dataSet}
            alingeDetailLoading={this.state.alingeDetailLoading}
            alingeDetails={this.alingeDetailChange}
          />
        ),
      },
    ];
  };

  render() {
    const { alingeDetailLoading = false } = this.state;
    const tableProps = {
      columns: this.getColumns(),
      dataSet: this.tableDs,
      // spin: {
      //   spinning: alingeDetailLoading,
      // },
    };

    return (
      <Spin spinning={alingeDetailLoading || false}>
        <Table {...tableProps} customizable customizedCode="receipt-all-workbench" />
      </Spin>
    );
  }
}
