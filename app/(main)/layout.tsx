export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-background min-h-screen">
      <div className="bg-my-background mx-auto flex max-h-screen min-h-screen w-full max-w-[393px] flex-col">
        {children}
      </div>
    </main>
  );
}
