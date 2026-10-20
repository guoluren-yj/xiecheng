import React, { PureComponent } from 'react';
import { Card } from 'choerodon-ui';
import { Form, Output, DataSet, Button, Table } from 'choerodon-ui/pro';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import QuestionPopover from '@/components/QuestionPopover';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { formulaLineTableDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/mappingDebugLang';

@formatterCollections({ code: ['hzero.common', getLang('PERFIX')] })
export default class MappingDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.dataConfigLineFormDS = new DataSet({
      ...formulaLineTableDS(),
    });
    this.state = {
      highlightedCastExpr: props.highlightedCastExpr,
    };
  }

  componentDidMount() {
    this.loadData(this.props);
    this.handleUpdateModalProp();
  }

  //  eslint-disable-next-line
  UNSAFE_componentWillReceiveProps(nextProps) {
    this.dataConfigLineFormDS.removeAll();
    this.loadData(nextProps);
    this.state = {
      highlightedCastExpr: nextProps.highlightedCastExpr,
    };
  }

  loadData(data) {
    const { isNew, exprConfigs } = data;
    if (!isNew) {
      this.dataConfigLineFormDS.loadData(exprConfigs);
    }
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp() {
    const { modal } = this.props;
    modal.update({
      footer: (_okBtn, cancelBtn) => (
        <div style={{ textAlign: 'right' }}>
          <Button color="primary" onClick={this.handleSave}>
            {getLang('SURE')}
          </Button>
          {cancelBtn}
        </div>
      ),
    });
  }

  /**
   * 确定
   */
  @Bind()
  async handleSave() {
    const { modal, onUpdateFormula } = this.props;
    const validate = await this.dataConfigLineFormDS.validate();
    if (validate) {
      modal.close();
      const exprConfigs = this.dataConfigLineFormDS.toData() || [];
      const exprStr = this.handleUpdateExpr(exprConfigs);
      onUpdateFormula(exprStr.castExpr, exprStr.highlightedCastExpr, exprConfigs);
    } else {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
  }

  /**
   * 创建行
   */
  @Bind()
  handleCreate() {
    const { tenantId } = this.props;
    const record = this.dataConfigLineFormDS.create({ tenantId });
    let order = record.index + 1;
    if (record.previousRecord) {
      order = record.previousRecord.get('orderSeq') + 1;
    }
    record.set('orderSeq', order);
  }

  /**
   * 行删除
   */
  @Bind()
  handleDelete(record) {
    this.dataConfigLineFormDS.delete(record);
    this.handleUpdateExpr(this.dataConfigLineFormDS.toData());
  }

  handleUpdateExpr(exprConfigs) {
    let castExpr = '';
    let highlightedCastExpr = '';
    if (exprConfigs) {
      highlightedCastExpr = 'CONCAT(';
      exprConfigs.map((item) => {
        castExpr += `${item.exprFieldSourceValue}+`;
        if (item.exprFieldSourceType === 'CONSTANT') {
          highlightedCastExpr += `"<span style="font-weight:bold;font-style:italic;">${item.exprFieldSourceValue}</span>", `;
        } else if (item.exprFieldSourceType === 'EXPR') {
          highlightedCastExpr += `[<span style="font-weight:bold;font-style:italic;">${item.exprFieldSourceValue}</span>], `;
        } else if (item.exprFieldSourceType === 'PACKET_FIELD') {
          highlightedCastExpr += `{<span style="font-weight:bold;font-style:italic;">${item.exprFieldSourceValue}</span>}, `;
        }
        return item;
      });
      castExpr = castExpr.substr(0, castExpr.length - 1);
      highlightedCastExpr = `${highlightedCastExpr.substr(0, highlightedCastExpr.length - 2)})`;
    }
    return { castExpr, highlightedCastExpr };
  }

  get castLineColumns() {
    return [
      {
        name: 'orderSeq',
        editor: true,
        width: 80,
      },
      {
        name: 'exprFieldSourceType',
        editor: true,
      },
      {
        name: 'exprFieldSourceValue',
        editor: true,
      },
      {
        header: getLang('OPERATOR'),
        width: 80,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: <a onClick={() => this.handleDelete(record)}>{getLang('DELETE')}</a>,
              key: 'delete',
              len: 2,
              title: getLang('DELETE'),
            },
          ];
          return operatorRender(actions, record);
        },
      },
    ];
  }

  @Bind()
  renderTipContent() {
    return (
      <>
        <p>{getLang('CAST_FORMULA_TIP_HEADER')}</p>
        <p>{getLang('CAST_FORMULA_TIP_CONST')}</p>
        <p>{getLang('CAST_FORMULA_TIP_FORMULA')}</p>
        <p>{getLang('CAST_FORMULA_TIP_RESPONSE')}</p>
      </>
    );
  }

  render() {
    const { highlightedCastExpr } = this.state;
    return (
      <>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('BASIC_INFO')}</h3>}
        >
          <Form>
            <Output
              name="highlightedCastExpr"
              colSpan={2}
              renderer={() => (
                <p
                  style={{ whiteSpace: 'pre-line' }}
                  dangerouslySetInnerHTML={{ __html: highlightedCastExpr }}
                />
              )}
              label={
                <QuestionPopover text={getLang('CAST_FORMULA')} message={this.renderTipContent()} />
              }
            />
          </Form>
        </Card>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('DETAIL_INFO')}</h3>}
        >
          <div style={{ width: '100%', textAlign: 'right', marginBottom: '5px' }}>
            <Button color="primary" onClick={this.handleCreate}>
              {getLang('CREATE')}
            </Button>
          </div>
          <Table dataSet={this.dataConfigLineFormDS} columns={this.castLineColumns} />
        </Card>
      </>
    );
  }
}
