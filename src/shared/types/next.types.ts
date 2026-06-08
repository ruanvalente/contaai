export type PageProps<
  TParams = Record<string, string>,
  TSearchParams = Record<string, string | string[] | undefined>,
> = {
  params: Promise<TParams>;
  searchParams: Promise<TSearchParams>;
};

export type PagePropsWithSearch<
  TSearchParams = Record<string, string | string[] | undefined>,
> = {
  searchParams: Promise<TSearchParams>;
};

export type LayoutProps<TParams = Record<string, string>> = {
  params: Promise<TParams>;
  children: React.ReactNode;
};
