export interface AccountInfo {
  msg: string;
  server_time: string;
  status: number;
  result: {
    email: string;
    balance: string;
    storage_used: string;
    storage_left: number;
    premim_expire: string;
  };
}

export interface RemoteUploadResponse {
  msg: string;
  server_time: string;
  new_title: string;
  status: number;
  total_slots: string;
  result: {
    filecode: string;
  };
  used_slots: string;
}
