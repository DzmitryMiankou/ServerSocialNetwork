interface UserDataType {
  id: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
}

interface FormValue<T extends string> {
  firstName: T;
  lastName: T;
  password: T;
  email: T;
}

export { UserDataType, FormValue };
