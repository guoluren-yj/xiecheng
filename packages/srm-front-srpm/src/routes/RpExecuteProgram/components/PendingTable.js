import React, { PureComponent } from 'react';
// import { Table } from 'choerodon-ui/pro';
// import { queryMergeList } from '@/services/rpExecuteProgramService';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { Lov, Button } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { observer } from 'mobx-react-lite';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import styles from '../index.less';

const commonPrompt = 'srpm.common.model.common';

function nodeCover({ record }) {
  const nodeProps = {
    title: record.get('vtNum'),
  };
  if (record.get('mergeFlag') || record.get('beSplitFlag')) {
    nodeProps.isLeaf = false;
  } else {
    nodeProps.isLeaf = true;
  }
  return nodeProps;
}

export default class PendingTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = { mountFlag: true, btnLoading: false };
  }

  handleLoadData = ({ record, dataSet }) => {
    const { appendQuery, unitCode, searchCode } = this.props;
    const { children, data = {} } = record;
    const vtLineId = data?.vtLineId ?? '';
    return new Promise(resolve => {
      if (!children) {
        appendQuery({ vtLineId, customizeUnitCode: `${unitCode},${searchCode}` })
          .then(res => {
            if (res && !res.failed) {
              // res.forEach(item => {
              //   // eslint-disable-next-line no-param-reassign
              //   item.parentVtLineId = vtLineId;
              // });

              dataSet.appendData(res, record);
              dataSet.forEach(item => {
                if (item && item.get('parentVtLineId')) {
                  // eslint-disable-next-line no-param-reassign
                  item.selectable = false;
                }
              });
            }
            resolve();
          })
          .catch(() => {
            resolve();
          });
      } else {
        resolve();
      }
    });
  };

  onQuery = (props = {}) => {
    const { mountFlag } = this.state;
    const { search = () => {} } = this.props;
    search(props, mountFlag);
    // search(props);
    this.setState({ mountFlag: false, btnLoading: false });
  };

  resetQueryDs = () => {
    const { tableDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current?.reset();
  };

  setModalBtnLoading = flag => {
    this.setState({
      btnLoading: flag,
    });
  };

  render() {
    const {
      tableDs,
      columns,
      customizeTable,
      unitCode,
      searchCode,
      lovDs,
      searchTextField,
      searchPlaceholder,
      modalFlag,
      BalanceSplitBtn,
      remote,
    } = this.props;
    const { btnLoading } = this.state;
    const SubmitBtn = observer(({ loading }) => {
      const { vtLineIds, handleBalanceModalBtn } = this.props;
      return (
        <Button
          key="submit"
          funcType="flat"
          icon="done"
          loading={loading}
          disabled={tableDs.selected?.length === 0}
          onClick={() => {
            this.setState({ btnLoading: true }, () => {
              handleBalanceModalBtn('submit', tableDs, vtLineIds, this.setModalBtnLoading).then(
                () => {
                  this.setState({ btnLoading: false });
                }
              );
            });
          }}
        >
          {intl.get(`${commonPrompt}.submitForApproval`).d('提交审批')}
        </Button>
      );
    });
    const SaveBtn = observer(({ loading }) => {
      const { vtLineIds, handleBalanceModalBtn } = this.props;
      return (
        <Button
          key="finish"
          funcType="flat"
          icon="done"
          loading={loading}
          disabled={tableDs.selected?.length === 0}
          onClick={() => {
            this.setState({ btnLoading: true }, () => {
              handleBalanceModalBtn('save', tableDs, vtLineIds, this.setModalBtnLoading).then(
                () => {
                  this.setState({ btnLoading: false });
                }
              );
            });
          }}
        >
          {intl.get(`${commonPrompt}.finish`).d('完成')}
        </Button>
      );
    });
    const buttons =
      modalFlag === 1
        ? [<SubmitBtn loading={btnLoading} />, <SaveBtn loading={btnLoading} />]
        : [<BalanceSplitBtn dataSet={tableDs} />];

    // 二开埋点：支持添加自定义按钮
    const cuxButtons = remote
      ? remote.process('SRPM_RP_EXECUTE_PLATFORM_BALANCE_MODAL_BTNS', buttons, {
          modalFlag,
          tableDs,
          setModalBtnLoading: this.setModalBtnLoading,
        })
      : buttons;

    const searchBarConfig = lovDs
      ? {
          left: {
            render: () => (
              <>
                <Lov
                  dataSet={lovDs}
                  name="containerLov"
                  viewMode="popup"
                  showValidation="tooltip"
                  className="srpm-lov-search"
                  placeholder={intl.get(`${commonPrompt}.container`).d('需求计划编码')}
                  searchFieldProps={{ multiple: false }}
                />

                <div
                  className="c7n-divider c7n-divider-vertical"
                  style={{ background: 'rgb(204, 204, 204)' }}
                />

                <MutlTextFieldSearch
                  name={searchTextField}
                  handleQuery={this.onQuery}
                  dataSet={tableDs}
                  placeholder={searchPlaceholder}
                />
              </>
            ),
          },
          // onQuery: search ? this.onQuery : tableDs.query(),
          onQuery: this.onQuery,
          onClear: this.resetQueryDs,
          onReset: this.resetQueryDs,
        }
      : {
          closeFilterSelector: true,
          checkDataSetStatus: false,
        };
    return (
      <div style={{ height: lovDs ? 'calc(100vh - 252px)' : 'calc(100vh - 180px)' }}>
        {customizeTable(
          {
            code: unitCode,
            dataSet: tableDs,
          },

          // isBalanceModal ? (
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            className={styles.pendingTable}
            searchCode={searchCode}
            dataSet={tableDs}
            columns={columns}
            mode="tree"
            treeLoadData={this.handleLoadData}
            onRow={nodeCover}
            buttons={modalFlag ? cuxButtons : []}
            // showAllPageSelectionButton
            searchBarConfig={searchBarConfig}
          />
        )}
      </div>
    );
  }
}
