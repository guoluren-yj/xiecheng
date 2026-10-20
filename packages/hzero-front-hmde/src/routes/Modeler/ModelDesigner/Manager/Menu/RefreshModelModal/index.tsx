/* eslint-disable no-nested-ternary */
import React, { useMemo, useEffect, FC } from 'react';
import { Table, DataSet, Icon } from 'choerodon-ui/pro';
import globalStyles from '@/lowcodeGlobalStyles/global.less';
import { Collapse } from 'choerodon-ui';
import { observer } from 'mobx-react-lite';
import { reaction } from 'mobx';
import { ColumnLock, ColumnAlign, TableColumnTooltip } from 'choerodon-ui/pro/lib/table/enum';

import styles from './index.less';
import RefreshModelDataSet from './store/RefreshModelDataSet';

const { Column } = Table;
const { Panel } = Collapse;

// 查看，空属性改为 -
const objNullToFill = (
  list: (model.SyncModelFailedVO | model.SyncModelWarningVO | model.SyncModelSuccessVO)[]
) => {
  if (!list || !Array.isArray(list)) return list;
  return list.map((item) => {
    Object.keys(item).forEach((key) => {
      // eslint-disable-next-line no-param-reassign
      item[key] = item[key] === null ? '/' : item[key];
    });
    return item;
  });
};
// 如果是1 - 是 0 - 否 null - ‘/’
const rendererFlag = ({ value }) => (value === 1 ? '是' : value === 0 ? '否' : '/');
interface IIndex {
  responseData: model.SyncModelResultVO;
  setWarningSelectedList: any;
  refreshModalClose: any;
}
const Index: FC<IIndex> = observer(
  ({ responseData, setWarningSelectedList, refreshModalClose = () => {} }) => {
    interface IResponseData {
      tableErrorMsg: string;
      noChangeSuccessMsg: string;
      statusList: string[];
      syncModelFailedList: model.SyncModelFailedVO[];
      syncModelWarningList: model.SyncModelWarningVO[];
      syncModelSuccessList: model.SyncModelSuccessVO[];
    }
    const {
      tableErrorMsg = '',
      noChangeSuccessMsg = '',
      statusList = [],
      syncModelFailedList = [],
      syncModelWarningList = [],
      syncModelSuccessList = [],
    }: IResponseData = responseData;
    const errorDs: DataSet = useMemo(
      () => new DataSet(RefreshModelDataSet(objNullToFill(syncModelFailedList))),
      []
    );
    const warningDs: DataSet = useMemo(
      () => new DataSet(RefreshModelDataSet(objNullToFill(syncModelWarningList), 'multiple')),
      []
    );
    const succeedDs: DataSet = useMemo(
      () => new DataSet(RefreshModelDataSet(objNullToFill(syncModelSuccessList))),
      []
    );
    useEffect(() => {
      reaction(
        () => warningDs.selected.length,
        () => {
          setWarningSelectedList(warningDs.selected);
        }
      );
    }, []);
    return (
      <div
        className={`${globalStyles['model-body']} ${styles['refresh-model']} ${styles['merge-collapse']}`}
      >
        <Collapse defaultActiveKey={['1', '2', '3']}>
          {statusList.includes('error') && (
            <Panel
              header={
                <span className={styles['panel-header']}>
                  <Icon type="cancel" style={{ color: '#FF4141' }} />
                  <span>失败</span>
                </span>
              }
              key="1"
              showArrow={false}
            >
              {tableErrorMsg ? (
                <div>
                  <p>{tableErrorMsg}</p>
                </div>
              ) : (
                <div>
                  <p>
                    检测到当前以下列表字段在物理模型表与逻辑模型中属性存在冲突，导致列表内字段失效，
                    <a onClick={() => refreshModalClose()}>请返回修改！</a>
                  </p>
                  <Table
                    pagination={false}
                    // rowHeight={20}
                    rowHeight={30}
                    dataSet={errorDs}
                    className={styles['merge-table']}
                  >
                    <Column name="fieldName" lock={ColumnLock.left} width={120} />
                    <Column
                      name="existFlag"
                      renderer={({ value }) => (value === 1 ? '是' : '否')}
                      width={100}
                    />
                    <Column header="数据类型">
                      <Column name="tableDataType" />
                      <Column name="modelDataType" />
                    </Column>
                    {/* <Column header="是否必输">
                      <Column
                        name="tableRequiredFlag"
                        renderer={rendererFlag}
                        width={100}
                         align={ColumnAlign.left}
                      />
                      <Column
                        name="modelRequiredFlag"
                        renderer={rendererFlag}
                        width={100}
                         align={ColumnAlign.left}
                      />
                    </Column> */}
                    <Column header="最大长度">
                      <Column name="tableDataSize" align={ColumnAlign.left} />
                      <Column name="modelDataSize" align={ColumnAlign.left} />
                    </Column>
                  </Table>
                </div>
              )}
            </Panel>
          )}
          {statusList.includes('warning') && (
            <Panel
              header={
                <span className={styles['panel-header']}>
                  <Icon type="info" style={{ color: '#FFCB3F' }} />
                  <span>警告</span>
                </span>
              }
              key="2"
              showArrow={false}
            >
              <div>
                <p>检测到当前以下列表字段在物理模型表与逻辑模型中属性存在如下差异：</p>
                <p>
                  继续同步可能会影响逻辑模型的相关功能使用，
                  <a onClick={() => refreshModalClose()}>
                    您要继续同步吗？如需同步，请选择字段并点击“确定”。
                  </a>
                </p>
                <Table
                  pagination={false}
                  // rowHeight={20}
                  rowHeight={30}
                  dataSet={warningDs}
                  className={styles['merge-table']}
                >
                  <Column
                    tooltip={TableColumnTooltip.overflow}
                    name="fieldName"
                    lock={ColumnLock.left}
                    width={140}
                  />
                  <Column header="数据类型" align={ColumnAlign.center}>
                    <Column
                      name="tableDataType"
                      tooltip={TableColumnTooltip.overflow}
                      width={100}
                      align={ColumnAlign.center}
                    />
                    <Column
                      name="modelDataType"
                      tooltip={TableColumnTooltip.overflow}
                      width={100}
                      align={ColumnAlign.center}
                    />
                  </Column>
                  <Column header="是否必输" align={ColumnAlign.center}>
                    <Column
                      name="tableRequiredFlag"
                      renderer={rendererFlag as any}
                      width={100}
                      align={ColumnAlign.center}
                    />
                    <Column
                      name="modelRequiredFlag"
                      width={100}
                      renderer={rendererFlag as any}
                      align={ColumnAlign.center}
                    />
                  </Column>
                  <Column header="最大长度" align={ColumnAlign.center}>
                    <Column name="tableDataSize" width={100} align={ColumnAlign.center} />
                    <Column name="modelDataSize" width={100} align={ColumnAlign.center} />
                  </Column>
                  <Column header="字段说明" align={ColumnAlign.center}>
                    <Column
                      name="tableDescription"
                      tooltip={TableColumnTooltip.overflow}
                      width={140}
                      align={ColumnAlign.center}
                    />
                    <Column
                      name="modelDescription"
                      tooltip={TableColumnTooltip.overflow}
                      align={ColumnAlign.center}
                    />
                  </Column>
                </Table>
              </div>
            </Panel>
          )}
          {statusList.includes('success') && (
            <Panel
              header={
                <span className={styles['panel-header']}>
                  <Icon type="check_circle" style={{ color: '#44CE6E' }} />
                  <span>成功</span>
                </span>
              }
              key="3"
              showArrow={false}
            >
              {noChangeSuccessMsg ? (
                <p>{noChangeSuccessMsg}</p>
              ) : (
                <div>
                  <p>
                    检测到当前以下列表字段在物理模型表与逻辑模型中属性存在如下差异，
                    <a onClick={() => refreshModalClose()}>信息已同步成功！</a>
                  </p>
                  <Table
                    pagination={false}
                    // rowHeight={20}
                    rowHeight={30}
                    dataSet={succeedDs}
                    className={styles['merge-table']}
                  >
                    <Column name="fieldName" lock={ColumnLock.left} width={120} />
                    <Column header="默认值">
                      <Column name="tableDefaultValue" />
                      <Column name="modelDefaultValue" />
                    </Column>
                  </Table>
                </div>
              )}
            </Panel>
          )}
        </Collapse>
      </div>
    );
  }
);
export default Index;
