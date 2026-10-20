/**
 * @Description: 调查表-公式配置
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-11-30 16:30:40
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import intl from 'hzero-front/lib/utils/intl';
import { TextField, Lov, Button, Tooltip, Icon, Form } from 'choerodon-ui/pro';
import { TopSection, SecondSection } from '_components/Section';
import { num2CodeStr } from './utils';
import styles from './index.less';

const ExpressionConfig = observer(
  ({ record: currentRecord, expressionFieldLineDs, customizeExpressDs, express }) => {
    // 公式配置查询数据时设置loading

    const createCondition = () => {
      const { investgCfHeaderId, investgCfLineId, investigateTemplateId, tenantId } = currentRecord;
      expressionFieldLineDs.create({
        investgCfHeaderId,
        investgCfLineId,
        investigateTemplateId,
        tenantId,
      });
    };

    const deleteRightValue = record => {
      expressionFieldLineDs.delete(record);
    };

    useEffect(() => {
      //  初始化数据整理
      if (express) {
        const { expressionLinesObj, expressionConfig } = JSON.parse(express);
        expressionFieldLineDs.loadData(Object.values(expressionLinesObj));
        customizeExpressDs.loadData([expressionConfig]);
      }
    }, [express]);

    return (
      <Fragment>
        <TopSection>
          <SecondSection>
            <div className={styles['rules-definition-editor-wrapper']}>
              <Fragment>
                {expressionFieldLineDs &&
                  expressionFieldLineDs.records &&
                  expressionFieldLineDs.records.length > 0 &&
                  expressionFieldLineDs.records.map((expressionFieldLineRecord, idx) => {
                    if (expressionFieldLineRecord.status !== 'delete') {
                      return (
                        <div className={styles['rule-editor-form']}>
                          <Form record={expressionFieldLineRecord} labelLayout="float" columns={21}>
                            {/* 参数名称 */}
                            <TextField
                              // name="paramsName"
                              colSpan={10}
                              label={intl
                                .get('sslm.common.model.expressionConfig.paramsName')
                                .d('参数名')}
                              value={num2CodeStr(idx)}
                              disabled
                            />
                            {/* 字段名称 */}
                            <Lov
                              name="fieldNameLov"
                              colSpan={10}
                              // onChange={value =>
                              //   changeRightValueComponent(expressionFieldLineRecord, value)
                              // }
                            />
                            <Button
                              icon="delete"
                              colSpan={1}
                              shape="circle"
                              funcType="flat"
                              onClick={() => {
                                deleteRightValue(expressionFieldLineRecord);
                              }}
                            />
                          </Form>
                        </div>
                      );
                    } else {
                      return null;
                    }
                  })}
                <Form dataSet={customizeExpressDs} labelLayout="float" columns={24}>
                  <Tooltip
                    title={intl
                      .get('sslm.investDefOrg.view.card.button.addExpression')
                      .d('新建公式条件')}
                    colSpan={24}
                  >
                    <a
                      className={styles['rules-definition-control-point']}
                      onClick={createCondition}
                      colSpan={24}
                    >
                      <Icon type="control_point" />
                    </a>
                  </Tooltip>
                  {expressionFieldLineDs &&
                    expressionFieldLineDs.records &&
                    expressionFieldLineDs.records.length > 0 && (
                      <TextField
                        name="customizeConditionCombination"
                        colSpan={24}
                        restrict="0-9a-z+\-\*/() "
                      />
                    )}
                </Form>
              </Fragment>
            </div>
          </SecondSection>
        </TopSection>
      </Fragment>
    );
  }
);
export default ExpressionConfig;
