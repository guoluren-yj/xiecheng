import React, { Fragment, Component } from 'react';
import { DataSet, Table, Lov } from 'choerodon-ui/pro';
import { observable } from "mobx";
import { observer } from "mobx-react";
import intl from 'utils/intl';
import { mallCustomizeDS } from './indexDS';
import styles from './index.less';

const { Column } = Table;
const empty = Symbol("undefined");
@observer
export default class MallCustomize extends Component {
  @observable
  createLoading = false;

  constructor(props) {
    super(props);
    this.customizeDataSet = new DataSet(
      mallCustomizeDS(({ dataSet }) => {
        this.reloadCustomizeConfigs(dataSet);
      })
    );
    this.lovCreateDs = new DataSet({fields: mallCustomizeDS().fields});
  }

  reloadCustomizeConfigs = (dataSet) => {
    if (!dataSet) {
      return;
    }
    const datas = dataSet.toData();
    // 对比是否变更
    const result = this.getCustomizeConfigsKeysString(datas);
    const oldResult = this.getCustomizeConfigsKeysString(this.props.customizeConfigs);
    // 防止死循环
    if (result !== oldResult) {
      this.props.updateCustomizeConfigs(datas, 'mall');
    }
  };

  getCustomizeConfigsKeysString = (datas = []) => {
    let result = datas.map((e) => e.componetCode);
    result = result.sort((i, j) => (Number(i) > Number(j) ? 1 : -1));
    return result.length ? result.join(',') : empty;
  };

  render() {
    return (
      <Fragment>
        <div className={styles["mall-customize-content"]}>
          <Table
            dataSet={this.customizeDataSet}
            title={intl.get('smbl.componentCustomize.view.remove').d('屏蔽组件')}
            buttons={[
              <Lov
                name="componet"
                mode="button"
                icon="add"
                clearButton={false}
                dataSet={this.lovCreateDs}
                viewMode='modal'
                onChange={(record) => {
                  this.createLoading = true;
                  this.customizeDataSet.create(
                    {
                      applicationCode: 'MAIL',
                      type: 'REMOVE',
                      componet: record,
                    },
                    0
                  );
                  this.customizeDataSet.submit().then(() => {}, () => {
                    this.customizeDataSet.reset();
                  }).catch(() => this.customizeDataSet.reset()).finally(() => { this.createLoading = false; });
                }}
                modalProps={{
                  title: intl.get('hzero.common.button.add').d('新增'),
                }}
                loading={this.createLoading}
              >
                {intl.get('hzero.common.button.add').d('新增')}
              </Lov>,
              'delete',
            ]}
          >
            <Column
              name="componet"
              width={200}
            />
            <Column
              name="description"
              editor
              width={200}
            />
          </Table>
        </div>
      </Fragment>
    );
  }
}
