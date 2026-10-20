import React, { PureComponent, Fragment } from 'react';
import { Collapse, Icon, Switch } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { groupBy } from 'lodash';
import intl from 'utils/intl';
import FieldPropsPanel from './FieldPropsPanel';
import FieldDescription from './FieldDescription';
import styles from './style.less';

const CollapsePanel = Collapse.Panel;

export default class FieldPropsList extends PureComponent {
  @Bind()
  titleRender() {}

  @Bind()
  listRender() {
    const {
      dataSource = [],
      onDefaultFieldPropsChange = () => {},
      onFieldPropsChange = () => {},
      onLayoutChange = () => {},
    } = this.props;
    const dataSourceLayoutRowGroup = groupBy(
      dataSource.map(o => ({
        fieldName: o.fieldName,
        row: o.fieldProps.row,
        col: o.fieldProps.col,
      })),
      'row'
    );
    Object.keys(dataSourceLayoutRowGroup).forEach(n => {
      const maxCol = dataSourceLayoutRowGroup[n].length;
      dataSourceLayoutRowGroup[n] = maxCol;
    });
    const dataSourceLayoutColGroup = groupBy(
      dataSource.map(o => ({
        fieldName: o.fieldName,
        row: o.fieldProps.row,
        col: o.fieldProps.col,
      })),
      'col'
    );
    Object.keys(dataSourceLayoutColGroup).forEach(n => {
      const maxRow = dataSourceLayoutColGroup[n].length;
      dataSourceLayoutColGroup[n] = maxRow;
    });
    const fieldPropsCardProps = {
      onDefaultFieldPropsChange,
      onFieldPropsChange,
      // maxCol,
      // maxRow,
      onLayoutChange,
      dataSourceLayoutRowGroup,
      dataSourceLayoutColGroup,
    };
    const customPanelStyle = {
      background: '#f7f7f7',
      borderRadius: 4,
      marginBottom: 24,
      border: 0,
      overflow: 'hidden',
      transition: 'all 0.3s',
    };

    return (
      <Fragment>
        <Collapse bordered={false}>
          {dataSource.map(o => (
            <CollapsePanel
              className={styles['collapse-panel']}
              key={o.fieldName}
              style={customPanelStyle}
              header={
                <div>
                  <FieldDescription
                    disabled={o.fieldEnabledFlag !== 1}
                    value={o.fieldDescription}
                    onFieldDescriptionChange={value =>
                      onDefaultFieldPropsChange(o.fieldName, value)
                    }
                  />
                  <div style={{ float: 'right', marginRight: 16 }}>
                    <span onClick={e => e.stopPropagation()}>
                      <Switch
                        checked={o.fieldEnabledFlag === 1}
                        onChange={value =>
                          onDefaultFieldPropsChange(o.fieldName, {
                            fieldEnabledFlag: value ? 1 : 0,
                          })
                        }
                        style={{ marginRight: 16 }}
                      />
                    </span>
                    <a>
                      {intl
                        .get(`hpfm.individuationForm.view.title.moreFieldProps`)
                        .d('更多属性配置')}
                      <Icon style={{ marginLeft: 4 }} type="double-right" />
                    </a>
                  </div>
                </div>
              }
            >
              <FieldPropsPanel
                CollapsePanel={CollapsePanel}
                dataSource={o}
                {...fieldPropsCardProps}
              />
            </CollapsePanel>
          ))}
        </Collapse>
      </Fragment>
    );
  }

  render() {
    return this.listRender();
  }
}
