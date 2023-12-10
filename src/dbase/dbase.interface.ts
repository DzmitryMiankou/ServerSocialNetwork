interface UserDataType {
  id: number;
  firstName: string;
  lastName: string;
  password: string;
  email: string;
  isActive: boolean;
  activeId: string;
}

interface FormValue<T extends string> {
  firstName: T;
  lastName: T;
  password: T;
  email: T;
}

interface RenderDataeActivateEmail<T extends string> {
  body: T;
  url: T;
  a_text: T;
  style: T;
}

export { UserDataType, FormValue, RenderDataeActivateEmail };
