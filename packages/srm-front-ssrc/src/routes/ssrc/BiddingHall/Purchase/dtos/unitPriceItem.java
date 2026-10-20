package routes.ssrc.BiddingHall.Purchase.dtos;

public class unitPriceItem {
  
}
/**
 * 租户ID
 */
private Long tenantId;

/**
 * 询价单头ID
 */
private Long rfxHeaderId;

/**
 * 物料行ID
 */
private Long rfxLineItemId;

/**
 * 物料编码
 */
private String itemCode;

/*
 * 物料名称
 */
private String itemName;

/**
 * 展示的物料，按照一定格式展示的
 */
private String displayItem;

// 规格
private String specs;

/**
 * 起竞价
 */
private BigDecimal startingBiddingPrice;

/**
 * 报价幅度
 */
private BigDecimal quotationRange;

/**
 * 出价供应商数
 */
private Integer quotedSupplierCount;

/**
 * 报价总次数
 */
private Integer quotationCount;

/**
 * 物料分配给物料的总数
 */
private Integer assignedSupplierCount;

/**
 * 最低价，竞价的时候展示
 */
private BigDecimal minPrice;
/**
 * 最高价，拍卖的时候展示
 */
private BigDecimal maxPrice;

/**
 * 再次询价轮次
 */
private Long roundNumber;

@ApiModelProperty(value = "竞价方式(竞价大厅专用字段):SSRC.BIDDING_QUOTATION_METHOD:竞价：BIDDING；拍卖：AUCTION")
private String biddingQuotationMethod;



// 物料行展开
private Long biddingSupLineId;
private Long biddingSupHeaderId;
private String supplierCompanyNum;
private String supplierCompanyName;
private String supplierNumberPlate;
private BigDecimal firstValidQuotationSecPrice;
private BigDecimal firstValidNetSecPrice;
private BigDecimal validNetSecPrice;
private BigDecimal validQuotationSecPrice;
private Long quotationCount;
private Date quotedDate;
private BigDecimal priceCoefficient;
private Date lineQuotationStartDate;
private Date lineQuotationEndDate;
private Date headerQuotationEndDate;
private Date headerQuotationStartDate;


// 物料行状态
/**
 * 未开始
 */
public static final String BIDDING_NOT_START = "BIDDING_NOT_START";
/**
 * 进行中（包含试竞价中、正式竞价中）
 */
public static final String BIDDING_IN_PROGRESS = "BIDDING_IN_PROGRESS";

/**
 * 已完成
 */
public static final String BIDDING_END = "BIDDING_END";
/**
 * 竞价暂停中
 */
public static final String BIDDING_PAUSED = "BIDDING_PAUSED";

/**
 * 关闭
 */
public static final String BIDDING_CLOSED = "BIDDING_CLOSED";
