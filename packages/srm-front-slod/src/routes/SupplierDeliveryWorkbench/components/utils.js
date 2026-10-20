// 获取行id/行号的字段方法
const fieldsFn = (text, template) => {
  const lineId = {
    LABEL: 'labelLineId',
    PLAN: 'planLineId',
    ASN: 'asnLineId',
    UNIQUE_LABEL: 'labelLineId',
  };

  const lineNum = {
    LABEL: 'displayLabelLineNum',
    PLAN: 'displayPlanLineNum',
    ASN: 'displayAsnLineNum',
    UNIQUE_LABEL: 'displayLabelLineNum',
  };

  if (text === 'id') {
    return lineId[template];
  }

  if (text === 'lineNum') {
    return lineNum[template];
  }
};

const lineSelectedCancelSelected = (dataSet, nodeTemplateCode, lineList) => {
  const data = dataSet.toData();
  const type = fieldsFn('lineNum', nodeTemplateCode);
  lineList.forEach((item) => {
    const displayLineNum = item[type];
    const isLineNumonlyOneFlag = data.filter((n) => n[type] === displayLineNum).length === 1;
    if (isLineNumonlyOneFlag) {
      dataSet.forEach((record) => {
        if (record?.get(fieldsFn('lineNum', nodeTemplateCode)) === displayLineNum) {
          Object.assign(record, { selectable: true });
        }
      });
    }
  });
};

export { fieldsFn, lineSelectedCancelSelected };
