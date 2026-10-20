/* eslint-disable react/jsx-props-no-spreading */
import React, { useRef, useState, useMemo, FC } from 'react';
import { DataSet, Icon, Select, Form, SelectBox, Spin } from 'choerodon-ui/pro';
import { Row, Col } from 'choerodon-ui';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { ShowHelp } from 'choerodon-ui/pro/lib/field/enum';
import { isTenantRoleLevel } from 'utils/utils';
import { runInAction } from 'mobx';
import { LabelLayout } from 'choerodon-ui/pro/lib/form/enum';

import { modelClassification } from '@/utils/config';

import LeftMenu from './leftMenu';
import TopMenu from './topMenu';
import RightTable from './rightTable';
import LeftMenuDs from './store/leftMenuDs';
import styles from './index.less';

interface INodeData {
  grade: string;
  type: string;
  name: string;
  id: string | number;
  schemaName: string;
  dataSourceType: string;
  serviceCode: string;
}
interface IIndex {
  formDs: DataSet;
  tableObj?: INodeData | undefined;
  rightMenuDs: DataSet;
  modelDataObj: model.LogicModelTreeVO;
  type: string;
  level: string;
  editor: boolean;
}

const { Option } = Select;
const isTenantRole: boolean = isTenantRoleLevel();
const Index: FC<IIndex> = ({
  tableObj,
  rightMenuDs,
  modelDataObj,
  type,
  formDs,
  level,
  editor,
}) => {
  const leftMenuRef: any = useRef();
  const [loading, setLoading] = useState(false);
  const leftMenuDs = useMemo(() => new DataSet(LeftMenuDs() as DataSetProps), []);

  /**
   * 步骤数组
   */
  const topMenuProps = {
    modelDataObj,
  };
  const leftMenuProps = {
    type,
    setLoading,
    leftMenuDs,
    rightMenuDs,
    tableObj,
    modelDataObj,
    ref: leftMenuRef,
  };
  const rightTableProps = {
    rightMenuDs,
  };

  const handleRefreshTable = () => {
    rightMenuDs.removeAll();
    runInAction(() => {
      // eslint-disable-next-line no-unused-expressions
      leftMenuRef.current?.tables?.forEach((item) => {
        rightMenuDs.create({
          serviceCode: item[2],
          schemaName: item[3],
          tableName: item[1],
          id: item[0],
        });
      });
    });
  };
  return (
    <React.Fragment>
      <div className={`${styles['batch-modal-frame']} ${styles['global-pro']}`}>
        <Row>
          <Col span={6}>
            <Spin spinning={loading}>
              <div className={styles['batch-modal-frame-left']}>
                <TopMenu {...topMenuProps} />
                <LeftMenu {...leftMenuProps} />
              </div>
            </Spin>
          </Col>
          <Col span={18}>
            <Row>
              <Col span={24}>
                <Form dataSet={formDs} columns={2} labelLayout={LabelLayout.horizontal}>
                  <Select
                    disabled={level === 'tenant' || isTenantRole}
                    name="type"
                    showHelp={ShowHelp.tooltip}
                    clearButton={false}
                    optionsFilter={(item) => {
                      if (level === 'platform' && !isTenantRole) {
                        return !['TENANT'].includes(item.toData().value);
                      } else {
                        return item.toData().value === 'TENANT';
                      }
                    }}
                    help={
                      (
                        <React.Fragment>
                          {level === 'platform' && !isTenantRole ? (
                            <React.Fragment>
                              <div>平台共享模型：用于共享给租户使用。</div>
                              <div>平台自定义模型：仅平台层使用，不能共享给租户。</div>
                            </React.Fragment>
                          ) : (
                            <div>租户自定义模型：仅租户层使用。</div>
                          )}
                        </React.Fragment>
                      ) as any
                    }
                  >
                    {modelClassification.map((item) => (
                      <Option key={item.value} value={item.value}>
                        {item.meaning}
                      </Option>
                    ))}
                  </Select>
                  {editor ? (
                    <SelectBox name="assignPattern">
                      <Option value="ALLOW_LIST">白名单模式</Option>
                      <Option value="BLOCK_LIST">黑名单模式</Option>
                    </SelectBox>
                  ) : null}
                </Form>
              </Col>
            </Row>
            <div
              className={`${styles['batch-modal-frame-right']} ${styles['input-table']} ${styles.table}`}
            >
              <RightTable {...rightTableProps} />
            </div>
          </Col>
        </Row>
      </div>
      {type === 'batch' && (
        <div
          style={{
            opacity: leftMenuRef.current?.tables?.length ? 1 : 0.8,
            transform: leftMenuRef.current?.tables?.length ? 'scale(1.1)' : 'scale(1)',
            boxShadow: leftMenuRef.current?.tables?.length ? '0px 0px 10px #012492' : 'none',
          }}
          className={styles['frame-left-button']}
          onClick={tableObj ? () => {} : handleRefreshTable}
        >
          <span>
            <Icon type="sync_records" style={{ fontSize: '26px' }} />
          </span>
        </div>
      )}
    </React.Fragment>
  );
};
export default Index;
