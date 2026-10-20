import React, { Component, Fragment } from 'react';
import {
  DataSet,
  Spin,
  TextArea,
  Select,
  Switch,
  Lov,
  NumberField,
  IntlField,
  Icon,
  Tooltip,
} from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import { Observer } from 'mobx-react';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { getResponse } from 'utils/utils';
import FormPro from '@/components/FormPro';
import Card from '@/components/Card';

import { saveDimension } from './api';
import { tableDs, getShowOrRequired } from './ds';

const AddonAfter = ({ title }) => (
  <Tooltip title={title}>
    <Icon type="help" style={{ fontSize: '14px' }} />
  </Tooltip>
);

export default class Detail extends Component {
  constructor(props) {
    super(props);

    const { modal, readOnly, data: { authDimensionId } = {} } = props;

    modal.handleOk(() => {
      return readOnly ? true : this.handleSave();
    });

    this.state = {
      loading: false,
      authDimensionId,
    };
  }

  formDs = new DataSet(tableDs());

  componentDidMount() {
    const { data = {} } = this.props;
    if (data?.authDimensionId) {
      this.formDs.loadData([data]);
    } else {
      this.formDs.create({});
    }
  }

  @Bind
  async handleSave() {
    const { onFetchList = e => e, data: { authDimensionId } = {} } = this.props;
    const record = this.formDs.current;
    const flag = await this.formDs.validate();
    if (flag) {
      this.setState({ loading: true });
      const res = await saveDimension(record.toData());
      this.setState({ loading: false });
      const result = getResponse(res);
      if (result) {
        onFetchList(authDimensionId);
        notification.success();
        this.setState({ authDimensionId: result.authDimensionId });
        record.set('authDimensionId', result.authDimensionId);
        record.set('objectVersionNumber', result.objectVersionNumber);
        return true;
      }
    }
    return false;
  }

  render() {
    const { readOnly } = this.props;
    const { loading, authDimensionId } = this.state;

    const infoAreas = [
      {
        name: 'baseInfo',
        title: intl.get('sagm.common.view.baseInfo').d('基本信息'),
        fields: [
          {
            name: 'dimensionCode',
            disabled: authDimensionId,
          },
          {
            name: 'dimensionName',
            FormField: IntlField,
          },
          {
            name: 'orderSeq',
            step: 1,
            min: 1,
            FormField: NumberField,
          },
          {
            name: 'enabledFlag',
            FormField: Switch,
            label: intl.get('hzero.common.enable').d('启用'),
            // colSpan: 2,
            renderer: ({ value }) =>
              value ? intl.get('hzero.common.yes').d('是') : intl.get('hzero.common.no').d('否'),
          },
        ],
      },
      {
        name: 'applyRange',
        title: intl.get('sagm.common.view.applyRange').d('应用范围'),
        fields: [
          {
            name: 'tenantLov',
            FormField: Lov,
          },
          {
            name: 'channel',
            FormField: Select,
          },
        ],
      },

      {
        name: 'categoryInfo',
        title: intl.get('sagm.common.view.categoryInfo').d('分类信息'),
        fields: [
          {
            name: 'dimensionType',
            FormField: Select,
          },
          {
            name: 'unitDimensionFlag',
            FormField: Select,
            show: getShowOrRequired('unitDimensionFlag'),
            addonAfter: (
              <AddonAfter
                title={intl.get('sagm.dimension.view.orgDimensionTip').d('该维度是否是组织维度')}
              />
            ),
          },
        ],
      },
      {
        name: 'backstageConfig',
        title: intl.get('sagm.common.view.backstageConfig').d('后台配置'),
        fields: [
          {
            name: 'editFlag',
            FormField: Select,
            show: getShowOrRequired('editFlag'),
            addonAfter: (
              <AddonAfter
                title={intl
                  .get('sagm.dimension.view.backstageEditTip')
                  .d('指定该组织维度后台可编辑区域')}
              />
            ),
          },
          {
            name: 'lovCodeLov',
            FormField: Lov,
            addonAfter: (
              <AddonAfter
                title={intl
                  .get('sagm.dimension.view.lovCodeLovTip')
                  .d('目前仅支持sql值集;必须写翻译sql;必须添加meaningValues为名称的查询条件')}
              />
            ),
          },
          {
            name: 'valueType',
            FormField: Select,
          },
          {
            name: 'componentType',
            FormField: Select,
          },
        ],
      },
      {
        name: 'mallConfig',
        title: intl.get('sagm.common.view.mallConfig').d('主站配置'),
        show: () => getShowOrRequired('inputFlag')({ record: this.formDs.current }),
        fields: [
          {
            name: 'inputFlag',
            FormField: Select,
            show: getShowOrRequired('inputFlag'),
            addonAfter: (
              <AddonAfter
                title={intl
                  .get('sagm.dimension.view.mallInputTip')
                  .d('需求人员在主站选择采买身份时该组织维度的录入方式')}
              />
            ),
          },
          {
            name: 'inputLov',
            FormField: Lov,
            show: getShowOrRequired('inputLov'),
            addonAfter: (
              <AddonAfter
                title={intl
                  .get('sagm.dimension.view.inputLovTip')
                  .d('指定默认值defaultValueFlag值为1')}
              />
            ),
          },
          {
            name: 'empty',
            _type: 'empty',
            show: getShowOrRequired('valueSql'),
          },
          {
            rows: 6,
            colSpan: 2,
            name: 'valueSql',
            resize: 'both',
            FormField: TextArea,
            show: getShowOrRequired('valueSql'),
          },
        ],
      },
    ];

    return (
      <Fragment>
        <Spin spinning={loading}>
          {infoAreas.map(m => {
            return (
              <Observer>
                {() => {
                  const isShow =
                    !('show' in m) || (typeof m.show === 'function' ? m.show() : m.show);
                  return isShow ? (
                    <Card title={m.title} key={m.name}>
                      <FormPro
                        columns={2}
                        readOnly={readOnly}
                        dataSet={this.formDs}
                        fields={m.fields}
                      />
                    </Card>
                  ) : null;
                }}
              </Observer>
            );
          })}
        </Spin>
      </Fragment>
    );
  }
}
