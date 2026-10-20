/**
 * @author HBT <baitao.huang@hand-china.com>
 * @creationDate 2020/7/8
 * @copyright HAND ® 2020
 */
import React from 'react';
import notification from 'hzero-front/lib/utils/notification';
import { Header, Content } from 'hzero-front/lib/components/Page';
import { Button as ButtonPermission } from 'hzero-front/lib/components/Permission';
import { DataSet, Form, TextField, Select, Spin, Lov } from 'choerodon-ui/pro';
import { Card } from 'choerodon-ui';
import { Bind } from 'lodash-decorators';
import { isUndefined, isEmpty } from 'lodash';
import { DETAIL_CARD_CLASSNAME } from 'hzero-front/lib/utils/constants';
import { getResponse, isTenantRoleLevel } from 'hzero-front/lib/utils/utils';
import formatterCollections from 'hzero-front/lib/utils/intl/formatterCollections';
import { routerRedux } from 'dva/router';
import FieldMapping from '@/components/FieldMapping';
import { formDS } from '@/stores/FieldMapping/FieldMappingDS';
import getLang from '@/langs/fieldMappingLang';

@formatterCollections({ code: ['hzero.common', getLang('PREFIX')] })
export default class Detail extends React.Component {
  constructor(props) {
    super(props);
    const {
      match: { path },
      location = {},
    } = props;
    const isHistory = path.includes('history');
    const { editFlag } = location.state || {};
    this.state = {
      historyFlag: isHistory,
      readOnly: isHistory || !editFlag,
    };
    this.detailFormDS = new DataSet({
      ...formDS({
        _required: true,
        onFieldUpdate: this.handleFieldUpdate,
      }),
    });
  }

  componentDidMount() {
    const {
      match: { params },
    } = this.props;
    const { id } = params;
    if (!isUndefined(id)) {
      this.handleFetchDetail(id);
    } else {
      this.detailFormDS.create();
    }
  }

  @Bind()
  handleFieldUpdate({ name, value }) {
    if (name === 'transformType') {
      const [sourceType, targetType] = isEmpty(value) ? [] : value.split('_TO_');
      this.setState({ sourceType, targetType });
    }
  }

  /**
   * 查询
   */
  async handleFetchDetail(id) {
    const { historyFlag } = this.state;
    const {
      match: {
        path,
        params: { version },
      },
    } = this.props;
    const isHistory = path.includes('history');
    this.detailFormDS.setQueryParameter('transformId', id);
    this.detailFormDS.setQueryParameter('version', version);
    this.detailFormDS.setQueryParameter('queryType', 'ZDYS');
    this.detailFormDS.setQueryParameter('_historyFlag', historyFlag);
    const res = await this.detailFormDS.query();
    const {
      editFlag,
      sourceStructure,
      targetStructure,
      transformScript,
      transformType = '',
      versionDesc = '',
    } = res;
    const [sourceType, targetType] = transformType.split('_TO_');
    this.setState({
      versionDesc,
      sourceType,
      targetType,
      readOnly: isHistory || !editFlag,
      script: transformScript,
      sourceInputData: sourceStructure,
      targetInputData: targetStructure,
    });
  }

  /**
   * 保存
   */
  @Bind()
  async handleSave() {
    const {
      match: { params },
    } = this.props;
    const { id } = params;
    const validate = await this.detailFormDS.validate();
    if (!validate) {
      return notification.error({
        message: getLang('SAVE_VALIDATE'),
      });
    }
    const result = await this.detailFormDS.submit();
    if (getResponse(result)) {
      if (isUndefined(id)) {
        this.handleGotoDetail(result.content[0].transformId);
      } else {
        this.handleFetchDetail(id);
      }
    }
  }

  /**
   * 跳转到明细页面
   * @param {*} id
   */
  @Bind()
  handleGotoDetail(id) {
    const { dispatch = () => {} } = this.props;
    dispatch(
      routerRedux.push({
        pathname: `/hitf/field-mapping/detail/${id}`,
      })
    );
  }

  @Bind()
  handleSetValue(params) {
    const { script, sourceInputData, targetInputData } = params;
    if (script) {
      this.detailFormDS.current.set('transformScript', script);
    }
    if (sourceInputData) {
      this.detailFormDS.current.set('sourceStructure', sourceInputData);
    }
    if (targetInputData) {
      this.detailFormDS.current.set('targetStructure', targetInputData);
    }
  }

  /**
   * 回退到指定版本
   */
  @Bind()
  async handleRevert() {
    const {
      match: {
        params: { id, version },
      },
    } = this.props;
    this.detailFormDS.current.set('transformId', id);
    this.detailFormDS.current.set('version', version);
    this.detailFormDS.current.set('_historyFlag', true);
    const result = await this.detailFormDS.submit();
    if (getResponse(result)) {
      this.handleGotoDetail(id);
    }
  }

  render() {
    const { match } = this.props;
    const { path } = match;
    const {
      script,
      readOnly,
      historyFlag,
      versionDesc,
      sourceInputData,
      targetInputData,
      sourceType,
      targetType,
    } = this.state;
    const fieldMappingProps = {
      script,
      sourceType,
      targetType,
      sourceInputData,
      targetInputData,
      edit: !readOnly,
      arrowId: 'fieldMapping',
      onGetValue: this.handleSetValue,
    };
    const isNew = isUndefined(match.params.id);
    return (
      <>
        <Header title={getLang('DETAIL')} backPath="/hitf/field-mapping/list">
          {!readOnly && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.detail.save`,
                  type: 'button',
                  meaning: '字段映射-保存',
                },
              ]}
              icon="save"
              type="c7n-pro"
              color="primary"
              onClick={() => this.handleSave()}
            >
              {getLang('SAVE')}
            </ButtonPermission>
          )}
          {historyFlag && (
            <ButtonPermission
              permissionList={[
                {
                  code: `${path}.button.detail.revert`,
                  type: 'button',
                  meaning: '字段映射-版本回退',
                },
              ]}
              icon="settings_backup_restore"
              type="c7n-pro"
              color="primary"
              onClick={() => this.handleRevert()}
            >
              {`${getLang('REVERT')}: ${versionDesc}`}
            </ButtonPermission>
          )}
        </Header>
        <Content>
          <Spin dataSet={this.detailFormDS}>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('BASIC_INFO')}</h3>}
            >
              <Form
                labelLayout="horizontal"
                dataSet={this.detailFormDS}
                columns={3}
                disabled={readOnly}
              >
                {!isTenantRoleLevel() && <Lov name="tenantLov" disabled={!isNew} />}
                <TextField name="transformCode" restrict="a-zA-Z0-9-_./" disabled={!isNew} />
                <TextField name="transformName" />
                <Select name="transformType" />
                <TextField name="versionDesc" disabled />
                {!historyFlag && <Select name="statusCode" disabled />}
              </Form>
            </Card>
            <Card
              bordered={false}
              className={DETAIL_CARD_CLASSNAME}
              title={<h3>{getLang('DETAIL_INFO')}</h3>}
            >
              <FieldMapping {...fieldMappingProps} />
            </Card>
          </Spin>
        </Content>
      </>
    );
  }
}
