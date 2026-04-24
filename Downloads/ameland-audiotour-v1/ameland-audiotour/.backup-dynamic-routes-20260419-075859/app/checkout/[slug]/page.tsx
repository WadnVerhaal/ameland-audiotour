type PageProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ lang?: string | string[] }>
}

export default async function Page({ params, searchParams }: PageProps) {
  const { slug } = await params
  const resolvedSearchParams = await searchParams
  const lang = Array.isArray(resolvedSearchParams.lang)
    ? resolvedSearchParams.lang[0]
    : resolvedSearchParams.lang

  return (
    <main>
      <h1>Checkout</h1>
      <p>Slug: {slug}</p>
      <p>Lang: {lang ?? 'nl'}</p>
    </main>
  )
}
