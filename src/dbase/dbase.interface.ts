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

export { FormValue, RenderDataeActivateEmail };
