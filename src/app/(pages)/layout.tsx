'use client'
import Link from "next/link"
import { CircleUser, LayoutPanelLeft, Menu, Settings, ShoppingBag, Store } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useAuth } from "@/contexts/AuthContext"
import Loading from "@/components/ui/loading"
import useGet from "@/hooks/useGet"
import { useEffect, useState } from "react"
import ClientDesactived from "@/components/pages/clientDesactived/ClientDesactived"
import Image from "next/image"

export default function PagesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { logout, isLoading } = useAuth();
  const [authToken, setAuthToken] = useState<string | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('token');
    setAuthToken(token)
  }, [isLoading])

  const { data } = useGet(`${process.env.NEXT_PUBLIC_BASE_URL}/user/me`, {
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  }, [authToken]);

  useEffect(() => {
    if (data) {
      localStorage.setItem('userId', data._id)
    }
  }, [data]);

  const desactiveRoute = data?.USER_DELETED;
  if (desactiveRoute === true) {
    return <ClientDesactived user={data} authToken={authToken} />
  }

  if (isLoading) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <Loading />
      </div>
    )
  }

  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
              <Link href="/painel" className="flex items-center gap-2 font-semibold">
                <Image src="/shop.png" className="h-8 w-8" width={50} height={50} alt="shop" />
                <span className="">Mini Market</span>
              </Link>
            </div>
            <div className="flex-1">
              <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                <Link
                  href="/painel"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <LayoutPanelLeft className="h-4 w-4" />
                  Painel
                </Link>
                <Link
                  href="/mercado"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Store className="h-4 w-4" />
                  Mercado
                </Link>
                <Link
                  href="/compras"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <ShoppingBag className="h-4 w-4" />
                  Compras
                </Link>
                <Link
                  href="/configuracoes"
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                >
                  <Settings className="h-4 w-4" />
                  Configurações
                </Link>
              </nav>
            </div>
          </div>
        </div>
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <nav className="grid gap-2 text-lg font-medium">
                  <Link
                    href=""
                    className="flex items-center gap-2 text-lg font-semibold"
                  >
                    <Image src="/shop.png" className="h-8 w-8" width={50} height={50} alt="shop" />
                    <span className="">Mini Market</span>
                  </Link>
                  <Link
                    href="/painel"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <LayoutPanelLeft className="h-5 w-5" />
                    Painel
                  </Link>
                  <Link
                    href="/mercado"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Store className="h-5 w-5" />
                    Mercado
                  </Link>
                  <Link
                    href="/compras"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <ShoppingBag className="h-5 w-5" />
                    Compras
                  </Link>
                  <Link
                    href="configuracoes"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                    <Settings className="h-5 w-5" />
                    Configurações
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
            <div className="w-full flex justify-end" >
              <div className="flex items-center mr-2">
                Olá, {data?.USER_NAME}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="rounded-full">
                    <CircleUser className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{data?.USER_EMAIL}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem className="cursor-pointer" onClick={logout}>Sair</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>
          {children}
        </div>
      </div>
    </>
  );
}