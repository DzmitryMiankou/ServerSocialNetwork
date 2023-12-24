export interface UserData {
  id: number;
  firstName: string;
  lastName: string;
}

export interface UserDataEmail extends UserData {
  email: string;
}

export interface UserPprivateData extends UserDataEmail {
  access_token: string;
  refresh_token: string;
}
