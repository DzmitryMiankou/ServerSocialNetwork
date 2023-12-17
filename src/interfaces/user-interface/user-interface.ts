export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
}

export interface UserPprivateData extends UserData {
  email: string;
  access_token: string;
  refresh_token: string;
}
