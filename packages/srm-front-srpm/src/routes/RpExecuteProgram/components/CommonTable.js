/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-12-22 15:41:28
 * @LastEditors: yanglin
 * @LastEditTime: 2022-10-10 17:56:18
 */
import React, { PureComponent } from 'react';
// import { Table } from 'choerodon-ui/pro';
import { Lov } from 'choerodon-ui/pro';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import intl from 'utils/intl';
import MutlTextFieldSearch from '@/routes/components/MutlTextFieldSearch';
import style from '../index.less';

const commonPrompt = 'srpm.common.model.common';

export default class TodoTable extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      mountFlag: true,
    };
  }

  // leftRender=()=> {
  //   const { lovDs, handleChangeLov } = this.props;
  //   return (
  //     <Lov
  //       dataSet={lovDs}
  //       name="containerLov"
  //       viewMode="popup"
  //       placeholder={intl.get(`${commonPrompt}.container`).d('需求计划编码')}
  //       onChange={handleChangeLov}
  //     />
  //   );
  // }

  onQuery = (props = {}) => {
    const { mountFlag } = this.state;
    const { search = () => {} } = this.props;
    search(props, mountFlag);
    // search(props);
    this.setState({ mountFlag: false });
  };

  resetQueryDs = () => {
    const { tableDs } = this.props;
    // eslint-disable-next-line no-unused-expressions
    tableDs.queryDataSet?.current?.reset();
  };

  render() {
    const {
      tableDs,
      columns,
      code,
      searchCode,
      customizeTable,
      lovDs,
      searchTextField,
      searchPlaceholder,
      // handleChangeLov,
      showRightConfig,
      handleChangeSubmittedTableStatus,
      submittedTableStatus,
      modalFlag,
      BalanceSplitBtn,
      ...otherParams
    } = this.props;
    return (
      <div style={{ height: 'calc(100vh - 252px)' }}>
        {customizeTable(
          {
            code,
            dataSet: tableDs,
          },
          <SearchBarTable
            style={{ maxHeight: `calc(100% - 22px)` }}
            searchCode={searchCode}
            dataSet={tableDs}
            columns={columns}
            buttons={modalFlag ? [<BalanceSplitBtn dataSet={tableDs} />] : []}
            // showAllPageSelectionButton
            {...otherParams}
            searchBarConfig={
              lovDs
                ? {
                    left: {
                      render: () => (
                        <>
                          <Lov
                            dataSet={lovDs}
                            name="containerLov"
                            viewMode="popup"
                            className="srpm-lov-search"
                            showValidation="tooltip"
                            placeholder={intl.get(`${commonPrompt}.container`).d('需求计划编码')}
                            // onChange={handleChangeLov}
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
                    right: !showRightConfig
                      ? {}
                      : {
                          render: () => (
                            <div className={style.addRightSearch}>
                              <div
                                className={
                                  submittedTableStatus === 'header' ? 'active' : 'change-table'
                                }
                                onClick={() => handleChangeSubmittedTableStatus('header')}
                              >
                                <span>
                                  {intl.get(`${commonPrompt}.approvalHeader`).d('审批中计划单')}
                                </span>
                              </div>
                              <div
                                className={
                                  submittedTableStatus !== 'header' ? 'active' : 'change-table'
                                }
                                onClick={() => handleChangeSubmittedTableStatus('line')}
                              >
                                <span>
                                  {intl.get(`${commonPrompt}.approvalLine`).d('审批中计划行')}
                                </span>
                              </div>
                            </div>
                          ),
                        },
                    onQuery: this.onQuery,
                    onClear: this.resetQueryDs,
                    onReset: this.resetQueryDs,
                  }
                : {
                    closeFilterSelector: true,
                  }
            }
          />
        )}
      </div>
    );
  }
}
