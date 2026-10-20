package routes.ssrc.BiddingHall.Purchase.dtos;

public static class BiddingStatus {

  private BiddingStatus() {
  }

  /**
   * 签到未开始
   */
  public static final String SIGN_NOT_START = "SIGN_NOT_START";
  /**
   * 签到中
   */
  public static final String SIGNING = "SIGNING";
  /**
   * 试竞价未开始
   */
  public static final String TRIAL_BIDDING_NOT_START = "TRIAL_BIDDING_NOT_START";
  /**
   * 试竞价中
   */
  public static final String TRIAL_BIDDING = "TRIAL_BIDDING";

  /**
   * 竞价未开始
   */
  public static final String BIDDING_NOT_START = "BIDDING_NOT_START";
  /**
   * 正式竞价中
   */
  public static final String BIDDING = "BIDDING";
  /**
   * 竞价暂停中
   */
  public static final String BIDDING_PAUSED = "BIDDING_PAUSED";
  /**
   * 补充单价未开始
   */
  public static final String SUPPLEMENT_PRICE_NOT_START = "SUPPLEMENT_PRICE_NOT_START";
  /**
   * 补充单价中
   */
  public static final String SUPPLEMENT_PRICE_BIDDING = "SUPPLEMENT_PRICE_BIDDING";
  /**
   * 竞价结束
   */
  public static final String BIDDING_END = "BIDDING_END";

}
