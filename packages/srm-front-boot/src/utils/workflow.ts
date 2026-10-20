import type DataSet from "choerodon-ui/dataset";
import type { Record } from "choerodon-ui/dataset";
import { runInAction } from "mobx";
/**
 * 批量提取ds中的数据
 * @param fromDataSets 来源ds数组
 * @param options 选项，validate表示是否进行检验
 * @returns Promise<{ validateFlag: boolean; data: [string | number, any]; }[]>
 */
export async function batchExtractDataSetData(
  fromDataSets: (DataSet | boolean | undefined | null | boolean)[], options: { validate?: boolean } = {}
): Promise<{ validateFlag: boolean; data: [string | number, any]; }[]> {
  const resultData: any = await Promise.all(fromDataSets.map(async (ds?: DataSet | boolean | null) => {
    if (!ds || typeof ds === "boolean") return ds;
    let validateFlag = true;
    if (options.validate) {
      validateFlag = await ds.validate(true);
    }
    return {
      validateFlag,
      data: ds.records.map((record) => {
        const lineData = { ...record.pristineData };
        ds.fields.forEach(field => {
          lineData[field.name] = field.getValue(record);
        });
        return [record.id, lineData];
      }),
    };
  }));
  return resultData;
}

export async function extractRecordData(
  r: Record | boolean | undefined | null | boolean, options: { validate?: boolean } = {}
): Promise<{ validateFlag: boolean; data: [string | number, any]; } | boolean | undefined | null | boolean> {
  let validateFlag = true;
  if (!r || typeof r === "boolean") return r;
  if (options.validate) {
    validateFlag = await r.validate(true);
  }
  const lineData = { ...r.pristineData };
  r.dataSet.fields.forEach(field => {
    lineData[field.name] = field.getValue(r);
  });
  return {
    validateFlag,
    data: [r.id, lineData],
  };
}

/**
 * 批量初始化ds数据api，内部使用loadData处理，加载完成后，返回load后的record.id，与fromData中记录的record.id的对应关系
 * @param fromData 该参数的data属性为【id, plainData】的二维数组，其中id指代的是targetDataSets中各ds的record.id，表示该plainData与record一一对应
 * @param targetDataSets 待设置数据的dataSet集合，按顺序和fromData对应
 * @param options 选项，validate表示只设置校验通过的数据
 * @returns [string | number, string | number][][]，三维数组内部第一个索引是fromData中的ID，第二项是loadData后新record的ID
 */
export function batchInitDataSetByPlainData(
  fromData: { validateFlag: boolean; data: [string | number, any][]; }[],
  targetDataSets: (DataSet | boolean | undefined | null | boolean)[],
  options: { validate?: boolean } = {}
): [string | number, string | number][][] {
  const mappings: [string | number, string | number][][] = [];
  targetDataSets.forEach((ds: DataSet | boolean | null | undefined, index) => {
    if (!ds || typeof ds === "boolean" || !fromData[index] || options.validate && !fromData[index].validateFlag) return;
    const initRecordIdMapping: [string | number, string | number][] = [];
    // 先加载一个空的等长数组
    ds.loadData(fromData[index].data.map((d) => { return d[1]; }));
    // 直接对record.data进行赋值，不参与任何初始化逻辑
    runInAction(() => {
      // ds.records和initRecordIdMapping的长度形同且按顺序一一对应
      ds.records.forEach((r, _index) => {
        const data = fromData[index].data[_index];
        // eslint-disable-next-line prefer-destructuring
        r.data = data[1];
        initRecordIdMapping.push([data[0], r.id]);
      });
    });
    mappings.push(initRecordIdMapping);
  });
  return mappings;
}
/**
 * 批量设置ds数据api
 * @param fromData 该参数的data属性为【id, plainData】的二维数组，其中id指代的是targetDataSets中各ds的record.id，表示该plainData与record一一对应
 * @param targetDataSets 待设置数据的dataSet集合，按顺序和fromData对应
 * @param options 选项，validate表示只设置校验通过的数据
 */
export function batchSetDataSetByPlainData(
  fromData: { validateFlag: boolean; data: [string | number, any][]; }[],
  targetDataSets: [(DataSet | boolean | undefined | null | boolean), [string, (value, record, plainData) => void][]][],
  options: { validate?: boolean } = {}
) {
  targetDataSets.forEach(([ds, extraFields], index) => {
    if (!ds || typeof ds === "boolean" || !fromData[index] || options.validate && !fromData[index].validateFlag) return;
    const { data } = fromData[index];
    const dataMap = {};
    data.forEach(([recordId, d]) => {
      dataMap[recordId] = d;
    });
    ds.fields.forEach(field => {
      ds.records.forEach(r => {
        if (dataMap[r.id]) {
          r.set(field.name, dataMap[r.id][field.name]);
          if (extraFields && extraFields.length) {
            extraFields.forEach(([fieldKey, process]) => {
              process(dataMap[r.id][fieldKey], r, dataMap[r.id]);
            });
          }
        }
      });
    });
  });
}
