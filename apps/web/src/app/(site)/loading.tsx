export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Loading page" className="dark flex min-h-[70vh] items-center justify-center bg-black text-foreground">
      <div className="w-64 text-center">
        <p className="font-pixel text-lg tracking-[0.2em] text-phosphor">Loading</p>
        <div className="mt-4 h-5 border-2 border-phosphor p-[3px]">
          <div className="loading-fill h-full bg-phosphor" />
        </div>
      </div>
    </div>
  )
}
