import { gql } from "@apollo/client";

export const LOG_IN_TRUSTEE = gql`
  mutation SubTrusteeLogin($email: String!, $password: String!) {
    subTrusteeLogin(email: $email, password: $password) {
      token
    }
  }
`;

export const GET_USER = gql`
  query GetSubTrusteeQuery {
    getSubTrusteeQuery {
      _id
      name
      email
      phone
      logo
      role
      trustee_id
    }
  }
`;

export const GET_INSTITUTES = gql`
  query GetSubTrusteeSchools(
    $page: Float
    $limit: Float
    $kycStatus: [String!]
    $searchQuery: String
  ) {
    getSubTrusteeSchools(
      page: $page
      limit: $limit
      kycStatus: $kycStatus
      searchQuery: $searchQuery
    ) {
      total_pages
      page
      totalItems
      schools {
        school_name
        school_id
        pg_key
        email
        phone_number
        merchantStatus
        disabled_modes
        updatedAt
        gstIn
        residence_state
      }
    }
  }
`;

export const GET_TRANSACTIONS = gql`
  query GetSubtrusteeTransactionReport(
    $startDate: String
    $endDate: String
    $status: String
    $school_id: String
    $page: String
    $isCustomSearch: Boolean
    $limit: String
    $isQRCode: Boolean
    $searchFilter: String
    $searchParams: String
    $payment_modes: [String!]
    $gateway: [String!]
  ) {
    getSubtrusteeTransactionReport(
      startDate: $startDate
      endDate: $endDate
      status: $status
      school_id: $school_id
      page: $page
      isCustomSearch: $isCustomSearch
      limit: $limit
      isQRCode: $isQRCode
      searchFilter: $searchFilter
      searchParams: $searchParams
      payment_modes: $payment_modes
      gateway: $gateway
    ) {
      total_pages
      current_page
      transactionReport {
        collect_id
        payment_id
        updatedAt
        createdAt
        order_amount
        transaction_amount
        payment_method
        school_name
        school_id
        status
        student_id
        student_name
        student_email
        student_phone
        student_receipt
        bank_reference
        remarks
        details
        isAutoRefund
        isQRPayment
        commission
        custom_order_id
        payment_time
        reason
        gateway
        capture_status
        virtual_account_id
        virtual_account_number
        virtual_account_ifsc
        isVBAPaymentComplete
        utr_number
        settlement_transfer_time
        error_details {
          error_description
          error_reason
          error_source
        }
        vendors_info {
          vendor_id
          percentage
          amount
          name
          edv_vendor_id
        }
      }
    }
  }
`;

export const GET_SETTLEMENT_REPORTS = gql`
  query GetSettlementReportsSubTrustee {
    getSettlementReportsSubTrustee {
      settlementAmount
      adjustment
      netSettlementAmount
      fromDate
      tillDate
      status
      utrNumber
      settlementDate
      trustee
      schoolId
      clientId
    }
  }
`;

export const GET_SUBTRUSTEE_TRANSACTIONS_OF_SETTLEMENT = gql`
  query GetSubtrusteeSettlementsTransactions(
    $utr: String!
    $cursor: String!
    $limit: Int!
    $skip: Int!
  ) {
    getSubtrusteeSettlementsTransactions(
      utr: $utr
      cursor: $cursor
      limit: $limit
      skip: $skip
    ) {
      limit
      cursor
      settlements_transactions {
        custom_order_id
        order_id
        event_status
        event_settlement_amount
        order_amount
        event_amount
        event_time
        payment_group
        settlement_utr
        student_id
        school_name
        student_name
        student_email
        student_phone_no
        school_id
        additional_data
        payment_id
      }
    }
  }
`;

export const SUBTRUSTEE_REFUND_REQUESTS = gql`
  query GetSubTrusteeRefundRequest(
    $page: Float
    $limit: Float
    $school_id: [String!]
    $searchQuery: String
    $status: String
    $startDate: String
    $endDate: String
  ) {
    getSubTrusteeRefundRequest(
      page: $page
      limit: $limit
      searchQuery: $searchQuery
      status: $status
      startDate: $startDate
      endDate: $endDate
      school_id: $school_id
    ) {
      currentPage
      totalPages
      totalItems
      refund {
        _id
        trustee_id
        createdAt
        updatedAt
        school_id
        order_id
        status
        refund_amount
        order_amount
        transaction_amount
        school_name
        custom_id
        reason
      }
    }
  }
`;

