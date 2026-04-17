import Footer from '@/components/layout/Footer';
import Header from '@/components/layout/Header';

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <main className="bg-background min-h-screen">
      <div className="bg-my-background mx-auto flex max-h-screen min-h-screen w-full max-w-[393px] flex-col">
        <Header />
        <div className="bg-my-background flex flex-1">{children}</div>
        <Footer />
      </div>
    </main>
  );
}
