import React, { PureComponent } from 'react';
import { Card } from 'choerodon-ui';
import { Form, Output, DataSet, Button, Table } from 'choerodon-ui/pro';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { Bind } from 'lodash-decorators';
import notification from 'hzero-front/lib/utils/notification';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { operatorRender } from 'hzero-front/lib/utils/renderer';
import QuestionPopover from '@/components/QuestionPopover';
import { formulaLineTableDS, onlyReadFormDS } from '@/stores/DataMapping/DataMappingDS';
import getLang from '@/langs/dataMappingLang';

export default class MappingDrawer extends PureComponent {
  constructor(props) {
    super(props);
    this.formulaLineTableDS = new DataSet({
      ...formulaLineTableDS(),
    });
    this.onlyReadFormDS = new DataSet({
      ...onlyReadFormDS(),
    });
  }

  componentDidMount() {
    this.init();
    this.handleFetchDetail();
    this.handleUpdateModalProp();
  }

  init() {
    const { highlightedCastExpr } = this.props;
    this.onlyReadFormDS.loadData([{ highlightedCastExpr }]);
  }

  /**
   * 更新当前Modal的属性
   */
  @Bind()
  handleUpdateModalProp() {
    this.props.modal.update({
      onOk: this.handleSave,
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const { onFetchLine } = this.props;
    const validate = await this.formulaLineTableDS.validate();
    if (!validate) {
      notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
      return false;
    }
    return this.formulaLineTableDS.submit().then((res) => {
      if (res && res.success) {
        onFetchLine();
      }
    });
  }

  /**
   * 明细查询
   */
  @Bind()
  async handleFetchDetail() {
    const { castLineId, historyFlag, version } = this.props;
    this.formulaLineTableDS.setQueryParameter('castLineId', castLineId);
    if (historyFlag) {
      this.formulaLineTableDS.setQueryParameter('formerVersionFlag', historyFlag);
      this.formulaLineTableDS.setQueryParameter('version', version);
    }
    await this.formulaLineTableDS.query();
  }

  /**
   * 创建行
   */
  @Bind()
  handleCreate() {
    const { tenantId, castLineId } = this.props;
    const record = this.formulaLineTableDS.create({ tenantId, castLineId });
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
  async handleDelete(record) {
    await this.formulaLineTableDS.delete(record);
    this.props.onFetchLine();
  }

  get castLineColumns() {
    const { path, readOnly } = this.props;
    return [
      {
        name: 'orderSeq',
        editor: !readOnly,
        width: 80,
      },
      {
        name: 'exprFieldSourceType',
        editor: !readOnly,
      },
      {
        name: 'exprFieldSourceValue',
        editor: !readOnly,
      },
      {
        header: getLang('OPERATOR'),
        width: 80,
        lock: 'right',
        align: 'center',
        renderer: ({ record }) => {
          const actions = [
            {
              ele: (
                <ButtonPermission
                  type="text"
                  permissionList={[
                    {
                      code: `${path}.button.formula.delete`,
                      type: 'button',
                      meaning: '公式列表-删除',
                    },
                  ]}
                  disabled={readOnly}
                  onClick={() => this.handleDelete(record)}
                >
                  {getLang('DELETE')}
                </ButtonPermission>
              ),
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
    const { readOnly } = this.props;
    return (
      <>
        <Card
          bordered={false}
          className={DETAIL_CARD_CLASSNAME}
          title={<h3>{getLang('BASIC_INFO')}</h3>}
        >
          <Form dataSet={this.onlyReadFormDS} columns={2} labelWidth={80}>
            <Output
              name="highlightedCastExpr"
              colSpan={2}
              renderer={({ text }) => (
                <p style={{ whiteSpace: 'pre-line' }} dangerouslySetInnerHTML={{ __html: text }} />
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
          {!readOnly && (
            <div style={{ width: '100%', textAlign: 'right', marginBottom: '5px' }}>
              <Button color="primary" onClick={this.handleCreate}>
                {getLang('CREATE')}
              </Button>
            </div>
          )}
          <Table dataSet={this.formulaLineTableDS} columns={this.castLineColumns} />
        </Card>
      </>
    );
  }
}