export const GET_SINGLE_SUBTRUSTEE_TRANSACTION_INFO = gql`
  query GetSingleTransactionReportForSubTrustee(
    $collect_id: String!
    $school_id: String
    $isVBAPaymentComplete: Boolean
  ) {
    getSingleTransactionReportForSubTrustee(
      collect_id: $collect_id
      school_id: $school_id
      isVBAPaymentComplete: $isVBAPaymentComplete
    ) {
      collect_id
      payment_id
      updatedAt
      createdAt
      order_amount
      transaction_amount
      payment_method
      school_name
      school_id
      status
      student_id
      student_name
      student_email
      student_phone
      student_receipt
      bank_reference
      remarks
      details
      isAutoRefund
      isQRPayment
      commission
      custom_order_id
      payment_time
      vendors_info {
        vendor_id
        percentage
        amount
        name
        edv_vendor_id
      }
      reason
      gateway
      capture_status
      virtual_account_id
      isVBAPaymentComplete
      error_details {
        error_description
        error_reason
        error_source
      }
      virtual_account_ifsc
      virtual_account_number
      utr_number
      settlement_transfer_time
    }
  }
`;

export const GET_VENDOR_ALL_SUBTRUSTEE_TRANSACTION = gql`
  query GetAllSubtrusteeVendorTransaction(
    $page: Int!
    $limit: Int!
    $startDate: String
    $endDate: String
    $status: String
    $vendor_id: String
    $custom_id: String
    $order_id: String
    $school_id: [String!]
    $payment_modes: [String!]
    $gateway: [String!]
  ) {
    getAllSubtrusteeVendorTransaction(
      page: $page
      limit: $limit
      startDate: $startDate
      endDate: $endDate
      status: $status
      vendor_id: $vendor_id
      custom_id: $custom_id
      order_id: $order_id
      school_id: $school_id
      payment_modes: $payment_modes
      gateway: $gateway
    ) {
      totalCount
      page
      totalPages
      limit
      vendorsTransaction {
        collect_id
        custom_id
        name
        school_id
        status
        amount
        createdAt
        updatedAt
        transaction_amount
        payment_method
        gateway
        additional_data
        custom_order_id
        schoolName
      }
    }
  }
`;

export const GET_ALL_VENDOR_SUBTRUSTEE_SETTLEMENT = gql`
  query GetAllSubtrusteeVendorSettlementReport(
    $page: Int!
    $limit: Int!
    $start_date: String
    $end_date: String
    $utr: String
    $school_id: [String!]
    $vendor_id: String
  ) {
    getAllSubtrusteeVendorSettlementReport(
      page: $page
      limit: $limit
      start_date: $start_date
      end_date: $end_date
      utr: $utr
      school_id: $school_id
      vendor_id: $vendor_id
    ) {
      totalCount
      page
      totalPages
      limit
      vendor_settlements {
        _id
        school_id
        vendor_id
        trustee_id
        client_id
        utr
        adjustment
        settlement_amount
        net_settlement_amount
        vendor_transaction_amount
        payment_from
        payment_till
        settled_on
        settlement_id
        settlement_initiated_on
        status
        school_name
        vendor_name
        createdAt
        updatedAt
      }
    }
  }
`;

export const GET_SINGLE_VENDOR_TRANSACTION = gql`
  query GetSingleSubtrusteeVendorTransaction($order_id: String!) {
    getSingleSubtrusteeVendorTransaction(order_id: $order_id) {
      _id
      collect_id
      custom_id
      name
      school_id
      status
      amount
      createdAt
      updatedAt
      gateway
      additional_data
      trustee_id
      custom_order_id
      payment_method
      bank_reference
      transaction_amount
      payment_detail
      details
    }
  }
`;

export const LOGIN_TO_MERCHANT_WITH_TRUSTEE = gql`
  mutation GenerateMerchantLoginTokenForSubtrustee($email: String!) {
    generateMerchantLoginTokenForSubtrustee(email: $email)
  }
`;

export const GET_BATCH_TRANSACTION = gql`
  query GetSubtrusteeBatchTransactionReport($year: String!) {
    getSubtrusteeBatchTransactionReport(year: $year) {
      _id
      trustee_id
      total_order_amount
      total_transaction_amount
      total_transactions
      month
      year
      status
      createdAt
      updatedAt
    }
  }
`;
