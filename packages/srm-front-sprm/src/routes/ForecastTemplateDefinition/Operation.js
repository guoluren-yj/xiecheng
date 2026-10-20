import React, { useEffect, useState } from 'react';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { Timeline, Icon, Spin } from 'choerodon-ui';
import formatterCollections from 'utils/intl/formatterCollections';
import { isArray } from 'lodash';

import style from './index.less';

const { Item } = Timeline;
const commonPrompt = 'sprm.forecastMgt.model.common';

const Index = ({ templateHeaderId, operateLineDs }) => {
  const [loading, setLoading] = useState(false);
  const [actionData, setActionData] = useState([]);
  const [dataKey, setDataKey] = useState([]);
  useEffect(() => {
    setLoading(true);
    operateLineDs.setQueryParameter('templateHeaderId', templateHeaderId);
    operateLineDs.query().then(res => {
      let batchNoArray = [];
      const currentItem = [];
      // 根据batchNo或者processDate分类
      res.forEach(ele => {
        if (ele.batchNo) {
          batchNoArray.push(ele.batchNo);
        } else {
          batchNoArray.push(ele.processDate);
        }
      });

      // // 去重
      batchNoArray = Array.from(new Set(batchNoArray));

      batchNoArray.forEach(item => {
        currentItem.push(res.filter(ele => ele.batchNo === item || ele.processDate === item));
      });

      const classified = currentItem.map((ele, index) => {
        dataKey[index] = 'off';
        return ele;
      });
      setActionData(classified);
      setLoading(false);
    });
  }, [templateHeaderId]);

  //
  const handleNoData = () => {
    return (
      <div className="nodata_wrapper">
        <span>{intl.get(`hzero.common.components.noticeIcon.null`).d('暂无数据')}</span>
      </div>
    );
  };

  const changeFieldMeaning = {
    sourceCode: intl.get(`${commonPrompt}.sourceCode`).d('值集编码'),
    sourceCodeMeaning: intl.get(`${commonPrompt}.sourceCodeMeaning`).d('值集名称'),
    dimensionCode: intl.get(`${commonPrompt}.dimensionCode`).d('维度编码'),
    dimensionCodeMeaning: intl.get(`${commonPrompt}.dimensionMeaning`).d('维度名称'),
    dimensionValue: intl.get(`${commonPrompt}.dimensionValue`).d('维度值'),
    dimensionSeq: intl.get(`${commonPrompt}.dimensionSeq`).d('维度展示顺序'),
    sumWithinDimension: intl.get(`${commonPrompt}.sumWithinDimension`).d('按周期汇总'),
    fieldType: intl.get(`${commonPrompt}.fieldype`).d('类型'),
    gridSeq: intl.get(`${commonPrompt}.gridSeq`).d('展示顺序'),
    fieldCode: intl.get(`${commonPrompt}.fieldCode`).d('字段编码'),
    fieldName: intl.get(`${commonPrompt}.fieldName`).d('字段名称'),
    showFieldFlag: intl.get(`${commonPrompt}.showFieldFlag`).d('是否显示'),
    fieldEditable: intl.get(`${commonPrompt}.fieldEditable`).d('是否可编辑'),
    fieldRequired: intl.get(`${commonPrompt}.fieldRequired`).d('是否必输'),
    gridFixed: intl.get(`${commonPrompt}.gridFixed`).d('固定方式'),
    fieldWidget: intl.get(`${commonPrompt}.fieldWidget`).d('固定方式'),
    enabledFlag: intl.get(`${commonPrompt}.enabledFlag`).d('是否启用'),
    gridWidth: intl.get(`${commonPrompt}.gridWidth`).d('字段宽度'),
    supplierEditable: intl.get(`${commonPrompt}.supplierEditable`).d('供应商是否可编辑'),
    templateCode: intl.get(`${commonPrompt}.templateCode`).d('预测模板编码'),
    templateName: intl.get(`${commonPrompt}.templateName`).d('预测模板名称'),
    templateStatus: intl.get(`${commonPrompt}.templateStatus`).d('状态'),
    createdByName: intl.get(`${commonPrompt}.creator`).d('创建人'),
    creationDate: intl.get(`${commonPrompt}.creationDate`).d('创建时间'),
    detailFeedbackFlag: intl.get(`${commonPrompt}.detailFeedbackFlag`).d('是否启用明细反馈'),
    needFeedback: intl.get(`${commonPrompt}.needFeedback`).d('供应商是否需要反馈'),
    allowChange: intl.get(`${commonPrompt}.allowChange`).d('已发布是否允许采购方变更'),
    feedbackChangeCnf: intl.get(`${commonPrompt}.feedbackChangeCnf`).d('已反馈状态变更配置'),
    offlineInputFlag: intl.get(`${commonPrompt}.offlineInputFlag`).d('是否需线下录入供应商结果'),
    feedbackAutoFill: intl
      .get(`${commonPrompt}.feedbackAutoFill`)
      .d('供应商的反馈数量是否默认等于预测数量'),
    deliverControlType: intl.get(`${commonPrompt}.deliverControlType`).d('送货单控制类型'),
    deliverControlNode: intl.get(`${commonPrompt}.deliverControlNode`).d('交货节点'),
    supplierDisplayFlag: intl.get(`${commonPrompt}.supplierDisplayFlag`).d('供应商是否显示'),
  };

  const currentLineDescribe = ele => {
    const {
      processUserName: userName,
      processTypeCode: typeCode,
      processTypeCodeMeaning: meaning,
      changeField,
      oldValue,
      newValue,
      newValueMeaning,
      oldValueMeaning,
      lineUniqueValueName,
      tableCode,
    } = ele;
    if (changeField && typeCode === 'UPDATE') {
      return (
        <div>
          <span className="operator">{userName}</span>将
          {tableCode && tableCode !== 'sprm_fcst_template_header' && (
            <span className="status gray">
              {tableCode === 'sprm_fcst_template_line'
                ? `${intl
                    .get('sprm.forecastMgt.model.common.BaseLine')
                    .d('基础维度行')}-${lineUniqueValueName}`
                : `${intl
                    .get('sprm.forecastMgt.model.common.OtherLine')
                    .d('维度高阶行')}-${lineUniqueValueName}`}
              的
            </span>
          )}
          <span className="status gray">{changeFieldMeaning[changeField]}</span>由
          <span className="status gray">{oldValueMeaning || oldValue}</span>
          更新为
          <span className="status gray">{newValueMeaning || newValue}</span>
        </div>
      );
    }
    if (['NEWLINE', 'DELETE'].includes(typeCode)) {
      return (
        <div>
          <span className="operator">{userName}</span>
          <span className="status gray">{meaning}</span>
          <span className="result">
            {tableCode === 'sprm_fcst_template_line'
              ? `${intl
                  .get('sprm.forecastMgt.model.common.BaseLine')
                  .d('基础维度行')}-${lineUniqueValueName}`
              : `${intl
                  .get('sprm.forecastMgt.model.common.OtherLine')
                  .d('维度高阶行')}-${lineUniqueValueName}`}
          </span>
        </div>
      );
    } else {
      return (
        <div>
          <span className="operator">{userName}</span>
          <span className="status gray">{meaning}</span>
          <span className="result">
            {intl.get('sprm.forecastMgt.model.common.forecastTemplate').d('预测模板')}
          </span>
        </div>
      );
    }
  };

  console.log(actionData);
  const renderOperateHistory = () => {
    return (
      <Spin spinning={loading}>
        {actionData.length > 0 && (
          <Timeline className="operating-timeline">
            {actionData.map((ele, index) => {
              if (isArray(ele) && ele.length > 1) {
                const { processUserName, processDate, processTypeCodeMeaning } = ele[0];
                return (
                  <Item
                    color="#e5e5e5"
                    onClick={() => {
                      const [...current] = dataKey;
                      current[index] = current[index] === 'on' ? 'off' : 'on';
                      setDataKey(current);
                    }}
                  >
                    <Icon type="publish2" style={{ fontSize: 14 }} />
                    <div className="operating-timeline-info">
                      <span className="operator">{processUserName}</span>
                      <span className="status gray">{processTypeCodeMeaning}</span>
                      <span className="result">
                        {intl.get('sprm.forecastMgt.model.common.forecastTemplate').d('预测模板')}
                      </span>

                      <Icon type={dataKey[index] === 'on' ? 'expand_less' : 'expand_more'} />
                      {dataKey[index] === 'on' &&
                        ele?.map(item => {
                          const {
                            processUserName: userName,
                            processTypeCode: typeCode,
                            changeField,
                            oldValue,
                            newValue,
                            oldValueMeaning,
                            newValueMeaning,
                            lineUniqueValueName,
                            tableCode,
                          } = item;

                          if (changeField) {
                            return (
                              <div>
                                <span className="operator">{userName}</span>将
                                {tableCode && tableCode !== 'sprm_fcst_template_header' && (
                                  <span className="status gray">
                                    {tableCode === 'sprm_fcst_template_line'
                                      ? `${intl
                                          .get('sprm.forecastMgt.model.common.BaseLine')
                                          .d('基础维度行')}-${lineUniqueValueName}`
                                      : `${intl
                                          .get('sprm.forecastMgt.model.common.OtherLine')
                                          .d('维度高阶行')}-${lineUniqueValueName}`}
                                    的
                                  </span>
                                )}
                                <span className="status gray">
                                  {changeFieldMeaning[changeField]}
                                </span>
                                由<span className="status gray">{oldValueMeaning || oldValue}</span>
                                变为
                                <span className="status gray">{newValueMeaning || newValue}</span>
                              </div>
                            );
                          } else if (tableCode) {
                            return (
                              <div>
                                <span className="operator">{userName}</span>
                                <span className="status gray">
                                  {tableCode === 'sprm_fcst_template_line'
                                    ? typeCode === 'NEWLINE'
                                      ? intl
                                          .get('sprm.forecastMgt.model.common.addBaseLine')
                                          .d('新增基础维度行')
                                      : intl
                                          .get('sprm.forecastMgt.model.common.deleteBaseLine')
                                          .d('删除基础维度行')
                                    : typeCode === 'NEWLINE'
                                    ? intl
                                        .get('sprm.forecastMgt.model.common.addOtherLine')
                                        .d('新增高阶维度行')
                                    : intl
                                        .get('sprm.forecastMgt.model.common.deleteOtherLine')
                                        .d('删除维度高阶行')}
                                </span>
                                <span>{lineUniqueValueName}</span>
                              </div>
                            );
                          } else {
                            return <></>;
                          }
                        })}

                      <div className="date gray">{dateTimeRender(processDate)}</div>
                    </div>
                  </Item>
                );
              } else {
                return (
                  <Item color="#e5e5e5">
                    <Icon type="publish2" style={{ fontSize: 14 }} />
                    <div className="operating-timeline-info">
                      {currentLineDescribe(ele[0])}
                      <div className="date gray">{dateTimeRender(ele[0].processDate)}</div>
                    </div>
                  </Item>
                );
              }
            })}
          </Timeline>
        )}
        {!actionData?.length && handleNoData()}
      </Spin>
    );
  };

  return <div className={style.operating}>{renderOperateHistory()}</div>;
};

export default formatterCollections({
  code: ['sprm.forecastMgt'],
})(Index);
