export type UserId = string & { readonly __brand: "UserId" };

export type User = Readonly<{
  id: UserId;
  email: string;
  name: string;
}>;
