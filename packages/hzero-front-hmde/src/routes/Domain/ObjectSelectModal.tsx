import React, { useEffect, useMemo } from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';
import { ObjectSelectDS } from '@/stores/Domain/ObjectSelectDS';
import { TableQueryBarType } from 'choerodon-ui/pro/lib/table/enum';
import { Observer } from 'mobx-react-lite';
import MoveButton from '@/routes/Modeler/component/MoveButton';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';

const { Column } = Table;
interface IProps {
  flag?: boolean;
  domainId?: string;
  selectedDS?: any;
  domainCode?: string;
}
export default (props: IProps) => {
  const { flag, selectedDS, domainId } = props;

  const selectDS: DataSet = useMemo(
    () => new DataSet(ObjectSelectDS(domainId, flag, selectedDS) as DataSetProps),
    [flag]
  );

  useEffect(() => {
    selectDS.query();
  }, []);

  const addObject = () => {
    selectDS.selected.forEach((record) => {
      selectedDS.create(record.toData());
      Object.assign(record, { selectable: false });
    });
  };

  const removeObject = () => {
    selectedDS.selected.forEach((record) => {
      selectedDS.remove(record);
    });
    selectDS.query();
  };

  return (
    <div style={{ display: 'flex', height: '600px', width: '100%' }}>
      <div style={{ height: '100%' }}>
        <span style={{ fontSize: 14, fontWeight: 800 }}>业务对象</span>
        <Table dataSet={selectDS} showRemovedRow={false} queryBar={TableQueryBarType.filterBar}>
          <Column name="businessObjectName" />
          <Column name="businessObjectCode" />
          <Column name="remark" />
        </Table>
      </div>
      <div style={{ alignItems: 'center', display: 'flex' }}>
        <div>
          <span
            onClick={() => {
              addObject();
            }}
          >
            <Observer>
              {() => <MoveButton selectedLength={selectDS.selected.length} direction="left" />}
            </Observer>
            {/* </Tooltip> */}
          </span>
          <span
            style={{ marginTop: '3px' }}
            onClick={() => {
              removeObject();
            }}
          >
            <Observer>
              {() => <MoveButton selectedLength={selectedDS.selected.length} direction="right" />}
            </Observer>
          </span>
        </div>
      </div>
      <div style={{ height: '100%' }}>
        <span style={{ fontSize: 14, fontWeight: 800 }}>
          {flag ? '允许更新的业务对象' : '不允许更新的业务对象'}
        </span>
        <Table dataSet={selectedDS} showRemovedRow={false}>
          <Column name="businessObjectName" />
          <Column name="businessObjectCode" />
          <Column name="remark" />
        </Table>
      </div>
    </div>
  );
};
