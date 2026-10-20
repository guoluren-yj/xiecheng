import intl from 'hzero-front/lib/utils/intl';
import notification from 'hzero-front/lib/utils/notification';

export function getDocumentFieldsName(wpsOfficeApp: any): Promise<string[]> {
  return wpsOfficeApp.ActiveDocument.DocumentFields.GetAllNames();
}

export async function createNewDocumentFieldIndex(code: string, wpsOfficeApp: any): Promise<number> {
  const fields = await getDocumentFieldsName(wpsOfficeApp);
  if (!fields || !fields.length) {
    return 0;
  }
  const exist = await wpsOfficeApp.ActiveDocument.DocumentFields.Exists(`\${${code}}`);
  // 若不存在直接返回0
  if (!exist) {
    return 0;
  }
  let reg;
  // 判断是否是带序号的字段
  if (code.endsWith('#{index}')) {
    reg = new RegExp(`\\$\\{${code.replace(/#\{index\}$/, '')}#\\S+\\}(-(\\d+))?`);
  } else {
    reg = new RegExp(`\\$\\{${code}\\}(-(\\d+))?`);
  }
  let index: number = 0;
  fields.forEach(fieldCode => {
    if (!!fieldCode) {
      const match: any[] | null = fieldCode.match(reg);
      if (match && match[2] && Number(match[2]) > index) {
        index = Number(match[2]);
      } 
    }
  });
  index++;
  return index;
}

export async function findDocumentFieldInRange(wpsOfficeApp: any, range: number[]): Promise<any | undefined> {
  const fields = await getDocumentFieldsName(wpsOfficeApp);
  if (!fields || !fields.length) {
    return undefined;
  }
  const [begin, end] = range;
  let targetDocumentField;
  for (const fieldCode of fields) {
    const field = await wpsOfficeApp.ActiveDocument.DocumentFields.Item({ Name: fieldCode });
    const Start = await field.Range.Start;
    const End = await field.Range.End;
    if (Start <= begin && end <= End) {
      targetDocumentField = field;
      break;
    }
  }
  return targetDocumentField;
}

export function replaceDocumentFieldName(documentFieldCode: string): string | undefined {
  if (documentFieldCode) {
    const match = documentFieldCode.match( /\${(.*?)}/);
    if (match && match[1]) {
      return match[1].replace(/#\d+|#\{index$/, '#{index}');
    }
  }
  return undefined;
}

// 处理可编辑文本域的编码
export async function transformDocumentFieldName(app: any) {
  const fields = await getDocumentFieldsName(app);
  if (!fields || !fields.length) {
    return;
  }
  const indexFields = fields.filter(f => /#\{index\}|\#\d+/.test(f));
  if (!indexFields.length) {
    return;
  }
  for (const fieldCode of indexFields) {
    const documentField = await app.ActiveDocument.DocumentFields.Item({ Name: fieldCode });
    const Value = await documentField.Value;
    const match = Value ? Value.match(/#(\d+)\}$/) : undefined;
    const index = match ? match[1] : undefined;
    if (!index) {
      continue;
    }
    const originMatch = fieldCode.match(/#(\{index\})|#([^}]+)/);
    const originIndex = originMatch ? originMatch[1] : undefined;
    // 原序号和当前序号相同则不处理
    if (index === originIndex) {
      continue;
    }
    const Name = fieldCode.replace(/#(\{index\})|#([^}]+)/, `#${index}`);
    const Start = await documentField.Range.Start;
    const End = await documentField.Range.End;
    // 删除原文本域
    await documentField.Delete();
    // 新增新编码的文本域
    await app.ActiveDocument.DocumentFields.Add({
      Name,
      Range: { Start, End },
      Hidden: false, // 是否隐藏，默认 false
      PrintOut: true, // 是否可打印，默认 true
      ReadOnly: false, // 是否只读，默认 false
      Value,
    });
  }
}

export async function saveWord(app: any, onSuccess: () => void, callback: () => void): Promise<void> {
  await transformDocumentFieldName(app); 
  const res = await app.ActiveDocument.Save();
  if (res && res.result) {
    switch(res.result) {
      case 'ok': 
      case 'nochange':
        await onSuccess();
        break;
      case 'SavedEmptyFile':
        notification.error({
          message: intl.get('hrpt.printTemplate.view.message.saveEmptyFile').d('暂不支持保存空文件'),
        });
        break;
      case 'SpaceFull':
        notification.error({
          message: intl.get('hrpt.printTemplate.view.message.spaceFull').d('空间已满'),
        });
        break;
      case 'QueneFull':
        notification.error({
          message: intl.get('hrpt.printTemplate.view.message.queneFull').d('保存中请勿频繁操作'),
        });
        break;
      case 'fail':
        notification.error({
          message: intl.get('hrpt.printTemplate.view.message.fail').d('保存失败'),
        });
        break;
    }
  } else {
    notification.error({});
  }
  callback();
}