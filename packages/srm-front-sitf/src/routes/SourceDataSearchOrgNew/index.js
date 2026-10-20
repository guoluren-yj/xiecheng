import React, { Component, Fragment } from 'react';
import { Table, DataSet, Button, notification } from 'choerodon-ui/pro';
import { Modal } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';

import { Header, Content } from 'components/Page';
import { yesOrNoRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

import { fetchDirectlyConsume } from '@/services/sourceDataSearchService';
import { tableDs, filterFormDs } from './fieldsInitalValue';
import FilterForm from './FilterForm';
import styles from './index.less';

const { Column } = Table;

@formatterCollections({
  code: ['sitf.sourceDataSearch', 'scux.companySubAccount'],
})
export default class ReceivingWarehousingQuery extends Component {
  tableDataDs = new DataSet(tableDs());

  formDataDs = new DataSet(filterFormDs());

  componentDidMount() {
    const currentDate = new Date();
    const preDate = new Date(currentDate.setDate(currentDate.getDate() - 3));
    this.formDataDs.current.set('creationDateFrom', preDate);
    this.tableDataDs.setQueryParameter('params', {
      creationDateFrom: moment(preDate).format(DEFAULT_DATETIME_FORMAT),
    });
    this.tableDataDs.query();
  }

  @Bind()
  async handleDirectlyConsume() {
    try {
      const { selected } = this.tableDataDs;
      const filterData = selected.map((item) => item.data);
      if (!isEmpty(filterData)) {
        const newData = filterData.map((item) => ({
          mqEsInterfaceCode: item.mqEsInterfaceCode,
          mqTopic: item.mqTopic,
          messageKey: item.messageKey,
        }));
        const response = fetchDirectlyConsume(newData);
        response.then((res) => {
          if (res) {
            if (res.failed && res.message) {
              notification.warning({ message: res.message });
            } else {
              notification.success({
                message: intl.get('sitf.sourceDataSearch.view.prompt.successPrompt').d('执行成功!'),
                placement: 'bottomRight',
              });
              this.tableDataDs.query();
            }
          }
        });
      } else {
        notification.warning({
          message: intl.get('sitf.sourceDataSearch.view.prompt.selectedData').d('请先勾选数据!'),
          placement: 'bottomRight',
        });
      }
    } catch (err) {
      notification.warning({ message: err.message });
    }
  }

  @Bind()
  handleOpenModal(value) {
    Modal.info({
      title: intl.get('sitf.sourceDataSearch.model.sourceDataSearch.errorMessage').d('错误信息'),
      content: value,
      width: 800,
    });
  }

  render() {
    const filterForm = {
      formDs: this.formDataDs,
      tableDs: this.tableDataDs,
      setExportParams: this.setExportParams,
    };
    return (
      <Fragment>
        <Header title={intl.get('sitf.sourceDataSearch.view.title.head').d('源数据查询')}>
          <Button color="primary" onClick={this.handleDirectlyConsume}>
            {intl.get('sitf.sourceDataSearch.view.button.directlyConsume').d('立即执行')}
          </Button>
        </Header>
        <Content>
          <FilterForm {...filterForm} />
          <div className={styles.headerStyleSourceData}>
            <Table dataSet={this.tableDataDs}>
              <Column
                headerClassName="columnsStyleSourceData"
                header={intl.get('sitf.sourceDataSearch.model.reciveInfo').d('接收信息')}
                lock="left"
              >
                <Column name="externalSystemName" tooltip="always" />
                <Column name="mqEsInterfaceCode" tooltip="always" />
                <Column name="messageKey" width={70} tooltip="always" />
                <Column name="mqTopic" width={70} tooltip="always" />
                <Column name="mqDocNum" width={80} tooltip="always" />
                <Column name="mqBatchNum" width={70} tooltip="always" />
                <Column name="mqCreationDate" width={80} tooltip="always" />
              </Column>
              <Column
                header={intl.get('sitf.sourceDataSearch.model.consumptionInfo').d('消费信息')}
              >
                <Column name="esInterfaceCode" tooltip="always" />
                <Column name="docNum" tooltip="always" />
                <Column name="batchNum" tooltip="always" />
                <Column name="statusMeaning" tooltip="always" />
                <Column name="finishedFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Column name="errorFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Column
                  name="errorMessage"
                  renderer={({ value }) =>
                    value && (
                      <a onClick={() => this.handleOpenModal(value)}>
                        {intl
                          .get('sitf.sourceDataSearch.model.sourceDataSearch.errorMessage')
                          .d('错误信息')}
                      </a>
                    )
                  }
                />
                <Column name="dataExecuteResultMeaning" tooltip="always" />
                <Column name="confirmFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Column name="historyFlag" renderer={({ value }) => yesOrNoRender(value)} />
                <Column name="applicationGroupName" tooltip="always" />
                <Column name="applicationCodeName" tooltip="always" />
                <Column name="creationDate" width={80} tooltip="always" />
                <Column
                  header={intl.get('sitf.sourceDataSearch.model.dataDetails').d('源数据详情')}
                  renderer={({ record }) => (
                    <a
                      onClick={() => {
                        this.props.history.push(
                          `/sitf/sourcedata-search-org/detail?interfaceId=${record.data.interfaceId}&batchId=${record.data.batchId}&tenant=${record.data.tenant}&esInterfaceCode=${record.data.esInterfaceCode}`
                        );
                      }}
                    >
                      {intl
                        .get('sitf.sourceDataSearch.model.sourceDataSearch.dataDetail')
                        .d('源数据详情')}
                    </a>
                  )}
                />
              </Column>
            </Table>
          </div>
        </Content>
      </Fragment>
    );
  }
}
