import Link from 'next/link'

export default function Home() {
  return (
    <div className="container relative flex-1 flex flex-col justify-center items-center">
      <Link href="/base">Base behavior</Link>
    </div>
  )
}
